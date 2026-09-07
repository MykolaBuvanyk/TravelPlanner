import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import type { StaticScreenProps } from '@react-navigation/native';
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { AppButton } from '../../../shared/components/AppButton';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Screen } from '../../../shared/components/Screen';
import { getDistanceMeters } from '../../../utils/location';
import { usePlacesStore } from '../../places/model/places.store';
import { useTripsStore } from '../model/trips.store';
import { TripProgress } from '../components/TripProgress';
import { TripPlaceRow } from '../components/TripPlaceRow';
import { shareTrip } from '../model/shareTrip';

export type TripDetailsScreenProps = StaticScreenProps<{ tripId: string }>;

export function TripDetailsScreen({ route }: TripDetailsScreenProps) {
  const navigation = useAppNavigation();
  const { tripId } = route.params;
  const trip = useTripsStore(state => state.tripsById[tripId]);
  const activeTripId = useTripsStore(state => state.activeTripId);
  const places = usePlacesStore(state => state.placesById);
  const [isSharing, setIsSharing] = useState(false);
  useEffect(() => {
    navigation.setOptions({ title: trip?.name ?? 'Trip details' });
  }, [navigation, trip?.name]);

  function removeTrip() {
    Alert.alert(
      'Delete trip?',
      'Your saved places will remain in your collection.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            useTripsStore.getState().deleteTrip(tripId);
            navigation.popTo('MainTabs', { screen: 'Trips' });
          },
        },
      ],
    );
  }

  async function handleShareTrip() {
    if (!trip) return;

    setIsSharing(true);

    try {
      await shareTrip(trip, places);
    } catch {
      Alert.alert(
        'Could not share trip',
        'The system share sheet is unavailable right now. Please try again.',
      );
    } finally {
      setIsSharing(false);
    }
  }

  if (!trip)
    return (
      <Screen safeEdges={['bottom']} className="p-5">
        <EmptyState
          title="Trip not found"
          description="This trip may have been deleted."
          action={
            <AppButton
              label="View trips"
              onPress={() => navigation.popTo('MainTabs', { screen: 'Trips' })}
            />
          }
        />
      </Screen>
    );

  return (
    <Screen safeEdges={['bottom']}>
      <DraggableFlatList
        data={trip.places}
        keyExtractor={item => item.placeId}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ gap: 12, padding: 20 }}
        activationDistance={12}
        ListHeaderComponent={
          <View className="gap-3 pb-4">
            <Text className="text-2xl font-bold text-app-text">
              {trip.name}
            </Text>
            <TripProgress trip={trip} />
            {trip.places.length > 1 ? (
              <Text className="text-sm text-app-muted">
                Long press the drag handle and move a place to reorder your
                itinerary.
              </Text>
            ) : null}
            <AppButton
              label={tripId === activeTripId ? 'Active trip' : 'Make active'}
              disabled={tripId === activeTripId}
              variant="secondary"
              onPress={() => useTripsStore.getState().setActiveTrip(tripId)}
            />
            <AppButton
              label="Add places"
              onPress={() => {
                useTripsStore.getState().setActiveTrip(tripId);
                navigation.navigate('MainTabs', { screen: 'Home' });
              }}
            />
            <AppButton
              label="View on map"
              variant="secondary"
              disabled={trip.places.length === 0}
              onPress={() =>
                navigation.navigate('MainTabs', {
                  screen: 'Map',
                  params: { tripId, placeId: undefined },
                })
              }
            />
            <AppButton
              label={isSharing ? 'Opening share sheet...' : 'Share trip'}
              variant="secondary"
              disabled={isSharing}
              onPress={handleShareTrip}
            />
            <View className="flex-row gap-2">
              <AppButton
                label="Rename trip"
                variant="ghost"
                onPress={() => navigation.navigate('CreateTrip', { tripId })}
              />
              <AppButton
                label="Delete trip"
                variant="ghost"
                onPress={removeTrip}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Your itinerary is empty"
            description="Choose Add places, open a saved place and add it to this trip."
          />
        }
        onDragEnd={({ from, to }) => {
          if (from !== to) {
            useTripsStore.getState().reorderPlaces(tripId, from, to);
          }
        }}
        renderItem={({ item, drag, getIndex, isActive }) => {
          const index = getIndex() ?? 0;
          const previousPlaceId = trip.places[index - 1]?.placeId;
          const place = places[item.placeId];
          const previousPlace = previousPlaceId
            ? places[previousPlaceId]
            : undefined;

          return (
            <ScaleDecorator>
              <TripPlaceRow
                item={item}
                place={place}
                index={index}
                distanceFromPreviousMeters={
                  place && previousPlace
                    ? getDistanceMeters(
                        previousPlace.coordinates,
                        place.coordinates,
                      )
                    : undefined
                }
                isDragging={isActive}
                onDrag={drag}
                onOpen={() =>
                  navigation.navigate('PlaceDetails', { placeId: item.placeId })
                }
                onVisit={() =>
                  useTripsStore
                    .getState()
                    .togglePlaceVisited(tripId, item.placeId)
                }
                onRemove={() =>
                  useTripsStore
                    .getState()
                    .removePlaceFromTrip(tripId, item.placeId)
                }
              />
            </ScaleDecorator>
          );
        }}
      />
    </Screen>
  );
}
