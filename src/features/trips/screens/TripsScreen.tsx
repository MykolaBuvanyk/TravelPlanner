import { useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { Screen } from '../../../shared/components/Screen';
import { AppButton } from '../../../shared/components/AppButton';
import { AnimatedListItem } from '../../../shared/components/AnimatedListItem';
import { EmptyState } from '../../../shared/components/EmptyState';
import { TripCard } from '../components/TripCard';
import { useTripsStore } from '../model/trips.store';

export function TripsScreen() {
  const navigation = useAppNavigation();
  const tripsById = useTripsStore(state => state.tripsById);
  const tripIds = useTripsStore(state => state.tripIds);
  const activeTripId = useTripsStore(state => state.activeTripId);
  const setActive = useTripsStore(state => state.setActiveTrip);
  const trips = useMemo(
    () => tripIds.flatMap(id => (tripsById[id] ? [tripsById[id]] : [])),
    [tripIds, tripsById],
  );
  return (
    <Screen safeEdges={[]}>
      <FlatList
        data={trips}
        keyExtractor={trip => trip.id}
        className="flex-1"
        contentContainerClassName="gap-3 p-5"
        ListHeaderComponent={
          <View className="pb-2">
            <AppButton
              label="Create trip"
              onPress={() => navigation.navigate('CreateTrip')}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No trips yet"
            description="Create your first trip and add places to visit."
          />
        }
        renderItem={({ item, index }) => (
          <AnimatedListItem index={index}>
            <TripCard
              trip={item}
              active={item.id === activeTripId}
              onOpen={() =>
                navigation.navigate('TripDetails', { tripId: item.id })
              }
              onActivate={() => setActive(item.id)}
            />
          </AnimatedListItem>
        )}
      />
    </Screen>
  );
}
