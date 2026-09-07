import { MapPin } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { PlaceSearchResult } from '../../../api/places';
import { AppButton } from '../../../shared/components/AppButton';
import { placeCategoryLabels } from '../model/place.constants';

type PlaceSearchResultCardProps = {
  result: PlaceSearchResult;
  onAdd: () => void;
};

export function PlaceSearchResultCard({
  result,
  onAdd,
}: PlaceSearchResultCardProps) {
  return (
    <View className="gap-3 rounded-2xl border border-app-border bg-app-surface p-4">
      <View className="gap-1">
        <Text className="text-lg font-semibold text-app-text" numberOfLines={1}>
          {result.name}
        </Text>
        <Text className="text-sm text-app-muted">
          {placeCategoryLabels[result.category]}
        </Text>
      </View>
      <View className="flex-row items-start gap-2">
        <MapPin color="#667085" size={16} />
        <Text className="flex-1 text-sm text-app-muted" numberOfLines={2}>
          {result.address}
        </Text>
      </View>
      <AppButton label="Add place" variant="secondary" onPress={onAdd} />
    </View>
  );
}
