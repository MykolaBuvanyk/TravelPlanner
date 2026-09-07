import { useCallback, useEffect, useState } from 'react';
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

function getCurrentPosition(): Promise<CurrentLocation> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position: GeoPosition) => resolve(toCurrentLocation(position)),
      reject,
      {
        accuracy: { android: 'high', ios: 'best' },
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 300_000,
        showLocationDialog: true,
        forceLocationManager: Platform.OS === 'android',
      },
    );
  });
}

export function useCurrentLocation() {
  const [state, setState] = useState<LocationState>({ status: 'idle' });

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
    void refreshPermission();
  }, [refreshPermission]);

  const locate = useCallback(async () => {
    setState(previous => ({ ...previous, status: 'loading' }));

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

      const location = await getCurrentPosition();
      setState({ status: 'ready', location });
    } catch (error) {
      setState(previous => ({
        ...previous,
        status: 'error',
        error: getLocationError(error),
      }));
    }
  }, []);

  return { ...state, locate, openSettings: () => openSettings('application') };
}
