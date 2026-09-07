import { memo } from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import {
  BedDouble,
  Coffee,
  Landmark,
  MapPin,
  TreePine,
  Utensils,
} from 'lucide-react-native';

import type { Place } from '../../places/model/place.types';

type PlaceMarkerProps = {
  place: Place;
  isVisited: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

const categoryIcons = {
  coffee: Coffee,
  restaurant: Utensils,
  museum: Landmark,
  landmark: Landmark,
  park: TreePine,
  hotel: BedDouble,
  other: MapPin,
} as const;

export const PlaceMarker = memo(({
  place, isVisited, isSelected, onSelect,
}: PlaceMarkerProps) => {
  const Icon = categoryIcons[place.category];
  const markerClassName = isSelected
    ? 'bg-app-primaryPressed'
    : place.isFavorite
      ? 'bg-app-danger'
      : isVisited
        ? 'bg-app-success'
        : 'bg-app-primary';

  return (
    <Marker
      identifier={place.id}
      coordinate={place.coordinates}
      anchor={{ x: 0.5, y: 0.5 }}
      accessibilityLabel={`${place.name}, ${place.category}${
        place.isFavorite ? ', favorite' : ''
      }${isVisited ? ', visited' : ''}${isSelected ? ', selected' : ''}`}
      zIndex={isSelected ? 3 : 1}
      onPress={event => {
        event.stopPropagation();
        onSelect(place.id);
      }}
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full border-2 border-app-surface shadow-sm ${markerClassName}`}
      >
        <Icon color="#FFFFFF" size={19} strokeWidth={2.5} />
      </View>
    </Marker>
  );
});
