import { useEffect, useState, type PropsWithChildren } from 'react';
import { Text, View } from 'react-native';

import { migrateLegacyData } from '../persistence/migrateLegacyData';
import { usePlacesStore } from '../../features/places/model/places.store';
import { useTripsStore } from '../../features/trips/model/trips.store';
import { AppButton } from '../../shared/components/AppButton';
import { ErrorState } from '../../shared/components/ErrorState';
import { LoadingState } from '../../shared/components/LoadingState';
import { Screen } from '../../shared/components/Screen';
import { initializeDatabase } from '../../shared/database/database';
import { useDatabaseStatus } from '../../shared/database/databaseStatus.store';

let appDatabaseLoading: Promise<void> | undefined;

function loadAppDatabase() {
  if (!appDatabaseLoading) {
    appDatabaseLoading = (async () => {
      await initializeDatabase();
      await migrateLegacyData();
      await usePlacesStore.getState().hydrate();
      await useTripsStore.getState().hydrate();
    })().catch(error => {
      appDatabaseLoading = undefined;
      throw error;
    });
  }

  return appDatabaseLoading;
}

export function DatabaseProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const writeError = useDatabaseStatus(state => state.writeError);
  const setWriteError = useDatabaseStatus(state => state.setWriteError);

  useEffect(() => {
    let active = true;
    loadAppDatabase().then(
      () => {
        if (active) setStatus('ready');
      },
      () => {
        if (active) setStatus('error');
      },
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  if (status !== 'ready') {
    return (
      <Screen className="justify-center px-5">
        {status === 'loading' ? (
          <LoadingState label="Loading your travel plans..." />
        ) : (
          <ErrorState
            title="Unable to open local database"
            description="Your saved data has not been deleted. Please try again."
            onRetry={() => {
              setStatus('loading');
              setAttempt(value => value + 1);
            }}
          />
        )}
      </Screen>
    );
  }

  return (
    <View className="flex-1">
      {children}
      {writeError ? (
        <Screen safeEdges={['bottom']} className="flex-none gap-2 px-5 py-3">
          <Text className="text-app-danger">
            The change could not be saved to this device. Please try again.
          </Text>
          <AppButton label="Dismiss" onPress={() => setWriteError(false)} />
        </Screen>
      ) : null}
    </View>
  );
}
