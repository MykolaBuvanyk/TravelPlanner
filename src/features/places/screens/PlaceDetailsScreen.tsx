import type { StaticScreenProps } from '@react-navigation/native';
import { Heart, MapPin, Trash2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { AppButton } from '../../../shared/components/AppButton';
import { ErrorState } from '../../../shared/components/ErrorState';
import { LoadingState } from '../../../shared/components/LoadingState';
import { Screen } from '../../../shared/components/Screen';
import { placeCategoryLabels } from '../model/place.constants';
import { usePlacesStore } from '../model/places.store';
import { useTripsStore } from '../../trips/model/trips.store';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { PlaceTripActions } from '../../trips/components/PlaceTripActions';
import { deleteSavedPlace } from '../model/deleteSavedPlace';

export type PlaceDetailsScreenProps = StaticScreenProps<{
  placeId: string;
}>;

export function PlaceDetailsScreen({ route }: PlaceDetailsScreenProps) {
  const navigation = useAppNavigation();
  const { placeId } = route.params;
  const place = usePlacesStore(state => state.placesById[placeId]);
  const hasHydrated = usePlacesStore(state => state.hasHydrated);
  const toggleFavorite = usePlacesStore(state => state.toggleFavorite);
  const hasTripsHydrated = useTripsStore(state => state.hasHydrated);

  useEffect(() => {
    navigation.setOptions({ title: place?.name ?? 'Place details' });
  }, [navigation, place?.name]);

  function handleDelete() {
    Alert.alert(
      'Delete place?',
      'This will remove the place from every trip.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (await deleteSavedPlace(placeId)) {
              navigation.popTo('MainTabs', { screen: 'Home' });
            } else {
              Alert.alert(
                'Unable to delete place',
                'The place could not be removed from this device. Please try again.',
              );
            }
          },
        },
      ],
    );
  }

  if (!hasHydrated || !hasTripsHydrated) {
    return (
      <Screen safeEdges={['bottom']}>
        <LoadingState label="Loading place details..." />
      </Screen>
    );
  }

  if (!place) {
    return (
      <Screen safeEdges={['bottom']} className="justify-center px-5">
        <ErrorState
          title="Place not found"
          description="This place may have been deleted."
          onRetry={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  return (
    <Screen safeEdges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 py-6"
      >
        <View className="gap-3 rounded-2xl bg-app-surface p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-1">
              <Text className="text-2xl font-bold text-app-text">
                {place.name}
              </Text>
              <Text className="text-base text-app-muted">
                {placeCategoryLabels[place.category]}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={
                place.isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => toggleFavorite(placeId)}
            >
              <Heart
                color={place.isFavorite ? '#F04438' : '#667085'}
                fill={place.isFavorite ? '#F04438' : 'transparent'}
                size={26}
              />
            </Pressable>
          </View>
          {place.address ? (
            <View className="flex-row items-start gap-2">
              <MapPin color="#667085" size={18} />
              <Text className="flex-1 text-base text-app-muted">
                {place.address}
              </Text>
            </View>
          ) : null}
        </View>

        {place.description ? (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-app-text">
              Description
            </Text>
            <Text className="text-base leading-6 text-app-muted">
              {place.description}
            </Text>
          </View>
        ) : null}

        {place.notes ? (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-app-text">Notes</Text>
            <Text className="text-base leading-6 text-app-muted">
              {place.notes}
            </Text>
          </View>
        ) : null}

        <View className="gap-2 rounded-2xl border border-app-border bg-app-surface p-4">
          <Text className="text-sm font-semibold text-app-text">
            Coordinates
          </Text>
          <Text className="text-base text-app-muted">
            {place.coordinates.latitude.toFixed(5)},{' '}
            {place.coordinates.longitude.toFixed(5)}
          </Text>
        </View>

        <View className="gap-3">
          <PlaceTripActions placeId={placeId} />
          <AppButton
            label="Open on map"
            variant="secondary"
            onPress={() =>
              navigation.navigate('MainTabs', {
                screen: 'Map',
                params: { placeId, tripId: undefined },
              })
            }
          />
          <AppButton
            label="Edit place"
            variant="secondary"
            onPress={() => navigation.navigate('AddPlace', { placeId })}
          />
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center justify-center gap-2 py-3"
            onPress={handleDelete}
          >
            <Trash2 color="#F04438" size={18} />
            <Text className="text-base font-semibold text-app-danger">
              Delete place
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
