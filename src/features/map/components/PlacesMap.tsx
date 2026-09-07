import { cssInterop } from 'nativewind';
import { useCallback, useEffect, useRef, useState } from 'react';
import MapView, { Polyline, type MapStyleElement } from 'react-native-maps';

import type { Place } from '../../places/model/place.types';
import type { CurrentLocation } from '../../../utils/location';
import { PlaceMarker } from './PlaceMarker';
import { PlaceClusterMarker } from './PlaceClusterMarker';
import { useMapClusters, type MapCluster } from '../hooks/useMapClusters';

cssInterop(MapView, { className: 'style' });

const initialRegion = {
  latitude: 49.8429,
  longitude: 24.0316,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};
const edgePadding = { top: 48, right: 48, bottom: 48, left: 48 };

type PlacesMapProps = {
  places: Place[];
  selectedPlace?: Place;
  visitedIds: Set<string>;
  cameraRevision: number;
  currentLocation?: CurrentLocation;
  locationRevision: number;
  routeCoordinates?: { latitude: number; longitude: number }[];
  mapStyle?: MapStyleElement[];
  onSelect: (id: string) => void;
};

export function PlacesMap({
  places,
  selectedPlace,
  visitedIds,
  cameraRevision,
  currentLocation,
  locationRevision,
  routeCoordinates,
  mapStyle,
  onSelect,
}: PlacesMapProps) {
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const { clusters, onRegionChangeComplete } = useMapClusters(places);

  const zoomToCluster = useCallback((cluster: MapCluster) => {
    if (cluster.places.length === 1) return;

    const coordinates = cluster.places.map(place => place.coordinates);

    if (coordinates.every(coordinate => (
      coordinate.latitude === coordinates[0].latitude &&
      coordinate.longitude === coordinates[0].longitude
    ))) {
      mapRef.current?.animateToRegion(
        { ...coordinates[0], latitudeDelta: 0.008, longitudeDelta: 0.008 },
        250,
      );
      return;
    }

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding,
      animated: true,
    });
  }, []);

  useEffect(() => {
    if (!ready || !layout.width || !layout.height) return;
    const target =
      selectedPlace ?? (places.length === 1 ? places[0] : undefined);
    if (target) {
      mapRef.current?.animateToRegion(
        {
          ...target.coordinates,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        300,
      );
    } else if (places.length > 1) {
      mapRef.current?.fitToCoordinates(
        places.map(place => place.coordinates),
        {
          edgePadding,
          animated: true,
        },
      );
    }
  }, [ready, layout, places, selectedPlace, cameraRevision]);

  useEffect(() => {
    if (!ready || !currentLocation) return;

    mapRef.current?.animateToRegion(
      {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      300,
    );
  }, [ready, currentLocation, locationRevision]);

  useEffect(() => {
    if (!ready || !routeCoordinates || routeCoordinates.length < 2) return;

    mapRef.current?.fitToCoordinates(routeCoordinates, {
      edgePadding,
      animated: true,
    });
  }, [ready, routeCoordinates]);

  return (
    <MapView
      ref={mapRef}
      className="flex-1"
      initialRegion={initialRegion}
      showsUserLocation={Boolean(currentLocation)}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      moveOnMarkerPress={false}
      customMapStyle={mapStyle}
      onMapReady={() => setReady(true)}
      onRegionChangeComplete={onRegionChangeComplete}
      onLayout={({ nativeEvent }) => {
        const { width, height } = nativeEvent.layout;
        setLayout(previous =>
          previous.width === width && previous.height === height
            ? previous
            : { width, height },
        );
      }}
    >
      {routeCoordinates && routeCoordinates.length > 1 ? (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#246BFD"
          strokeWidth={5}
        />
      ) : null}
      {clusters.map(cluster => cluster.places.length > 1 ? (
        <PlaceClusterMarker
          key={`cluster-${cluster.id}`}
          cluster={cluster}
          onPress={zoomToCluster}
        />
      ) : (
        <PlaceMarker
          key={cluster.places[0].id}
          place={cluster.places[0]}
          isSelected={cluster.places[0].id === selectedPlace?.id}
          isVisited={visitedIds.has(cluster.places[0].id)}
          onSelect={onSelect}
        />
      ))}
    </MapView>
  );
}
