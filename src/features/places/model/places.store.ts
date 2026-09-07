import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createAppStorage, storageKeys } from '../../../shared/storage/storage';
import { persistedPlacesSchema } from './places.persistence';
import { createId } from '../../../shared/utils/createId';
import {
  createPlaceSchema,
  updatePlaceSchema,
  type CreatePlaceInput,
  type UpdatePlaceInput,
} from './place.schema';
import type { Place } from './place.types';

type PersistedPlacesState = Pick<PlacesState, 'placesById' | 'placeIds'>;

export type PlacesState = {
  placesById: Record<string, Place>;
  placeIds: string[];
  hasHydrated: boolean;
  createPlace: (input: CreatePlaceInput) => Place;
  updatePlace: (placeId: string, input: UpdatePlaceInput) => void;
  deletePlace: (placeId: string) => void;
  toggleFavorite: (placeId: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const usePlacesStore = create<PlacesState>()(
  persist(
    (set, get) => ({
      placesById: {},
      placeIds: [],
      hasHydrated: false,
      createPlace: input => {
        const parsedInput = createPlaceSchema.parse(input);
        const timestamp = new Date().toISOString();
        const place: Place = {
          id: createId('place'),
          name: parsedInput.name,
          address: parsedInput.address ?? null,
          description: parsedInput.description ?? null,
          notes: parsedInput.notes ?? null,
          category: parsedInput.category,
          coordinates: parsedInput.coordinates,
          isFavorite: false,
          source: parsedInput.source,
          externalId: parsedInput.externalId ?? null,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set(state => ({
          placesById: { ...state.placesById, [place.id]: place },
          placeIds: [place.id, ...state.placeIds],
        }));

        return place;
      },
      updatePlace: (placeId, input) => {
        const currentPlace = get().placesById[placeId];

        if (!currentPlace) {
          return;
        }

        const parsedInput = updatePlaceSchema.parse(input);

        set(state => ({
          placesById: {
            ...state.placesById,
            [placeId]: {
              ...currentPlace,
              name: parsedInput.name ?? currentPlace.name,
              category: parsedInput.category ?? currentPlace.category,
              coordinates: parsedInput.coordinates ?? currentPlace.coordinates,
              address:
                parsedInput.address === undefined
                  ? currentPlace.address
                  : parsedInput.address,
              description:
                parsedInput.description === undefined
                  ? currentPlace.description
                  : parsedInput.description,
              notes:
                parsedInput.notes === undefined
                  ? currentPlace.notes
                  : parsedInput.notes,
              externalId:
                parsedInput.externalId === undefined
                  ? currentPlace.externalId
                  : parsedInput.externalId,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },
      deletePlace: placeId => {
        const { placesById, placeIds } = get();

        if (!placesById[placeId]) {
          return;
        }

        const { [placeId]: _, ...remainingPlaces } = placesById;

        set({
          placesById: remainingPlaces,
          placeIds: placeIds.filter(id => id !== placeId),
        });
      },
      toggleFavorite: placeId => {
        const currentPlace = get().placesById[placeId];

        if (!currentPlace) {
          return;
        }

        set(state => ({
          placesById: {
            ...state.placesById,
            [placeId]: {
              ...currentPlace,
              isFavorite: !currentPlace.isFavorite,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },
      setHasHydrated: hasHydrated => set({ hasHydrated }),
    }),
    {
      name: storageKeys.places,
      storage: createAppStorage<PersistedPlacesState>(),
      skipHydration: true,
      merge: (saved, current) => ({
        ...current,
        ...persistedPlacesSchema.parse(
          saved ?? { placesById: {}, placeIds: [] },
        ),
      }),
      migrate: () => {
        throw new Error('Unsupported saved places version.');
      },
      version: 1,
      partialize: ({ placesById, placeIds }): PersistedPlacesState => ({
        placesById,
        placeIds,
      }),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
