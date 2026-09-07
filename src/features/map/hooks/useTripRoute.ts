import { useQuery } from '@tanstack/react-query';

import { getDrivingRoute } from '../../../api/routes';
import type { Place } from '../../places/model/place.types';

export function useTripRoute(
  tripId: string | undefined,
  places: Place[],
  isEnabled: boolean,
) {
  const coordinatesKey = places
    .map(
      place => `${place.coordinates.latitude},${place.coordinates.longitude}`,
    )
    .join(';');

  return useQuery({
    queryKey: ['trips', tripId, 'driving-route', coordinatesKey],
    queryFn: () => getDrivingRoute(places.map(place => place.coordinates)),
    enabled: isEnabled && Boolean(tripId) && places.length >= 2,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}
