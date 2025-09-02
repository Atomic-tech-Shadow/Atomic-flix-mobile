import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { Season } from '../types';
import DrawerContent from '../components/DrawerContent';
import { COLORS } from '../constants/newColors';

// Import screens - exact reproductions of web pages
import HomeScreen from '../screens/HomeScreen';
import AnimeDetailScreen from '../screens/AnimeDetailScreen';
import MangaReaderScreen from '../screens/MangaReaderScreen';
import AboutScreen from '../screens/AboutScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import AnimePlayerScreen from '../screens/AnimePlayerScreen';

export type RootStackParamList = {
  Home: undefined;
  AnimeDetail: { animeUrl: string; animeTitle: string };
  AnimePlayer: { 
    animeUrl: string; 
    seasonData?: Season | null; 
    animeTitle: string;
    initialEpisode?: number;
    initialLanguage?: 'VF' | 'VOSTFR';
  };
  MangaReader: { mangaUrl: string; mangaTitle: string };
  About: undefined;
  NotFound: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
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
        animationEnabled: true,
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
      <Stack.Screen name="MangaReader" component={MangaReaderScreen} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#8B5DFF" />
      <Drawer.Navigator
        initialRouteName="HomeStack"
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: 'slide',
          drawerStyle: {
            width: 280,
          },
          swipeEnabled: true,
          gestureHandlerProps: {
            activeOffsetX: 10,
          },
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
    </NavigationContainer>
  );
};

export default AppNavigator;