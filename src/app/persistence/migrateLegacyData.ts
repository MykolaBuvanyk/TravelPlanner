import {
  getMetadata,
  setMetadata,
} from '../../shared/database/database';
import {
  legacyStorageKeys,
  readLegacyStore,
  removeLegacyData,
} from '../../shared/database/legacyAsyncStorage';
import { savePlaces } from '../../features/places/data/places.repository';
import { persistedPlacesSchema } from '../../features/places/model/places.persistence';
import { saveTrips } from '../../features/trips/data/trips.repository';
import { persistedTripsSchema } from '../../features/trips/model/trips.persistence';

const migrationKey = 'async_storage_migration_v1';

function readPersistedState(value: string | null) {
  if (!value) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }

  if (!parsed || typeof parsed !== 'object' || !('state' in parsed)) {
    return undefined;
  }

  return (parsed as { state: unknown }).state;
}

export async function migrateLegacyData() {
  if ((await getMetadata(migrationKey)) === 'complete') return;

  const [placesValue, tripsValue] = await Promise.all([
    readLegacyStore(legacyStorageKeys.places),
    readLegacyStore(legacyStorageKeys.trips),
  ]);

  const placesResult = persistedPlacesSchema.safeParse(
    readPersistedState(placesValue),
  );
  const places = placesResult.success
    ? placesResult.data.placeIds.map(id => placesResult.data.placesById[id])
    : [];
  await savePlaces(places);

  const validPlaceIds = new Set(places.map(place => place.id));
  const tripsResult = persistedTripsSchema.safeParse(
    readPersistedState(tripsValue),
  );
  const trips = tripsResult.success
    ? tripsResult.data.tripIds.map(id => ({
        ...tripsResult.data.tripsById[id],
        places: tripsResult.data.tripsById[id].places.filter(place =>
          validPlaceIds.has(place.placeId),
        ),
      }))
    : [];
  const activeTripId =
    tripsResult.success &&
    trips.some(trip => trip.id === tripsResult.data.activeTripId)
      ? tripsResult.data.activeTripId
      : (trips[0]?.id ?? null);
  await saveTrips(trips, activeTripId);

  await setMetadata(migrationKey, 'complete');

  try {
    await removeLegacyData();
  } catch {
    // SQLite already owns the migrated data. Legacy cleanup can be skipped.
  }
}
