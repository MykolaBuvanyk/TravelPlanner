import { GripVertical } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { AppButton } from '../../../shared/components/AppButton';
import { formatDistance } from '../../../utils/location';
import type { Place } from '../../places/model/place.types';
import type { TripPlace } from '../model/trip.types';

type Props = {
  item: TripPlace;
  place?: Place;
  index: number;
  distanceFromPreviousMeters?: number;
  isDragging: boolean;
  onDrag: () => void;
  onOpen: () => void;
  onVisit: () => void;
  onRemove: () => void;
};
export function TripPlaceRow({
  item,
  place,
  index,
  distanceFromPreviousMeters,
  isDragging,
  onDrag,
  onOpen,
  onVisit,
  onRemove,
}: Props) {
  return (
    <View
      className={`gap-3 rounded-2xl border border-app-border bg-app-surface p-4 ${
        isDragging ? 'opacity-70' : ''
      }`}
    >
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.isVisited }}
          accessibilityLabel={`Mark ${place?.name ?? 'place'} as ${item.isVisited ? 'not visited' : 'visited'}`}
          onPress={onVisit}
          className="min-h-12 min-w-12 items-center justify-center rounded-xl bg-app-secondary"
        >
          <Text className="text-xl text-app-primary">
            {item.isVisited ? '✓' : '○'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityHint="Opens place details."
          accessibilityLabel={`Open ${place?.name ?? 'place'} details`}
          accessibilityRole="button"
          disabled={!place}
          onPress={onOpen}
          className="flex-1 py-2"
        >
          <Text
            className={`text-base font-semibold text-app-text ${item.isVisited ? 'line-through' : ''}`}
          >
            {index + 1}. {place?.name ?? 'Place unavailable'}
          </Text>
          <Text className="text-sm text-app-muted">
            {place?.address ?? 'No address added'}
          </Text>
          {distanceFromPreviousMeters !== undefined ? (
            <Text className="text-sm text-app-primary">
              {formatDistance(distanceFromPreviousMeters)} from previous stop
            </Text>
          ) : null}
        </Pressable>
        <Pressable
          accessibilityHint="Long press and drag to change this place's position."
          accessibilityLabel={`Reorder ${place?.name ?? 'place'}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: isDragging }}
          className="min-h-12 min-w-12 items-center justify-center rounded-xl active:bg-app-secondary"
          delayLongPress={150}
          disabled={isDragging}
          hitSlop={6}
          onLongPress={onDrag}
        >
          <GripVertical color="#667085" size={22} />
        </Pressable>
      </View>
      <View className="flex-row justify-end">
        <AppButton label="Remove" variant="ghost" onPress={onRemove} />
      </View>
    </View>
  );
}
