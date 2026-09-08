import AsyncStorage from '@react-native-async-storage/async-storage';

export const legacyStorageKeys = {
  places: '@travel-planner/places',
  trips: '@travel-planner/trips',
  searchPrefix: '@travel-planner/place-search/',
} as const;

export async function readLegacyStore(key: string) {
  return AsyncStorage.getItem(key);
}

export async function removeLegacyData() {
  const keys = await AsyncStorage.getAllKeys();
  const appKeys = keys.filter(
    key =>
      key === legacyStorageKeys.places ||
      key === legacyStorageKeys.trips ||
      key.startsWith(legacyStorageKeys.searchPrefix),
  );

  if (appKeys.length > 0) {
    await AsyncStorage.multiRemove(appKeys);
  }
}
