import { getDatabase } from '../../../shared/database/database';
import type { BatchQueryCommand } from 'react-native-nitro-sqlite';
import type { Trip, TripPlace } from '../model/trip.types';

type TripRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type TripPlaceRow = {
  trip_id: string;
  place_id: string;
  is_visited: number;
  added_at: string;
};

const activeTripKey = 'active_trip_id';
const upsertTripSql = `INSERT INTO trips (id, name, created_at, updated_at)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    updated_at = excluded.updated_at`;

function tripParams(trip: Trip) {
  return [trip.id, trip.name, trip.createdAt, trip.updatedAt];
}

export async function getAllTrips() {
  const db = getDatabase();
  const [tripsResult, placesResult, activeResult] = await Promise.all([
    db.executeAsync<TripRow>('SELECT * FROM trips ORDER BY created_at DESC'),
    db.executeAsync<TripPlaceRow>(
      `SELECT trip_id, place_id, is_visited, added_at
       FROM trip_places
       ORDER BY trip_id, position`,
    ),
    db.executeAsync<{ value: string }>(
      'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
      [activeTripKey],
    ),
  ]);

  const placesByTrip = new Map<string, TripPlace[]>();
  for (const row of placesResult.rows._array) {
    const places = placesByTrip.get(row.trip_id) ?? [];
    places.push({
      placeId: row.place_id,
      isVisited: Boolean(row.is_visited),
      addedAt: row.added_at,
    });
    placesByTrip.set(row.trip_id, places);
  }

  const trips = tripsResult.rows._array.map<Trip>(row => ({
    id: row.id,
    name: row.name,
    places: placesByTrip.get(row.id) ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
  const activeTripId = activeResult.rows.item(0)?.value;

  return {
    trips,
    activeTripId:
      activeTripId && trips.some(trip => trip.id === activeTripId)
        ? activeTripId
        : (trips[0]?.id ?? null),
  };
}

export async function saveNewTrip(trip: Trip, makeActive: boolean) {
  const commands: BatchQueryCommand[] = [
    { query: upsertTripSql, params: tripParams(trip) },
  ];

  if (makeActive) {
    commands.push({
      query: `INSERT INTO app_metadata (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      params: [activeTripKey, trip.id],
    });
  }

  await getDatabase().executeBatchAsync(commands);
}

export async function saveTrips(trips: Trip[], activeTripId: string | null) {
  const commands: BatchQueryCommand[] = trips.map(trip => ({
    query: upsertTripSql,
    params: tripParams(trip),
  }));

  for (const trip of trips) {
    trip.places.forEach((place, position) => {
      commands.push({
        query: `INSERT INTO trip_places
          (trip_id, place_id, position, is_visited, added_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(trip_id, place_id) DO UPDATE SET
            position = excluded.position,
            is_visited = excluded.is_visited,
            added_at = excluded.added_at`,
        params: [
          trip.id,
          place.placeId,
          position,
          place.isVisited ? 1 : 0,
          place.addedAt,
        ],
      });
    });
  }

  if (activeTripId) {
    commands.push({
      query: `INSERT INTO app_metadata (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      params: [activeTripKey, activeTripId],
    });
  }

  if (commands.length > 0) await getDatabase().executeBatchAsync(commands);
}

export async function saveTrip(trip: Trip) {
  await getDatabase().executeAsync(upsertTripSql, tripParams(trip));
}

export async function removeTrip(tripId: string, nextActiveTripId: string | null) {
  const commands: BatchQueryCommand[] = [
    { query: 'DELETE FROM trips WHERE id = ?', params: [tripId] },
  ];

  if (nextActiveTripId) {
    commands.push({
      query: `INSERT INTO app_metadata (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      params: [activeTripKey, nextActiveTripId],
    });
  } else {
    commands.push({
      query: 'DELETE FROM app_metadata WHERE key = ?',
      params: [activeTripKey],
    });
  }

  await getDatabase().executeBatchAsync(commands);
}

export async function saveActiveTrip(tripId: string | null) {
  if (tripId) {
    await getDatabase().executeAsync(
      `INSERT INTO app_metadata (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [activeTripKey, tripId],
    );
  } else {
    await getDatabase().executeAsync('DELETE FROM app_metadata WHERE key = ?', [
      activeTripKey,
    ]);
  }
}

export async function saveTripPlace(trip: Trip, tripPlace: TripPlace) {
  await getDatabase().executeBatchAsync([
    {
      query: `INSERT INTO trip_places
        (trip_id, place_id, position, is_visited, added_at)
        VALUES (?, ?, ?, ?, ?)`,
      params: [
        trip.id,
        tripPlace.placeId,
        trip.places.length - 1,
        tripPlace.isVisited ? 1 : 0,
        tripPlace.addedAt,
      ],
    },
    { query: upsertTripSql, params: tripParams(trip) },
  ]);
}

export async function removeTripPlace(trip: Trip, placeId: string) {
  await getDatabase().executeBatchAsync([
    {
      query: 'DELETE FROM trip_places WHERE trip_id = ? AND place_id = ?',
      params: [trip.id, placeId],
    },
    ...trip.places.map((place, position) => ({
      query:
        'UPDATE trip_places SET position = ? WHERE trip_id = ? AND place_id = ?',
      params: [position, trip.id, place.placeId],
    })),
    { query: upsertTripSql, params: tripParams(trip) },
  ]);
}

export async function removePlaceFromEveryTrip(
  placeId: string,
  updatedTrips: Trip[],
) {
  const commands: BatchQueryCommand[] = [
    { query: 'DELETE FROM trip_places WHERE place_id = ?', params: [placeId] },
  ];

  for (const trip of updatedTrips) {
    commands.push({ query: upsertTripSql, params: tripParams(trip) });
    trip.places.forEach((place, position) => {
      commands.push({
        query:
          'UPDATE trip_places SET position = ? WHERE trip_id = ? AND place_id = ?',
        params: [position, trip.id, place.placeId],
      });
    });
  }

  await getDatabase().executeBatchAsync(commands);
}

export async function saveVisitedState(trip: Trip, tripPlace: TripPlace) {
  await getDatabase().executeBatchAsync([
    {
      query: `UPDATE trip_places SET is_visited = ?
        WHERE trip_id = ? AND place_id = ?`,
      params: [tripPlace.isVisited ? 1 : 0, trip.id, tripPlace.placeId],
    },
    { query: upsertTripSql, params: tripParams(trip) },
  ]);
}

export async function saveTripOrder(trip: Trip) {
  await getDatabase().executeBatchAsync([
    ...trip.places.map((place, position) => ({
      query:
        'UPDATE trip_places SET position = ? WHERE trip_id = ? AND place_id = ?',
      params: [position, trip.id, place.placeId],
    })),
    { query: upsertTripSql, params: tripParams(trip) },
  ]);
}
