import { create } from 'zustand';

import {
  getAllPlaces,
  removePlace,
  savePlace,
} from '../data/places.repository';
import { runDatabaseWrite } from '../../../shared/database/database';
import { createId } from '../../../shared/utils/createId';
import {
  createPlaceSchema,
  updatePlaceSchema,
  type CreatePlaceInput,
  type UpdatePlaceInput,
} from './place.schema';
import type { Place } from './place.types';

export type PlacesState = {
  placesById: Record<string, Place>;
  placeIds: string[];
  hasHydrated: boolean;
  hydrate: () => Promise<void>;
  createPlace: (input: CreatePlaceInput) => Promise<Place | null>;
  updatePlace: (placeId: string, input: UpdatePlaceInput) => Promise<boolean>;
  deletePlace: (placeId: string) => Promise<boolean>;
  toggleFavorite: (placeId: string) => Promise<boolean>;
};

export const usePlacesStore = create<PlacesState>((set, get) => ({
  placesById: {},
  placeIds: [],
  hasHydrated: false,
  hydrate: async () => {
    const places = await getAllPlaces();
    set({
      placesById: Object.fromEntries(places.map(place => [place.id, place])),
      placeIds: places.map(place => place.id),
      hasHydrated: true,
    });
  },
  createPlace: async input => {
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

    if (!(await runDatabaseWrite(() => savePlace(place)))) return null;

    set(state => ({
      placesById: { ...state.placesById, [place.id]: place },
      placeIds: [place.id, ...state.placeIds],
    }));
    return place;
  },
  updatePlace: async (placeId, input) => {
    const currentPlace = get().placesById[placeId];
    if (!currentPlace) return false;

    const parsedInput = updatePlaceSchema.parse(input);
    const updatedPlace: Place = {
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
        parsedInput.notes === undefined ? currentPlace.notes : parsedInput.notes,
      externalId:
        parsedInput.externalId === undefined
          ? currentPlace.externalId
          : parsedInput.externalId,
      updatedAt: new Date().toISOString(),
    };

    if (!(await runDatabaseWrite(() => savePlace(updatedPlace)))) return false;
    set(state => ({
      placesById: { ...state.placesById, [placeId]: updatedPlace },
    }));
    return true;
  },
  deletePlace: async placeId => {
    const { placesById, placeIds } = get();
    if (!placesById[placeId]) return false;
    if (!(await runDatabaseWrite(() => removePlace(placeId)))) return false;

    const remainingPlaces = { ...placesById };
    delete remainingPlaces[placeId];
    set({
      placesById: remainingPlaces,
      placeIds: placeIds.filter(id => id !== placeId),
    });
    return true;
  },
  toggleFavorite: async placeId => {
    const currentPlace = get().placesById[placeId];
    if (!currentPlace) return false;

    const updatedPlace: Place = {
      ...currentPlace,
      isFavorite: !currentPlace.isFavorite,
      updatedAt: new Date().toISOString(),
    };
    if (!(await runDatabaseWrite(() => savePlace(updatedPlace)))) return false;
    set(state => ({
      placesById: { ...state.placesById, [placeId]: updatedPlace },
    }));
    return true;
  },
}));
