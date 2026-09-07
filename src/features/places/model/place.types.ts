import type {PlaceCategory} from './place.constants';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type PlaceSource = 'manual' | 'nominatim';

export type Place = {
  id: string;
  name: string;
  address: string | null;
  description: string | null;
  notes: string | null;
  category: PlaceCategory;
  coordinates: Coordinates;
  isFavorite: boolean;
  source: PlaceSource;
  externalId: string | null;
  createdAt: string;
  updatedAt: string;
};
