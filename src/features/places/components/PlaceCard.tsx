import { Heart, MapPin } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { placeCategoryLabels } from '../model/place.constants';
import type { Place } from '../model/place.types';
import { formatDistance } from '../../../utils/location';

type PlaceCardProps = {
  place: Place;
  onPress: () => void;
  distanceMeters?: number;
};

export function PlaceCard({ place, onPress, distanceMeters }: PlaceCardProps) {
  return (
    <Pressable
      accessibilityHint="Opens place details."
      accessibilityLabel={`${place.name}, ${placeCategoryLabels[place.category]}${
        place.isFavorite ? ', favorite' : ''
      }`}
      accessibilityRole="button"
      className="gap-3 rounded-2xl border border-app-border bg-app-surface p-4 active:bg-app-secondary"
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-1">
          <Text
            className="text-lg font-semibold text-app-text"
            numberOfLines={1}
          >
            {place.name}
          </Text>
          <Text className="text-sm text-app-muted">
            {placeCategoryLabels[place.category]}
          </Text>
          {distanceMeters !== undefined ? (
            <Text className="text-sm font-medium text-app-primary">
              {formatDistance(distanceMeters)} away
            </Text>
          ) : null}
        </View>
        {place.isFavorite ? (
          <Heart color="#F04438" fill="#F04438" size={20} />
        ) : null}
      </View>
      <View className="flex-row items-center gap-2">
        <MapPin color="#667085" size={16} />
        <Text className="flex-1 text-sm text-app-muted" numberOfLines={1}>
          {place.address ?? 'No address added'}
        </Text>
      </View>
    </Pressable>
  );
}
