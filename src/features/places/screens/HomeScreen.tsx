import { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppButton } from '../../../shared/components/AppButton';
import { AnimatedListItem } from '../../../shared/components/AnimatedListItem';
import { EmptyState } from '../../../shared/components/EmptyState';
import { LoadingState } from '../../../shared/components/LoadingState';
import { Screen } from '../../../shared/components/Screen';
import {
  getDistanceMeters,
  type CurrentLocation,
} from '../../../utils/location';
import { CurrentLocationAction } from '../../location/components/CurrentLocationAction';
import {
  placeCategories,
  placeCategoryLabels,
  type PlaceCategory,
} from '../model/place.constants';
import { usePlacesStore } from '../model/places.store';
import type { Place } from '../model/place.types';
import { CategoryChip } from '../components/CategoryChip';
import { PlaceCard } from '../components/PlaceCard';
import { SearchInput } from '../components/SearchInput';

type CategoryFilter = PlaceCategory | 'all';
type SortMode = 'newest' | 'name' | 'distance';

type PlaceListItem = {
  place: Place;
  distanceMeters?: number;
};

export function HomeScreen() {
  const navigation = useNavigation();
  const placesById = usePlacesStore(state => state.placesById);
  const placeIds = usePlacesStore(state => state.placeIds);
  const hasHydrated = usePlacesStore(state => state.hasHydrated);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation>();

  const filteredPlaces = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matchingPlaces = placeIds.flatMap(placeId => {
      const place = placesById[placeId];

      if (!place) {
        return [];
      }

      const matchesQuery =
        !normalizedQuery ||
        place.name.toLowerCase().includes(normalizedQuery) ||
        place.address?.toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        selectedCategory === 'all' || place.category === selectedCategory;
      const matchesFavorite = !favoritesOnly || place.isFavorite;

      return matchesQuery && matchesCategory && matchesFavorite ? [place] : [];
    });

    const placesWithDistance = matchingPlaces.map(place => ({
      place,
      distanceMeters: currentLocation
        ? getDistanceMeters(currentLocation, place.coordinates)
        : undefined,
    }));

    if (sortMode === 'name') {
      return [...placesWithDistance].sort((first, second) =>
        first.place.name.localeCompare(second.place.name),
      );
    }

    if (sortMode === 'distance' && currentLocation) {
      return [...placesWithDistance].sort(
        (first, second) =>
          (first.distanceMeters ?? Number.POSITIVE_INFINITY) -
          (second.distanceMeters ?? Number.POSITIVE_INFINITY),
      );
    }

    return placesWithDistance;
  }, [
    currentLocation,
    favoritesOnly,
    placeIds,
    placesById,
    searchQuery,
    selectedCategory,
    sortMode,
  ]);

  function renderPlace({
    item,
    index,
  }: {
    item: PlaceListItem;
    index: number;
  }) {
    return (
      <AnimatedListItem index={index}>
        <PlaceCard
          place={item.place}
          distanceMeters={item.distanceMeters}
          onPress={() =>
            navigation.navigate('PlaceDetails', { placeId: item.place.id })
          }
        />
      </AnimatedListItem>
    );
  }

  if (!hasHydrated) {
    return (
      <Screen safeEdges={[]}>
        <LoadingState label="Loading saved places..." />
      </Screen>
    );
  }

  return (
    <Screen safeEdges={[]}>
      <View className="gap-4 px-5 pb-4 pt-5">
        <View className="gap-3">
          <AppButton
            label="Search places"
            variant="secondary"
            onPress={() => navigation.navigate('Search')}
          />
          <AppButton
            label="Add place"
            onPress={() => navigation.navigate('AddPlace')}
          />
        </View>
        <SearchInput value={searchQuery} onChangeText={setSearchQuery} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          <CategoryChip
            label="All"
            isSelected={selectedCategory === 'all'}
            onPress={() => setSelectedCategory('all')}
          />
          {placeCategories.map(category => (
            <CategoryChip
              key={category}
              label={placeCategoryLabels[category]}
              isSelected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
          <CategoryChip
            label="Favorites"
            isSelected={favoritesOnly}
            onPress={() => setFavoritesOnly(current => !current)}
          />
        </ScrollView>
        <View className="gap-2">
          <Text className="text-sm font-medium text-app-text">Sort places</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
            <CategoryChip
              label="Newest"
              isSelected={sortMode === 'newest'}
              onPress={() => setSortMode('newest')}
            />
            <CategoryChip
              label="Name"
              isSelected={sortMode === 'name'}
              onPress={() => setSortMode('name')}
            />
            <CategoryChip
              label="Nearest"
              isSelected={sortMode === 'distance'}
              onPress={() => setSortMode('distance')}
            />
          </ScrollView>
          {sortMode === 'distance' ? (
            <CurrentLocationAction
              label="Use current location"
              onLocation={setCurrentLocation}
            />
          ) : null}
        </View>
      </View>
      <FlatList
        className="flex-1 px-5"
        contentContainerClassName="gap-3 pb-6"
        data={filteredPlaces}
        keyExtractor={item => item.place.id}
        ListEmptyComponent={
          <EmptyState
            title={
              placeIds.length === 0 ? 'No saved places' : 'No matches found'
            }
            description={
              placeIds.length === 0
                ? 'Add a place manually or search for one.'
                : 'Try a different search or filter.'
            }
            action={
              placeIds.length === 0 ? (
                <AppButton
                  label="Add place"
                  onPress={() => navigation.navigate('AddPlace')}
                />
              ) : undefined
            }
          />
        }
        renderItem={renderPlace}
      />
    </Screen>
  );
}
