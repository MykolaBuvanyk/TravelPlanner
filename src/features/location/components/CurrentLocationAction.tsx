import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';

import { useCurrentLocation } from '../../../hooks/useCurrentLocation';
import { AppButton } from '../../../shared/components/AppButton';
import type { CurrentLocation } from '../../../utils/location';

type CurrentLocationActionProps = {
  onLocation: (location: CurrentLocation) => void;
  label?: string;
};

export function CurrentLocationAction({
  onLocation,
  label = 'Use current location',
}: CurrentLocationActionProps) {
  const location = useCurrentLocation();
  const onLocationRef = useRef(onLocation);
  const reportedLocationRef = useRef<CurrentLocation | undefined>(undefined);

  useEffect(() => {
    onLocationRef.current = onLocation;
  }, [onLocation]);

  useEffect(() => {
    if (
      location.status !== 'ready' ||
      reportedLocationRef.current === location.location
    )
      return;
    reportedLocationRef.current = location.location;
    onLocationRef.current(location.location);
  }, [location.status, location.location]);

  return (
    <View className="gap-2">
      <AppButton
        label={location.status === 'loading' ? 'Getting location...' : label}
        disabled={location.status === 'loading'}
        variant="secondary"
        onPress={location.locate}
      />
      {'error' in location ? (
        <View className="gap-1">
          <Text
            accessibilityRole="alert"
            className="text-sm font-semibold text-app-danger"
          >
            {location.error.title}
          </Text>
          <Text className="text-sm text-app-muted">
            {location.error.description}
          </Text>
          {location.status === 'blocked' ? (
            <AppButton
              label="Open Settings"
              variant="ghost"
              onPress={location.openSettings}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
