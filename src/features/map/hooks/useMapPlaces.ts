import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';

import { usePlacesStore } from '../../places/model/places.store';
import { useTripsStore } from '../../trips/model/trips.store';

export type MapRouteParams = { tripId?: string; placeId?: string } | undefined;

export function useMapPlaces(params: MapRouteParams) {
  const placesById = usePlacesStore(state => state.placesById);
  const placeIds = usePlacesStore(state => state.placeIds);
  const tripsById = useTripsStore(state => state.tripsById);
  const activeTripId = useTripsStore(state => state.activeTripId);
  const [tripId, setTripId] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>();
  const [cameraRevision, setCameraRevision] = useState(0);
  const routeTripId = params?.tripId;
  const routePlaceId = params?.placeId;

  useFocusEffect(useCallback(() => {
    setTripId(routeTripId);
    setSelectedId(routePlaceId);
    setCameraRevision(value => value + 1);
  }, [routeTripId, routePlaceId]));

  const trip = tripId ? tripsById[tripId] : undefined;
  const activeTrip = activeTripId ? tripsById[activeTripId] : undefined;
  const places = useMemo(() => {
    const ids = tripId ? trip?.places.map(item => item.placeId) ?? [] : placeIds;
    return ids.flatMap(id => placesById[id] ? [placesById[id]] : []);
  }, [placeIds, placesById, trip, tripId]);
  const visitedIds = useMemo(() => new Set(
    trip?.places.filter(item => item.isVisited).map(item => item.placeId),
  ), [trip]);
  const selectedPlace = places.find(place => place.id === selectedId);

  function selectTrip(id?: string) {
    setTripId(id);
    setSelectedId(undefined);
    setCameraRevision(value => value + 1);
  }

  return {
    places, trip, tripId, activeTrip, selectedPlace, visitedIds, cameraRevision,
    missingTrip: Boolean(tripId && !trip),
    missingPlace: Boolean(selectedId && !placesById[selectedId]),
    selectTrip,
    selectPlace: setSelectedId,
    fitPlaces: () => {
      setSelectedId(undefined);
      setCameraRevision(value => value + 1);
    },
  };
}
