import { AppNavigator } from '../navigation/AppNavigator';
import { StatusBar } from 'react-native';

import { AppProviders } from './providers/AppProviders';

export function AppRoot() {
  return (
    <AppProviders>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </AppProviders>
  );
}
