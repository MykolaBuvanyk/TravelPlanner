import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Geolocation, {
  type GeoPosition,
} from 'react-native-geolocation-service';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';

import {
  getLocationError,
  toCurrentLocation,
  type CurrentLocation,
  type LocationError,
} from '../utils/location';

export type LocationState =
  | { status: 'idle'; location?: CurrentLocation }
  | { status: 'loading'; location?: CurrentLocation }
  | { status: 'ready'; location: CurrentLocation }
  | { status: 'denied'; location?: CurrentLocation; error: LocationError }
  | { status: 'blocked'; location?: CurrentLocation; error: LocationError }
  | { status: 'unavailable'; location?: CurrentLocation; error: LocationError }
  | { status: 'error'; location?: CurrentLocation; error: LocationError };

const locationPermission =
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

const permissionError = {
  denied: {
    title: 'Location permission needed',
    description: 'Allow location access to use your current position.',
  },
  blocked: {
    title: 'Location permission blocked',
    description:
      'Enable location access in Settings to use your current position.',
  },
  unavailable: {
    title: 'Location unavailable',
    description: 'Location is not available on this device.',
  },
} as const;

type PositionOptions = NonNullable<
  Parameters<typeof Geolocation.getCurrentPosition>[2]
>;

function requestPosition(options: PositionOptions): Promise<CurrentLocation> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position: GeoPosition) => resolve(toCurrentLocation(position)),
      reject,
      options,
    );
  });
}

function getCachedPosition() {
  return requestPosition({
    accuracy: { android: 'balanced', ios: 'hundredMeters' },
    enableHighAccuracy: false,
    timeout: 2_000,
    maximumAge: 24 * 60 * 60 * 1_000,
    showLocationDialog: true,
    forceLocationManager: false,
  });
}

function getFreshPosition() {
  return requestPosition({
    accuracy: { android: 'high', ios: 'best' },
    enableHighAccuracy: true,
    timeout: 12_000,
    maximumAge: 60_000,
    showLocationDialog: true,
    forceRequestLocation: true,
    forceLocationManager: false,
  });
}

export function useCurrentLocation() {
  const [state, setState] = useState<LocationState>({ status: 'idle' });
  const requestIdRef = useRef(0);

  const refreshPermission = useCallback(async () => {
    try {
      const result = await check(locationPermission);

      if (result === RESULTS.UNAVAILABLE) {
        setState(previous => ({
          ...previous,
          status: 'unavailable',
          error: permissionError.unavailable,
        }));
      }
    } catch {
      setState(previous => ({
        ...previous,
        status: 'unavailable',
        error: permissionError.unavailable,
      }));
    }
  }, []);

  useEffect(() => {
    refreshPermission();
    return () => {
      requestIdRef.current += 1;
    };
  }, [refreshPermission]);

  const locate = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setState(previous => ({
      status: 'loading',
      location: previous.location,
    }));

    try {
      let permission = await check(locationPermission);

      if (permission === RESULTS.DENIED) {
        permission = await request(locationPermission);
      }

      if (permission === RESULTS.BLOCKED) {
        setState(previous => ({
          ...previous,
          status: 'blocked',
          error: permissionError.blocked,
        }));
        return;
      }

      if (permission === RESULTS.DENIED) {
        setState(previous => ({
          ...previous,
          status: 'denied',
          error: permissionError.denied,
        }));
        return;
      }

      if (permission !== RESULTS.GRANTED) {
        setState(previous => ({
          ...previous,
          status: 'unavailable',
          error: permissionError.unavailable,
        }));
        return;
      }

      if (Platform.OS === 'android') {
        try {
          const cachedLocation = await getCachedPosition();
          if (requestId !== requestIdRef.current) return;

          setState({ status: 'ready', location: cachedLocation });

          getFreshPosition().then(
            freshLocation => {
              if (requestId === requestIdRef.current) {
                setState({ status: 'ready', location: freshLocation });
              }
            },
            () => {
              // A valid cached position is already available to the user.
            },
          );
          return;
        } catch {
          // Continue with a fresh high-accuracy request when no cache exists.
        }
      }

      const location = await getFreshPosition();
      if (requestId === requestIdRef.current) {
        setState({ status: 'ready', location });
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setState(previous => ({
          ...previous,
          status: 'error',
          error: getLocationError(error),
        }));
      }
    }
  }, []);

  return { ...state, locate, openSettings: () => openSettings('application') };
}
