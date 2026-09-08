import { create } from 'zustand';

import { runDatabaseWrite } from '../../../shared/database/database';
import { createId } from '../../../shared/utils/createId';
import { usePlacesStore } from '../../places/model/places.store';
import {
  getAllTrips,
  removePlaceFromEveryTrip,
  removeTrip,
  removeTripPlace,
  saveActiveTrip,
  saveNewTrip,
  saveTrip,
  saveTripOrder,
  saveTripPlace,
  saveVisitedState,
} from '../data/trips.repository';
import {
  createTripSchema,
  renameTripSchema,
  type CreateTripInput,
  type RenameTripInput,
} from './trip.schema';
import type { Trip, TripPlace } from './trip.types';

export type TripsState = {
  tripsById: Record<string, Trip>;
  tripIds: string[];
  activeTripId: string | null;
  hasHydrated: boolean;
  hydrate: () => Promise<void>;
  createTrip: (input: CreateTripInput) => Promise<Trip | null>;
  renameTrip: (tripId: string, input: RenameTripInput) => Promise<boolean>;
  deleteTrip: (tripId: string) => Promise<boolean>;
  setActiveTrip: (tripId: string | null) => Promise<boolean>;
  addPlaceToTrip: (tripId: string, placeId: string) => Promise<boolean>;
  removePlaceFromTrip: (tripId: string, placeId: string) => Promise<boolean>;
  removePlaceFromAllTrips: (placeId: string) => Promise<boolean>;
  togglePlaceVisited: (tripId: string, placeId: string) => Promise<boolean>;
  reorderPlaces: (tripId: string, fromIndex: number, toIndex: number) => Promise<boolean>;
};

function updateTrip(
  trip: Trip,
  update: Partial<Omit<Trip, 'id' | 'createdAt'>>,
): Trip {
  return { ...trip, ...update, updatedAt: new Date().toISOString() };
}

