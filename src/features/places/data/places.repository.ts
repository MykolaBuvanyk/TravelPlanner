import { getDatabase } from '../../../shared/database/database';
import { persistedPlaceSchema } from '../model/places.persistence';
import type { Place } from '../model/place.types';

type PlaceRow = {
  id: string;
  name: string;
  address: string | null;
  description: string | null;
  notes: string | null;
  category: string;
  latitude: number;
  longitude: number;
  is_favorite: number;
  source: string;
  external_id: string | null;
  created_at: string;
  updated_at: string;
};

function fromRow(row: PlaceRow): Place {
  return persistedPlaceSchema.parse({
    id: row.id,
    name: row.name,
    address: row.address,
    description: row.description,
    notes: row.notes,
    category: row.category,
    coordinates: {
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    },
    isFavorite: Boolean(row.is_favorite),
    source: row.source,
    externalId: row.external_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

const upsertPlaceSql = `INSERT INTO places (
  id, name, address, description, notes, category, latitude, longitude,
  is_favorite, source, external_id, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  address = excluded.address,
  description = excluded.description,
  notes = excluded.notes,
  category = excluded.category,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  is_favorite = excluded.is_favorite,
  source = excluded.source,
  external_id = excluded.external_id,
  updated_at = excluded.updated_at`;

function toParams(place: Place) {
  return [
    place.id,
    place.name,
    place.address,
    place.description,
    place.notes,
    place.category,
    place.coordinates.latitude,
    place.coordinates.longitude,
    place.isFavorite ? 1 : 0,
    place.source,
    place.externalId,
    place.createdAt,
    place.updatedAt,
  ];
}

export async function getAllPlaces() {
  const result = await getDatabase().executeAsync<PlaceRow>(
    'SELECT * FROM places ORDER BY created_at DESC',
  );

  return result.rows._array.map(fromRow);
}

export async function savePlace(place: Place) {
  await getDatabase().executeAsync(upsertPlaceSql, toParams(place));
}

export async function savePlaces(places: Place[]) {
  if (places.length === 0) return;

  await getDatabase().executeBatchAsync([
    { query: upsertPlaceSql, params: places.map(toParams) },
  ]);
}

export async function removePlace(placeId: string) {
  await getDatabase().executeAsync('DELETE FROM places WHERE id = ?', [placeId]);
}
