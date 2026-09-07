import { Share } from 'react-native';

import type { Place } from '../../places/model/place.types';
import type { Trip } from './trip.types';

function formatTripMessage(trip: Trip, placesById: Record<string, Place>) {
  const visitedCount = trip.places.filter(place => place.isVisited).length;
  const itinerary = trip.places.map((tripPlace, index) => {
    const place = placesById[tripPlace.placeId];
    const status = tripPlace.isVisited ? '✓' : '○';

    return place
      ? `${status} ${index + 1}. ${place.name}`
      : `${status} ${index + 1}. Removed place`;
  });

  return [
    trip.name,
    `${visitedCount} of ${trip.places.length} places visited`,
    '',
    'Itinerary',
    itinerary.length ? itinerary.join('\n') : 'No places added yet.',
    '',
    'Shared from Travel Planner',
  ].join('\n');
}

export async function shareTrip(trip: Trip, placesById: Record<string, Place>) {
  await Share.share({
    title: trip.name,
    message: formatTripMessage(trip, placesById),
  });
}
