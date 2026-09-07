import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';

import type { PlaceSearchResult } from '../../../api/places';
import { useAppNavigation } from '../../../navigation/useAppNavigation';
import { AppButton } from '../../../shared/components/AppButton';
import { AnimatedListItem } from '../../../shared/components/AnimatedListItem';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ErrorState } from '../../../shared/components/ErrorState';
import { LoadingState } from '../../../shared/components/LoadingState';
import { Screen } from '../../../shared/components/Screen';
import { PlaceSearchResultCard } from '../components/PlaceSearchResultCard';
import { SearchInput } from '../components/SearchInput';
import { usePlaceSearch } from '../hooks/usePlaceSearch';

export function SearchScreen() {
  const navigation = useAppNavigation();
  const headerHeight = useHeaderHeight();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [inputError, setInputError] = useState<string>();
  const search = usePlaceSearch(submittedQuery);

  function submitSearch() {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      setInputError('Enter at least 2 characters.');
      return;
    }

    setInputError(undefined);
    setSubmittedQuery(normalizedQuery);
  }

  function clearSearch() {
    setQuery('');
    setSubmittedQuery('');
    setInputError(undefined);
  }

  function addPlace(result: PlaceSearchResult) {
    navigation.navigate('AddPlace', {
      initialName: result.name,
      initialAddress: result.address,
      initialCategory: result.category,
      initialLatitude: result.coordinates.latitude,
      initialLongitude: result.coordinates.longitude,
      initialExternalId: result.externalId,
      initialSource: 'nominatim',
    });
  }

  return (
    <Screen safeEdges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <View className="gap-3 px-5 py-5">
          <SearchInput
            value={query}
            onClear={clearSearch}
            onChangeText={value => {
              setQuery(value);
              if (inputError) setInputError(undefined);
            }}
            onSubmit={submitSearch}
            placeholder="Search places, addresses, or landmarks"
          />
          {inputError ? (
            <Text accessibilityRole="alert" className="text-sm text-app-danger">
              {inputError}
            </Text>
          ) : null}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <AppButton label="Search" onPress={submitSearch} />
            </View>
            {query || submittedQuery ? (
              <AppButton label="Clear" variant="ghost" onPress={clearSearch} />
            ) : null}
          </View>
        </View>
        {search.isPending ? <LoadingState label="Searching places..." /> : null}
        {search.isError ? (
          <View className="px-5">
            <ErrorState
              title="Search is unavailable"
              description="Check your connection and try again."
              onRetry={() => search.refetch()}
            />
          </View>
        ) : null}
        {!submittedQuery ? (
          <View className="px-5">
            <EmptyState
              title="Find a place"
              description="Search by name, address, or landmark."
            />
          </View>
        ) : null}
        {submittedQuery && search.data?.results.length === 0 ? (
          <View className="px-5">
            <EmptyState
              title="No places found"
              description="Try a more specific place name or address."
            />
          </View>
        ) : null}
        {search.data?.source === 'cache' ? (
          <Text className="px-5 pb-3 text-sm text-app-muted">
            You are offline. Showing saved search results.
          </Text>
        ) : null}
        {search.data?.results.length ? (
          <FlatList
            className="flex-1 px-5"
            contentContainerClassName="gap-3 pb-6"
            data={search.data.results}
            keyExtractor={result => result.externalId}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <Text className="pb-3 text-xs text-app-muted">
                Search data © OpenStreetMap contributors
              </Text>
            }
            renderItem={({ item, index }) => (
              <AnimatedListItem index={index}>
                <PlaceSearchResultCard
                  result={item}
                  onAdd={() => addPlace(item)}
                />
              </AnimatedListItem>
            )}
          />
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}
