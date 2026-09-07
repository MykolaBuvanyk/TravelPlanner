import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createAppStorage, storageKeys } from '../../../shared/storage/storage';
import { persistedTripsSchema } from './trips.persistence';
import { usePlacesStore } from '../../places/model/places.store';
import { createId } from '../../../shared/utils/createId';
import {
  createTripSchema,
  renameTripSchema,
  type CreateTripInput,
  type RenameTripInput,
} from './trip.schema';
import type { Trip, TripPlace } from './trip.types';

type PersistedTripsState = Pick<
  TripsState,
  'tripsById' | 'tripIds' | 'activeTripId'
>;

export type TripsState = {
  tripsById: Record<string, Trip>;
  tripIds: string[];
  activeTripId: string | null;
  hasHydrated: boolean;
  createTrip: (input: CreateTripInput) => Trip;
  renameTrip: (tripId: string, input: RenameTripInput) => void;
  deleteTrip: (tripId: string) => void;
  setActiveTrip: (tripId: string | null) => void;
  addPlaceToTrip: (tripId: string, placeId: string) => boolean;
  removePlaceFromTrip: (tripId: string, placeId: string) => void;
  removePlaceFromAllTrips: (placeId: string) => void;
  togglePlaceVisited: (tripId: string, placeId: string) => void;
  reorderPlaces: (tripId: string, fromIndex: number, toIndex: number) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

function updateTrip(
  trip: Trip,
  update: Partial<Omit<Trip, 'id' | 'createdAt'>>,
): Trip {
  return {
    ...trip,
    ...update,
    updatedAt: new Date().toISOString(),
  };
}

export const useTripsStore = create<TripsState>()(
  persist(
    (set, get) => ({
      tripsById: {},
      tripIds: [],
      activeTripId: null,
      hasHydrated: false,
      createTrip: input => {
        const parsedInput = createTripSchema.parse(input);
        const timestamp = new Date().toISOString();
        const trip: Trip = {
          id: createId('trip'),
          name: parsedInput.name,
          places: [],
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set(state => ({
          tripsById: { ...state.tripsById, [trip.id]: trip },
          tripIds: [trip.id, ...state.tripIds],
          activeTripId: state.activeTripId ?? trip.id,
        }));

        return trip;
      },
      renameTrip: (tripId, input) => {
        const trip = get().tripsById[tripId];

        if (!trip) {
          return;
        }

        const { name } = renameTripSchema.parse(input);

        set(state => ({
          tripsById: {
            ...state.tripsById,
            [tripId]: updateTrip(trip, { name }),
          },
        }));
      },
      deleteTrip: tripId => {
        const { tripsById, tripIds, activeTripId } = get();

        if (!tripsById[tripId]) {
          return;
        }

        const { [tripId]: _, ...remainingTrips } = tripsById;
        const remainingTripIds = tripIds.filter(id => id !== tripId);

        set({
          tripsById: remainingTrips,
          tripIds: remainingTripIds,
          activeTripId:
            activeTripId === tripId
              ? (remainingTripIds[0] ?? null)
              : activeTripId,
        });
      },
      setActiveTrip: tripId => {
        if (tripId !== null && !get().tripsById[tripId]) {
          return;
        }

        set({ activeTripId: tripId });
      },
      addPlaceToTrip: (tripId, placeId) => {
        const trip = get().tripsById[tripId];

        if (
          !trip ||
          !usePlacesStore.getState().placesById[placeId] ||
          trip.places.some(place => place.placeId === placeId)
        ) {
          return false;
        }

        const tripPlace: TripPlace = {
          placeId,
          isVisited: false,
          addedAt: new Date().toISOString(),
        };

        set(state => ({
          tripsById: {
            ...state.tripsById,
            [tripId]: updateTrip(trip, {
              places: [...trip.places, tripPlace],
            }),
          },
        }));

        return true;
      },
      removePlaceFromTrip: (tripId, placeId) => {
        const trip = get().tripsById[tripId];

        if (!trip || !trip.places.some(place => place.placeId === placeId)) {
          return;
        }

        set(state => ({
          tripsById: {
            ...state.tripsById,
            [tripId]: updateTrip(trip, {
              places: trip.places.filter(place => place.placeId !== placeId),
            }),
          },
        }));
      },
      removePlaceFromAllTrips: placeId => {
        set(state => {
          const tripsById = Object.fromEntries(
            Object.entries(state.tripsById).map(([tripId, trip]) => {
              const places = trip.places.filter(
                place => place.placeId !== placeId,
              );

              return [
                tripId,
                places.length === trip.places.length
                  ? trip
                  : updateTrip(trip, { places }),
              ];
            }),
          );

          return { tripsById };
        });
      },
      togglePlaceVisited: (tripId, placeId) => {
        const trip = get().tripsById[tripId];

        if (!trip) {
          return;
        }

        const tripPlace = trip.places.find(place => place.placeId === placeId);

        if (!tripPlace) {
          return;
        }

        set(state => ({
          tripsById: {
            ...state.tripsById,
            [tripId]: updateTrip(trip, {
              places: trip.places.map(place =>
                place.placeId === placeId
                  ? { ...place, isVisited: !place.isVisited }
                  : place,
              ),
            }),
          },
        }));
      },
      reorderPlaces: (tripId, fromIndex, toIndex) => {
        const trip = get().tripsById[tripId];

        if (!trip) {
          return;
        }

        const isValidIndex = (index: number) =>
          Number.isInteger(index) && index >= 0 && index < trip.places.length;

        if (!isValidIndex(fromIndex) || !isValidIndex(toIndex)) {
          return;
        }

        const places = [...trip.places];
        const [movedPlace] = places.splice(fromIndex, 1);

        if (!movedPlace) {
          return;
        }

        places.splice(toIndex, 0, movedPlace);

        set(state => ({
          tripsById: {
            ...state.tripsById,
            [tripId]: updateTrip(trip, { places }),
          },
        }));
      },
      setHasHydrated: hasHydrated => set({ hasHydrated }),
    }),
    {
      name: storageKeys.trips,
      storage: createAppStorage<PersistedTripsState>(),
      skipHydration: true,
      merge: (saved, current) => {
        const data = persistedTripsSchema.parse(
          saved ?? { tripsById: {}, tripIds: [], activeTripId: null },
        );
        const places = usePlacesStore.getState().placesById;
        for (const trip of Object.values(data.tripsById)) {
          trip.places = trip.places.filter(item =>
            Boolean(places[item.placeId]),
          );
        }
        return { ...current, ...data };
      },
      migrate: () => {
        throw new Error('Unsupported saved trips version.');
      },
      version: 1,
      partialize: ({
        tripsById,
        tripIds,
        activeTripId,
      }): PersistedTripsState => ({
        tripsById,
        tripIds,
        activeTripId,
      }),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
