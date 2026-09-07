import { Pressable, Text, View } from 'react-native';
import { AppButton } from '../../../shared/components/AppButton';
import { TripProgress } from './TripProgress';
import type { Trip } from '../model/trip.types';

type Props = {
  trip: Trip;
  active: boolean;
  onOpen: () => void;
  onActivate: () => void;
};
export function TripCard({ trip, active, onOpen, onActivate }: Props) {
  return (
    <View className="gap-3 rounded-2xl border border-app-border bg-app-surface p-4">
      <Pressable
        accessibilityHint="Opens trip details."
        accessibilityLabel={`${trip.name}${active ? ', active trip' : ''}`}
        accessibilityRole="button"
        className="gap-3"
        onPress={onOpen}
      >
        <Text className="text-lg font-semibold text-app-text">{trip.name}</Text>
        {active ? (
          <Text className="text-sm font-semibold text-app-primary">
            Active trip
          </Text>
        ) : null}
        <TripProgress trip={trip} />
      </Pressable>
      {!active ? (
        <AppButton
          label="Make active"
          variant="secondary"
          onPress={onActivate}
        />
      ) : null}
    </View>
  );
}
