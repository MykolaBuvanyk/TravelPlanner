import type {PlaceCategory} from './place.constants';
import type {PlacesState} from './places.store';
import type {Place} from './place.types';

export function selectPlaces(state: PlacesState): Place[] {
  return state.placeIds.flatMap((placeId) => {
    const place = state.placesById[placeId];

    return place ? [place] : [];
  });
}

export function selectPlaceById(
  state: PlacesState,
  placeId: string,
): Place | undefined {
  return state.placesById[placeId];
}

export function selectFavoritePlaces(state: PlacesState): Place[] {
  return selectPlaces(state).filter((place) => place.isFavorite);
}

export function selectPlacesByCategory(
  state: PlacesState,
  category: PlaceCategory,
): Place[] {
  return selectPlaces(state).filter((place) => place.category === category);
}
