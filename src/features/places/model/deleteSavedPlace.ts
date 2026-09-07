import { useTripsStore } from '../../trips/model/trips.store';
import { usePlacesStore } from './places.store';

export function deleteSavedPlace(placeId: string) {
  useTripsStore.getState().removePlaceFromAllTrips(placeId);
  usePlacesStore.getState().deletePlace(placeId);
}
