import { useMemo, useState } from 'react';
import type { Region } from 'react-native-maps';

import type { Coordinates, Place } from '../../places/model/place.types';

export type MapCluster = {
  id: string;
  coordinate: Coordinates;
  places: Place[];
};

const initialRegion: Region = {
  latitude: 49.8429,
  longitude: 24.0316,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function getClusterGridSize(region: Region) {
  return Math.max(region.latitudeDelta / 7, 0.0025);
}

function buildClusters(places: Place[], region: Region): MapCluster[] {
  const gridSize = getClusterGridSize(region);
  const groupedPlaces = new Map<string, Place[]>();

  for (const place of places) {
    const latitudeCell = Math.floor(place.coordinates.latitude / gridSize);
    const longitudeCell = Math.floor(place.coordinates.longitude / gridSize);
    const key = `${latitudeCell}:${longitudeCell}`;
    const group = groupedPlaces.get(key) ?? [];

    group.push(place);
    groupedPlaces.set(key, group);
  }

  return Array.from(groupedPlaces, ([id, group]) => ({
    id,
    places: group,
    coordinate: {
      latitude:
        group.reduce((total, place) => total + place.coordinates.latitude, 0) /
        group.length,
      longitude:
        group.reduce((total, place) => total + place.coordinates.longitude, 0) /
        group.length,
    },
  }));
}

export function useMapClusters(places: Place[]) {
  const [region, setRegion] = useState<Region>(initialRegion);
  const clusters = useMemo(() => buildClusters(places, region), [places, region]);

  return { clusters, onRegionChangeComplete: setRegion };
}
