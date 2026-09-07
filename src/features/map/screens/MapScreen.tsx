import type { StaticScreenProps } from '@react-navigation/native';

import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { AppButton } from '../../../shared/components/AppButton';
import { Screen } from '../../../shared/components/Screen';
import {
  formatDistance,
  formatDuration,
  type CurrentLocation,
} from '../../../utils/location';
import { CurrentLocationAction } from '../../location/components/CurrentLocationAction';
import { CategoryChip } from '../../places/components/CategoryChip';
import { MapPlacePreview } from '../components/MapPlacePreview';
import { PlacesMap } from '../components/PlacesMap';
import { useMapPlaces, type MapRouteParams } from '../hooks/useMapPlaces';
import { useTripRoute } from '../hooks/useTripRoute';
import { darkMapStyle } from '../model/mapStyles';

export type MapScreenProps = StaticScreenProps<MapRouteParams>;

export function MapScreen({ route }: MapScreenProps) {
  const navigation = useAppNavigation();
  const map = useMapPlaces(route.params);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation>();
  const [locationRevision, setLocationRevision] = useState(0);
  const [isRouteVisible, setIsRouteVisible] = useState(false);
  const [isDarkMap, setIsDarkMap] = useState(false);
  const tripRoute = useTripRoute(map.tripId, map.places, isRouteVisible);

  useEffect(() => {
    setIsRouteVisible(false);
  }, [map.tripId]);

  function selectTrip(tripId?: string) {
    setIsRouteVisible(false);
    map.selectTrip(tripId);
  }

  return (
    <Screen safeEdges={[]} className="relative">
      <View className="gap-3 border-b border-app-border bg-app-surface p-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <CategoryChip
              label="All places"
              isSelected={!map.tripId}
              onPress={() => selectTrip()}
            />
            {map.activeTrip ? (
              <CategoryChip
                label="Active trip"
                isSelected={map.tripId === map.activeTrip.id}
                onPress={() => selectTrip(map.activeTrip?.id)}
              />
            ) : null}
            {map.trip && map.trip.id !== map.activeTrip?.id ? (
              <CategoryChip
                label={map.trip.name}
                isSelected
                onPress={() => selectTrip(map.trip?.id)}
              />
            ) : null}
            <CategoryChip
              label={isDarkMap ? 'Dark map' : 'Light map'}
              isSelected={isDarkMap}
              onPress={() => setIsDarkMap(value => !value)}
            />
          </View>
        </ScrollView>
        <Text className="text-sm text-app-muted" numberOfLines={1}>
          {map.trip ? `${map.trip.name} · ` : ''}
          {map.places.length} places
        </Text>
        {map.missingTrip || map.missingPlace || !map.places.length ? (
          <Text accessibilityRole="alert" className="text-sm text-app-muted">
            {map.missingTrip
              ? 'This trip is no longer available. Select All places.'
              : map.missingPlace
                ? 'This place is no longer available.'
                : map.trip
                  ? 'Add places to this trip to see them on the map.'
                  : 'Save a place to see it on the map.'}
          </Text>
        ) : null}
        <AppButton
          label="Fit places"
          variant="secondary"
          disabled={!map.places.length}
          onPress={map.fitPlaces}
        />
        {map.trip && map.places.length >= 2 ? (
          <AppButton
            label={isRouteVisible ? 'Hide route' : 'Show driving route'}
            variant="secondary"
            onPress={() => setIsRouteVisible(value => !value)}
          />
        ) : null}
        {isRouteVisible && tripRoute.isPending ? (
          <Text className="text-sm text-app-muted">Building route...</Text>
        ) : null}
        {isRouteVisible && tripRoute.data ? (
          <Text className="text-sm text-app-muted">
            {formatDistance(tripRoute.data.distanceMeters)} · about{' '}
            {formatDuration(tripRoute.data.durationSeconds)} by car
          </Text>
        ) : null}
        {isRouteVisible && tripRoute.isError ? (
          <View className="gap-2">
            <Text accessibilityRole="alert" className="text-sm text-app-danger">
              Route is unavailable. Check your connection and try again.
            </Text>
            <AppButton
              label="Retry route"
              variant="ghost"
              onPress={() => tripRoute.refetch()}
            />
          </View>
        ) : null}
        {isRouteVisible && tripRoute.data ? (
          <Text className="text-xs text-app-muted">
            Route data © OpenStreetMap contributors, OSRM
          </Text>
        ) : null}
        <CurrentLocationAction
          label="Show current location"
          onLocation={location => {
            setCurrentLocation(location);
            setLocationRevision(value => value + 1);
          }}
        />
      </View>
      <PlacesMap
        places={map.places}
        selectedPlace={map.selectedPlace}
        visitedIds={map.visitedIds}
        cameraRevision={map.cameraRevision}
        currentLocation={currentLocation}
        locationRevision={locationRevision}
        routeCoordinates={isRouteVisible ? tripRoute.data?.coordinates : undefined}
        mapStyle={isDarkMap ? darkMapStyle : undefined}
        onSelect={map.selectPlace}
      />
      {map.selectedPlace ? (
        <MapPlacePreview
          place={map.selectedPlace}
          isVisited={map.visitedIds.has(map.selectedPlace.id)}
          onClose={() => map.selectPlace(undefined)}
          onOpen={() => {
            if (map.selectedPlace)
              navigation.navigate('PlaceDetails', {
                placeId: map.selectedPlace.id,
              });
          }}
        />
      ) : null}
    </Screen>
  );
}
