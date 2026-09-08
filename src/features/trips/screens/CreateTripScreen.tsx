import { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import type { StaticScreenProps } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { AppButton } from '../../../shared/components/AppButton';
import { AppInput } from '../../../shared/components/AppInput';
import { Screen } from '../../../shared/components/Screen';
import { EmptyState } from '../../../shared/components/EmptyState';
import { useTripsStore } from '../model/trips.store';
import { createTripSchema, type CreateTripInput } from '../model/trip.schema';

export type CreateTripScreenProps = StaticScreenProps<
  { tripId?: string; placeId?: string } | undefined
>;

export function CreateTripScreen({ route }: CreateTripScreenProps) {
  const navigation = useAppNavigation();
  const headerHeight = useHeaderHeight();
  const tripId = route.params?.tripId;
  const trip = useTripsStore(state =>
    tripId ? state.tripsById[tripId] : undefined,
  );
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<CreateTripInput>({
    defaultValues: { name: trip?.name ?? '' },
    resolver: zodResolver(createTripSchema),
  });
  useEffect(() => {
    navigation.setOptions({ title: tripId ? 'Rename trip' : 'Create trip' });
  }, [navigation, tripId]);

  async function submit(input: CreateTripInput) {
    const store = useTripsStore.getState();
    if (tripId) {
      if (!store.tripsById[tripId]) {
        setError('root', { message: 'This trip no longer exists.' });
        return;
      }
      if (!(await store.renameTrip(tripId, input))) {
        setError('root', {
          message: 'Unable to save this trip. Please try again.',
        });
        return;
      }
      navigation.popTo('TripDetails', { tripId });
      return;
    }
    const created = await store.createTrip(input);
    if (!created) {
      setError('root', {
        message: 'Unable to save this trip. Please try again.',
      });
      return;
    }
    await store.setActiveTrip(created.id);
    if (route.params?.placeId)
      await store.addPlaceToTrip(created.id, route.params.placeId);
    navigation.replace('TripDetails', { tripId: created.id });
  }

  if (tripId && !trip)
    return (
      <Screen safeEdges={['bottom']} className="p-5">
        <EmptyState
          title="Trip not found"
          description="This trip may have been deleted."
        />
      </Screen>
    );
  return (
    <Screen safeEdges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          contentContainerClassName="gap-5 p-5"
          keyboardShouldPersistTaps="handled"
        >
          <Controller
            control={control}
            name="name"
            render={({
              field: { ref, value, onChange, onBlur },
              fieldState: { error },
            }) => (
              <AppInput
                ref={ref}
                label="Trip name"
                placeholder="e.g. Lviv Weekend"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
                autoFocus
              />
            )}
          />
          {errors.root ? (
            <Text className="text-app-danger">{errors.root.message}</Text>
          ) : null}
          <AppButton
            label={tripId ? 'Save changes' : 'Create trip'}
            disabled={isSubmitting}
            onPress={handleSubmit(submit)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
