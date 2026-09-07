import {
  createStaticNavigation,
  type StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddPlaceScreen } from '../features/places/screens/AddPlaceScreen';
import { PlaceDetailsScreen } from '../features/places/screens/PlaceDetailsScreen';
import { SearchScreen } from '../features/places/screens/SearchScreen';
import { CreateTripScreen } from '../features/trips/screens/CreateTripScreen';
import { TripDetailsScreen } from '../features/trips/screens/TripDetailsScreen';
import { colors } from '../shared/theme/colors';
import { MainTabs } from './MainTabs';
import { appNavigationTheme } from './navigationTheme';

export const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: colors.surface,
    },
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: '700',
    },
  },
  screens: {
    MainTabs: {
      screen: MainTabs,
      options: {
        headerShown: false,
      },
    },
    Search: {
      screen: SearchScreen,
      options: {
        title: 'Search places',
      },
    },
    PlaceDetails: {
      screen: PlaceDetailsScreen,
      options: {
        title: 'Place details',
      },
    },
    AddPlace: {
      screen: AddPlaceScreen,
      options: {
        title: 'Add place',
      },
    },
    CreateTrip: {
      screen: CreateTripScreen,
      options: {
        title: 'Create trip',
      },
    },
    TripDetails: {
      screen: TripDetailsScreen,
      options: {
        title: 'Trip details',
      },
    },
  },
});

export type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(RootStack);

export function AppNavigator() {
  return <Navigation theme={appNavigationTheme} />;
}
