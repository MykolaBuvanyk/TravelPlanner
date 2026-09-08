import { zodResolver } from '@hookform/resolvers/zod';
import type { StaticScreenProps } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { AppButton } from '../../../shared/components/AppButton';
import { AppInput } from '../../../shared/components/AppInput';
import { ErrorState } from '../../../shared/components/ErrorState';
import { LoadingState } from '../../../shared/components/LoadingState';
import { Screen } from '../../../shared/components/Screen';
import { CategoryChip } from '../components/CategoryChip';
import { placeCategories, placeCategoryLabels } from '../model/place.constants';
import type { PlaceCategory } from '../model/place.constants';
import {
  placeFormSchema,
  type PlaceFormValues,
} from '../model/place-form.schema';
import type { CreatePlaceInput } from '../model/place.schema';
import { usePlacesStore } from '../model/places.store';
import type { Place } from '../model/place.types';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { useHeaderHeight } from '@react-navigation/elements';
import { CurrentLocationAction } from '../../location/components/CurrentLocationAction';

export type AddPlaceScreenProps = StaticScreenProps<
  | {
      initialLatitude?: number;
      initialLongitude?: number;
      initialName?: string;
      initialAddress?: string;
      initialCategory?: PlaceCategory;
      initialExternalId?: string;
      initialSource?: 'nominatim';
      placeId?: string;
    }
  | undefined
>;

function getDefaultValues(
  place: Place | undefined,
  initialParams: AddPlaceScreenProps['route']['params'],
): PlaceFormValues {
  return {
    name: place?.name ?? initialParams?.initialName ?? '',
    address: place?.address ?? initialParams?.initialAddress ?? '',
    description: place?.description ?? '',
    notes: place?.notes ?? '',
    category: place?.category ?? initialParams?.initialCategory ?? 'other',
    latitude:
      place?.coordinates.latitude.toString() ??
      initialParams?.initialLatitude?.toString() ??
      '',
    longitude:
      place?.coordinates.longitude.toString() ??
      initialParams?.initialLongitude?.toString() ??
      '',
  };
}

function toNullable(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue ? normalizedValue : null;
}

export function AddPlaceScreen({ route }: AddPlaceScreenProps) {
  const navigation = useAppNavigation();
  const headerHeight = useHeaderHeight();
  const placeId = route.params?.placeId;
  const place = usePlacesStore(state =>
    placeId ? state.placesById[placeId] : undefined,
  );
  const hasHydrated = usePlacesStore(state => state.hasHydrated);
  const createPlace = usePlacesStore(state => state.createPlace);
  const updatePlace = usePlacesStore(state => state.updatePlace);
  const isEditing = Boolean(placeId);
  const form = useForm<PlaceFormValues>({
    defaultValues: getDefaultValues(place, route.params),
    resolver: zodResolver(placeFormSchema),
  });
  const { reset } = form;

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit place' : 'Add place' });
  }, [isEditing, navigation]);

  useEffect(() => {
    reset(getDefaultValues(place, route.params));
  }, [reset, place, route.params]);

  async function onSubmit(values: PlaceFormValues) {
    const placeInput: CreatePlaceInput = {
      name: values.name,
      address: toNullable(values.address),
      description: toNullable(values.description),
      notes: toNullable(values.notes),
      category: values.category,
      source: route.params?.initialSource ?? 'manual',
      externalId: route.params?.initialExternalId ?? null,
      coordinates: {
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
      },
    };

    if (placeId && place) {
      if (!(await updatePlace(placeId, placeInput))) {
        form.setError('root', {
          message: 'Unable to save this place. Please try again.',
        });
        return;
      }
      navigation.popTo('PlaceDetails', { placeId });

      return;
    }

    const createdPlace = await createPlace(placeInput);
    if (!createdPlace) {
      form.setError('root', {
        message: 'Unable to save this place. Please try again.',
      });
      return;
    }
    navigation.replace('PlaceDetails', { placeId: createdPlace.id });
  }

  if (!hasHydrated) {
    return (
      <Screen safeEdges={['bottom']}>
        <LoadingState label="Loading place..." />
      </Screen>
    );
  }

  if (placeId && !place) {
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
      <KeyboardAvoidingView
        className="flex-1"
        keyboardVerticalOffset={headerHeight}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-5 py-6"
          keyboardShouldPersistTaps="handled"
        >
          <Controller
            control={form.control}
            name="name"
            render={({
              field: { ref, onBlur, onChange, value },
              fieldState: { error },
            }) => (
              <AppInput
                ref={ref}
                error={error?.message}
                label="Name"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="e.g. Rynok Square"
                value={value}
              />
            )}
          />
          <Controller
            control={form.control}
            name="address"
            render={({
              field: { ref, onBlur, onChange, value },
              fieldState: { error },
            }) => (
              <AppInput
                ref={ref}
                error={error?.message}
                label="Address"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="e.g. Rynok Square, Lviv"
                value={value}
              />
            )}
          />
          <Controller
            control={form.control}
            name="description"
            render={({
              field: { ref, onBlur, onChange, value },
              fieldState: { error },
            }) => (
              <AppInput
                ref={ref}
                error={error?.message}
                label="Description"
                multiline
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Why is this place worth visiting?"
                textAlignVertical="top"
                value={value}
              />
            )}
          />
          <Controller
            control={form.control}
            name="notes"
            render={({
              field: { ref, onBlur, onChange, value },
              fieldState: { error },
            }) => (
              <AppInput
                ref={ref}
                error={error?.message}
                label="Notes"
                multiline
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Optional personal notes"
                textAlignVertical="top"
                value={value}
              />
            )}
          />
          <Controller
            control={form.control}
            name="category"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View className="gap-2">
                <Text className="text-sm font-medium text-app-text">
                  Category
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {placeCategories.map(category => (
                    <CategoryChip
                      key={category}
                      label={placeCategoryLabels[category]}
                      isSelected={value === category}
                      onPress={() => onChange(category)}
                    />
                  ))}
                </View>
                {error ? (
                  <Text className="text-sm text-app-danger">
                    {error.message}
                  </Text>
                ) : null}
              </View>
            )}
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={form.control}
                name="latitude"
                render={({
                  field: { ref, onBlur, onChange, value },
                  fieldState: { error },
                }) => (
                  <AppInput
                    ref={ref}
                    error={error?.message}
                    keyboardType="numbers-and-punctuation"
                    label="Latitude"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="49.8429"
                    value={value}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={form.control}
                name="longitude"
                render={({
                  field: { ref, onBlur, onChange, value },
                  fieldState: { error },
                }) => (
                  <AppInput
                    ref={ref}
                    error={error?.message}
                    keyboardType="numbers-and-punctuation"
                    label="Longitude"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="24.0316"
                    value={value}
                  />
                )}
              />
            </View>
          </View>
          <CurrentLocationAction
            onLocation={location => {
              form.setValue('latitude', location.latitude.toString(), {
                shouldValidate: true,
              });
              form.setValue('longitude', location.longitude.toString(), {
                shouldValidate: true,
              });
            }}
          />
          {form.formState.errors.root ? (
            <Text className="text-app-danger">
              {form.formState.errors.root.message}
            </Text>
          ) : null}
          <AppButton
            disabled={form.formState.isSubmitting}
            label={isEditing ? 'Save changes' : 'Save place'}
            onPress={form.handleSubmit(onSubmit)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
