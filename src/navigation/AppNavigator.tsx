import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
import { Season } from '../types';
import DrawerContent from '../components/DrawerContent';
import { COLORS } from '../constants/newColors';
import GlobalBackground from '../components/GlobalBackground';
import { NotificationService } from '../services/NotificationService';

// Import screens - exact reproductions of web pages
import HomeScreen from '../screens/HomeScreen';
import AnimeDetailScreen from '../screens/AnimeDetailScreen';
import AboutScreen from '../screens/AboutScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import AnimePlayerScreen from '../screens/AnimePlayerScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';

export type RootStackParamList = {
  Home: undefined;
  AnimeDetail: { animeUrl: string; animeTitle: string };
  AnimePlayer: { 
    animeUrl: string; 
    seasonData?: Season | null; 
    animeTitle: string;
    initialEpisode?: number;
    initialLanguage?: 'VF' | 'VOSTFR';
    seasonNumber?: string | number;
    episodeNumber?: string | number;
    language?: string;
  };
  About: undefined;
  NotFound: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

const linking = {
  prefixes: ['atomicflix://', 'https://atomic-flix.com'],
  config: {
    screens: {
      HomeStack: {
        screens: {
          AnimePlayer: 'player/:animeUrl/:seasonNumber/:episodeNumber/:language',
        },
      },
    },
  },
};

export type DrawerParamList = {
  HomeStack: undefined;
  About: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

// Stack Navigator pour les écrans principaux
const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        // Optimisations pour des transitions rapides et fluides
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        transitionSpec: {
          open: {
            animation: 'timing',
            config: { duration: 300 }
          },
          close: {
            animation: 'timing', 
            config: { duration: 250 }
          }
        },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AnimeDetail" component={AnimeDetailScreen} />
      <Stack.Screen name="AnimePlayer" component={AnimePlayerScreen} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const navigationRef = React.useRef<any>(null);

  React.useEffect(() => {
    // Configuration de la barre de navigation Android pour un mode immersif
    if (Platform.OS === 'android') {
      NavigationBar.setPositionAsync('absolute');
      NavigationBar.setBackgroundColorAsync('#00000000'); // Transparent
      NavigationBar.setButtonStyleAsync('light');
    }

    const service = NotificationService.getInstance();
    const unsubscribe = () => {
      const listener = (data: any) => {
        if (navigationRef.current && data.screen) {
          navigationRef.current.navigate(data.screen, data.params);
        }
      };
      service.navigationListeners.add(listener);
      return () => service.navigationListeners.delete(listener);
    };
    const cleanup = unsubscribe();
    return () => {
      cleanup();
    };
  }, []);

  return (
    <NavigationContainer linking={linking as any} ref={navigationRef}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <GlobalBackground>
        <Drawer.Navigator
          initialRouteName="HomeStack"
          drawerContent={(props) => <DrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerType: 'slide',
            drawerStyle: {
              width: 280,
              backgroundColor: 'transparent',
            },
            swipeEnabled: true,
          }}
        >
          <Drawer.Screen 
            name="HomeStack" 
            component={HomeStackNavigator}
            options={{
              drawerLabel: 'Accueil',
            }}
          />
          <Drawer.Screen 
            name="About" 
            component={AboutScreen}
            options={{
              drawerLabel: 'À propos',
            }}
          />
          <Drawer.Screen 
            name="PrivacyPolicy" 
            component={PrivacyPolicyScreen}
            options={{
              drawerLabel: 'Confidentialité',
            }}
          />
          <Drawer.Screen 
            name="TermsOfService" 
            component={TermsOfServiceScreen}
            options={{
              drawerLabel: 'Conditions',
            }}
          />
        </Drawer.Navigator>
      </GlobalBackground>
    </NavigationContainer>
  );
};

export default AppNavigator;