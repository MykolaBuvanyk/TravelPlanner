import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { X } from 'lucide-react-native';
import Animated, {
  FadeInUp,
  FadeOutDown,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AppButton } from '../../../shared/components/AppButton';
import { placeCategoryLabels } from '../../places/model/place.constants';
import type { Place } from '../../places/model/place.types';

type MapPlacePreviewProps = {
  place: Place;
  isVisited: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function MapPlacePreview({
  place,
  isVisited,
  onOpen,
  onClose,
}: MapPlacePreviewProps) {
  const translateY = useSharedValue(0);
  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd(event => {
      if (event.translationY > 96 || event.velocityY > 900) {
        runOnJS(onClose)();
        return;
      }

      translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
    });
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(220).reduceMotion(ReduceMotion.System)}
      exiting={FadeOutDown.duration(160).reduceMotion(ReduceMotion.System)}
      style={animatedStyle}
      className="absolute bottom-0 left-0 right-0 gap-2 rounded-t-3xl border-t border-app-border bg-app-surface p-4 shadow-lg"
    >
      <GestureDetector gesture={panGesture}>
        <View
          accessible
          collapsable={false}
          accessibilityLabel="Drag down to close place preview"
          className="items-center py-1"
        >
          <View className="h-1.5 w-10 rounded-full bg-app-border" />
        </View>
      </GestureDetector>
      <View className="flex-row items-start gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-lg font-bold text-app-text" numberOfLines={1}>
            {place.name}
          </Text>
          <Text className="text-sm text-app-muted" numberOfLines={1}>
            {placeCategoryLabels[place.category]}
            {isVisited ? ' · Visited' : ''}
          </Text>
          <Text className="text-sm text-app-muted" numberOfLines={1}>
            {place.address ??
              `${place.coordinates.latitude.toFixed(5)}, ${place.coordinates.longitude.toFixed(5)}`}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close place preview"
          className="h-10 w-10 items-center justify-center rounded-full bg-app-secondary"
          onPress={onClose}
        >
          <X color="#246BFD" size={20} />
        </Pressable>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <AppButton label="View details" onPress={onOpen} />
        </View>
      </View>
    </Animated.View>
  );
}
