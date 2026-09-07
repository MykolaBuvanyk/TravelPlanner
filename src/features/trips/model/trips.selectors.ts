import type {TripsState} from './trips.store';
import type {Trip, TripProgress} from './trip.types';

export function selectTrips(state: TripsState): Trip[] {
  return state.tripIds.flatMap((tripId) => {
    const trip = state.tripsById[tripId];

    return trip ? [trip] : [];
  });
}

export function selectTripById(
  state: TripsState,
  tripId: string,
): Trip | undefined {
  return state.tripsById[tripId];
}

export function selectActiveTrip(state: TripsState): Trip | undefined {
  return state.activeTripId
    ? selectTripById(state, state.activeTripId)
    : undefined;
}

export function selectTripProgress(trip: Trip): TripProgress {
  const total = trip.places.length;
  const visited = trip.places.filter((place) => place.isVisited).length;

  return {
    total,
    visited,
    percentage: total === 0 ? 0 : Math.round((visited / total) * 100),
  };
}
