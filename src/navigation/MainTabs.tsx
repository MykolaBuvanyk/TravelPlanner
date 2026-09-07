import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, Map, Route } from 'lucide-react-native';
import { HomeScreen } from '../features/places/screens/HomeScreen';
import { MapScreen } from '../features/map/screens/MapScreen';
import { TripsScreen } from '../features/trips/screens/TripsScreen';
import { colors } from '../shared/theme/colors';

export const MainTabs = createBottomTabNavigator({
  screenOptions: {
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: colors.surface,
    },
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: '700',
    },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.muted,
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
    },
  },
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: 'Places',
        tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
      },
    },
    Map: {
      screen: MapScreen,
      options: {
        title: 'Map',
        tabBarIcon: ({ color, size }) => <Map color={color} size={size} />,
      },
    },
    Trips: {
      screen: TripsScreen,
      options: {
        title: 'Trips',
        tabBarIcon: ({ color, size }) => <Route color={color} size={size} />,
      },
    },
  },
});
