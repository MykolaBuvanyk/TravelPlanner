import { memo } from 'react';
import { Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

import type { MapCluster } from '../hooks/useMapClusters';

type PlaceClusterMarkerProps = {
  cluster: MapCluster;
  onPress: (cluster: MapCluster) => void;
};

export const PlaceClusterMarker = memo(function PlaceClusterMarker({
  cluster,
  onPress,
}: PlaceClusterMarkerProps) {
  return (
    <Marker
      identifier={`cluster-${cluster.id}`}
      coordinate={cluster.coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      accessibilityLabel={`${cluster.places.length} places. Double tap to zoom in.`}
      zIndex={2}
      onPress={event => {
        event.stopPropagation();
        onPress(cluster);
      }}
    >
      <View className="h-11 min-w-11 items-center justify-center rounded-full border-2 border-app-surface bg-app-primary px-2 shadow-sm">
        <Text className="text-sm font-bold text-app-surface">
          {cluster.places.length}
        </Text>
      </View>
    </Marker>
  );
});