export const useTripsStore = create<TripsState>((set, get) => ({
  tripsById: {},
  tripIds: [],
  activeTripId: null,
  hasHydrated: false,
  hydrate: async () => {
    const { trips, activeTripId } = await getAllTrips();
    set({
      tripsById: Object.fromEntries(trips.map(trip => [trip.id, trip])),
      tripIds: trips.map(trip => trip.id),
      activeTripId,
      hasHydrated: true,
    });
  },
  createTrip: async input => {
    const { name } = createTripSchema.parse(input);
    const timestamp = new Date().toISOString();
    const trip: Trip = {
      id: createId('trip'),
      name,
      places: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const makeActive = get().activeTripId === null;
    if (!(await runDatabaseWrite(() => saveNewTrip(trip, makeActive)))) {
      return null;
    }

    set(state => ({
      tripsById: { ...state.tripsById, [trip.id]: trip },
      tripIds: [trip.id, ...state.tripIds],
      activeTripId: state.activeTripId ?? trip.id,
    }));
    return trip;
  },
  renameTrip: async (tripId, input) => {
    const trip = get().tripsById[tripId];
    if (!trip) return false;
    const { name } = renameTripSchema.parse(input);
    const updatedTrip = updateTrip(trip, { name });
    if (!(await runDatabaseWrite(() => saveTrip(updatedTrip)))) return false;
    set(state => ({
      tripsById: { ...state.tripsById, [tripId]: updatedTrip },
    }));
    return true;
  },
  deleteTrip: async tripId => {
    const { tripsById, tripIds, activeTripId } = get();
    if (!tripsById[tripId]) return false;
    const remainingTripIds = tripIds.filter(id => id !== tripId);
    const nextActiveTripId =
      activeTripId === tripId ? (remainingTripIds[0] ?? null) : activeTripId;
    if (!(await runDatabaseWrite(() => removeTrip(tripId, nextActiveTripId)))) {
      return false;
    }

    const remainingTrips = { ...tripsById };
    delete remainingTrips[tripId];
    set({
      tripsById: remainingTrips,
      tripIds: remainingTripIds,
      activeTripId: nextActiveTripId,
    });
    return true;
  },
  setActiveTrip: async tripId => {
    if (tripId !== null && !get().tripsById[tripId]) return false;
    if (!(await runDatabaseWrite(() => saveActiveTrip(tripId)))) return false;
    set({ activeTripId: tripId });
    return true;
  },
  addPlaceToTrip: async (tripId, placeId) => {
    const trip = get().tripsById[tripId];
    if (
      !trip ||
      !usePlacesStore.getState().placesById[placeId] ||
      trip.places.some(place => place.placeId === placeId)
    ) return false;

    const tripPlace: TripPlace = {
      placeId,
      isVisited: false,
      addedAt: new Date().toISOString(),
    };
    const updatedTrip = updateTrip(trip, {
      places: [...trip.places, tripPlace],
    });
    if (!(await runDatabaseWrite(() => saveTripPlace(updatedTrip, tripPlace)))) {
      return false;
    }
    set(state => ({
      tripsById: { ...state.tripsById, [tripId]: updatedTrip },
    }));
    return true;
  },
  removePlaceFromTrip: async (tripId, placeId) => {
    const trip = get().tripsById[tripId];
    if (!trip || !trip.places.some(place => place.placeId === placeId)) {
      return false;
    }
    const updatedTrip = updateTrip(trip, {
      places: trip.places.filter(place => place.placeId !== placeId),
    });
    if (!(await runDatabaseWrite(() => removeTripPlace(updatedTrip, placeId)))) {
      return false;
    }
    set(state => ({
      tripsById: { ...state.tripsById, [tripId]: updatedTrip },
    }));
    return true;
  },
  removePlaceFromAllTrips: async placeId => {
    const timestamp = new Date().toISOString();
    const tripsById = Object.fromEntries(
      Object.entries(get().tripsById).map(([tripId, trip]) => {
        const places = trip.places.filter(place => place.placeId !== placeId);
        return [
          tripId,
          places.length === trip.places.length
            ? trip
            : { ...trip, places, updatedAt: timestamp },
        ];
      }),
    );
    const updatedTrips = Object.values(tripsById).filter(
      trip => trip.updatedAt === timestamp,
    );
    if (!(await runDatabaseWrite(() =>
      removePlaceFromEveryTrip(placeId, updatedTrips),
    ))) {
      return false;
    }
    set({ tripsById });
    return true;
  },
  togglePlaceVisited: async (tripId, placeId) => {
    const trip = get().tripsById[tripId];
    const tripPlace = trip?.places.find(place => place.placeId === placeId);
    if (!trip || !tripPlace) return false;
    const updatedPlace = { ...tripPlace, isVisited: !tripPlace.isVisited };
    const updatedTrip = updateTrip(trip, {
      places: trip.places.map(place =>
        place.placeId === placeId ? updatedPlace : place,
      ),
    });
    if (!(await runDatabaseWrite(() =>
      saveVisitedState(updatedTrip, updatedPlace),
    ))) {
      return false;
    }
    set(state => ({
      tripsById: { ...state.tripsById, [tripId]: updatedTrip },
    }));
    return true;
  },
  reorderPlaces: async (tripId, fromIndex, toIndex) => {
    const trip = get().tripsById[tripId];
    if (!trip) return false;
    const isValidIndex = (index: number) =>
      Number.isInteger(index) && index >= 0 && index < trip.places.length;
    if (!isValidIndex(fromIndex) || !isValidIndex(toIndex)) return false;

    const places = [...trip.places];
    const [movedPlace] = places.splice(fromIndex, 1);
    if (!movedPlace) return false;
    places.splice(toIndex, 0, movedPlace);
    const updatedTrip = updateTrip(trip, { places });
    if (!(await runDatabaseWrite(() => saveTripOrder(updatedTrip)))) {
      return false;
    }
    set(state => ({
      tripsById: { ...state.tripsById, [tripId]: updatedTrip },
    }));
    return true;
  },
}));
