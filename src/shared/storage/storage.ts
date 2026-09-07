import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';
import { useStorageStatus } from './storageStatus.store';

export const storageKeys = {
  places: '@travel-planner/places',
  trips: '@travel-planner/trips',
} as const;

const pending = new Map<string, string>();
let writes: Promise<void> = Promise.resolve();

function save(name: string, value: string) {
  pending.set(name, value);
  writes = writes.then(async () => {
    try {
      await AsyncStorage.setItem(name, value);
      if (pending.get(name) === value) pending.delete(name);
      if (pending.size === 0) useStorageStatus.getState().setWriteError(false);
    } catch {
      useStorageStatus.getState().setWriteError(true);
    }
  });
  return writes;
}

export function retryStorageWrites() {
  for (const [name, value] of pending) save(name, value);
}

export function createAppStorage<T>() {
  return createJSONStorage<T>(() => ({
    getItem: name => AsyncStorage.getItem(name),
    setItem: save,
    removeItem: name => AsyncStorage.removeItem(name),
  }));
}
