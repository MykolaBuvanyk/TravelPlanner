import { PositionError, type GeoError } from 'react-native-geolocation-service';

export type CurrentLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type CoordinatesLike = Pick<CurrentLocation, 'latitude' | 'longitude'>;

const earthRadiusMeters = 6_371_000;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function getDistanceMeters(
  origin: CoordinatesLike,
  destination: CoordinatesLike,
) {
  const latitudeDifference = toRadians(destination.latitude - origin.latitude);
  const longitudeDifference = toRadians(
    destination.longitude - origin.longitude,
  );
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    2 *
    earthRadiusMeters *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1_000) {
    return `${Math.round(distanceMeters)} m`;
  }

  const distanceKilometers = distanceMeters / 1_000;

  return `${distanceKilometers.toFixed(distanceKilometers < 10 ? 1 : 0)} km`;
}

export function formatDuration(durationSeconds: number) {
  const totalMinutes = Math.max(1, Math.round(durationSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours ? `${hours} h ${minutes} min` : `${minutes} min`;
}

export type LocationError = {
  title: string;
  description: string;
};

export function toCurrentLocation({
  coords,
}: {
  coords: CurrentLocation;
}): CurrentLocation {
  return coords;
}

export function getLocationError(error: unknown): LocationError {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? (error as GeoError).code
      : undefined;

  switch (code) {
    case PositionError.PERMISSION_DENIED:
      return {
        title: 'Location permission needed',
        description: 'Allow location access to use your current position.',
      };
    case PositionError.SETTINGS_NOT_SATISFIED:
      return {
        title: 'Turn on location services',
        description: 'Enable location services on your device and try again.',
      };
    case PositionError.TIMEOUT:
      return {
        title: 'Location timed out',
        description: 'Your position took too long to load. Try again.',
      };
    default:
      return {
        title: 'Location unavailable',
        description:
          'Your current position is not available right now. Try again later.',
      };
  }
}
