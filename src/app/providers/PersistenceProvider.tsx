import { useEffect, useState, type PropsWithChildren } from 'react';
import { Text, View } from 'react-native';
import { usePlacesStore } from '../../features/places/model/places.store';
import { useTripsStore } from '../../features/trips/model/trips.store';
import { Screen } from '../../shared/components/Screen';
import { LoadingState } from '../../shared/components/LoadingState';
import { ErrorState } from '../../shared/components/ErrorState';
import { AppButton } from '../../shared/components/AppButton';
import { useStorageStatus } from '../../shared/storage/storageStatus.store';
import { retryStorageWrites } from '../../shared/storage/storage';

let hydration: Promise<void> | undefined;
function hydrate() {
  if (!hydration) {
    hydration = (async () => {
      await usePlacesStore.persist.rehydrate();
      if (!usePlacesStore.persist.hasHydrated())
        throw new Error('Unable to load places.');
      await useTripsStore.persist.rehydrate();
      if (!useTripsStore.persist.hasHydrated())
        throw new Error('Unable to load trips.');
    })().catch(error => {
      hydration = undefined;
      throw error;
    });
  }
  return hydration;
}

export function PersistenceProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );
  const [attempt, setAttempt] = useState(0);
  const writeError = useStorageStatus(state => state.writeError);
  useEffect(() => {
    let active = true;
    void hydrate().then(
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

  if (status !== 'ready')
    return (
      <Screen className="justify-center px-5">
        {status === 'loading' ? (
          <LoadingState label="Loading your travel plans..." />
        ) : (
          <ErrorState
            title="Unable to load saved data"
            description="Your saved data has not been deleted. Please try again."
            onRetry={() => {
              setStatus('loading');
              setAttempt(value => value + 1);
            }}
          />
        )}
      </Screen>
    );

  return (
    <View className="flex-1">
      {children}
      {writeError ? (
        <Screen safeEdges={['bottom']} className="flex-none gap-2 px-5 py-3">
          <Text className="text-app-danger">
            Changes could not be saved. Keep the app open and try again.
          </Text>
          <AppButton label="Retry saving" onPress={retryStorageWrites} />
        </Screen>
      ) : null}
    </View>
  );
}
