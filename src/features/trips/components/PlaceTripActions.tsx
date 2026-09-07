import { Text, View } from 'react-native';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { AppButton } from '../../../shared/components/AppButton';
import { useTripsStore } from '../model/trips.store';
import { selectActiveTrip } from '../model/trips.selectors';

export function PlaceTripActions({ placeId }: { placeId: string }) {
  const navigation = useAppNavigation();
  const trip = useTripsStore(selectActiveTrip);
  const add = useTripsStore(state => state.addPlaceToTrip);
  const remove = useTripsStore(state => state.removePlaceFromTrip);
  const included = trip?.places.some(item => item.placeId === placeId);
  return (
    <View className="gap-2 rounded-2xl bg-app-surface p-4">
      <Text className="text-base font-semibold text-app-text">
        {trip ? trip.name : 'No active trip'}
      </Text>
      {trip ? (
        <>
          <Text className="text-sm text-app-muted">
            {included
              ? 'This place is in your active trip.'
              : 'Add this place to your itinerary.'}
          </Text>
          <AppButton
            label={included ? 'Remove from trip' : 'Add to trip'}
            onPress={() =>
              included ? remove(trip.id, placeId) : void add(trip.id, placeId)
            }
          />
          <AppButton
            label="View trip"
            variant="ghost"
            onPress={() =>
              navigation.navigate('TripDetails', { tripId: trip.id })
            }
          />
        </>
      ) : (
        <AppButton
          label="Create trip"
          onPress={() => navigation.navigate('CreateTrip', { placeId })}
        />
      )}
    </View>
  );
}
