import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { selectTripProgress } from '../model/trips.selectors';
import type { Trip } from '../model/trip.types';

export function TripProgress({ trip }: { trip: Trip }) {
  const { total, visited, percentage } = selectTripProgress(trip);
  const progress = useSharedValue(percentage);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  useEffect(() => {
    progress.value = withTiming(percentage, {
      duration: 260,
      reduceMotion: ReduceMotion.System,
    });
  }, [percentage, progress]);

  return (
    <View
      className="gap-2"
      accessibilityLabel={`${visited} of ${total} places visited`}
    >
      <Text className="text-sm text-app-muted">
        {visited} / {total} visited · {percentage}%
      </Text>
      <View
        className="h-2 flex-row overflow-hidden rounded-full bg-app-border"
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: visited }}
      >
        <Animated.View
          className="h-full bg-app-success"
          style={progressStyle}
        />
      </View>
    </View>
  );
}
