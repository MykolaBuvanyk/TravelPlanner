import { useTripsStore } from '../../trips/model/trips.store';
import { usePlacesStore } from './places.store';

export async function deleteSavedPlace(placeId: string) {
  const removedFromTrips = await useTripsStore
    .getState()
    .removePlaceFromAllTrips(placeId);

  if (!removedFromTrips) return false;

  return usePlacesStore.getState().deletePlace(placeId);
}
