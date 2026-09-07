export const placeCategories = [
  'coffee',
  'restaurant',
  'museum',
  'landmark',
  'park',
  'hotel',
  'other',
] as const;

export type PlaceCategory = (typeof placeCategories)[number];

export const placeCategoryLabels: Record<PlaceCategory, string> = {
  coffee: 'Coffee',
  restaurant: 'Restaurant',
  museum: 'Museum',
  landmark: 'Landmark',
  park: 'Park',
  hotel: 'Hotel',
  other: 'Other',
};
