import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Season } from '../types';

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
  AnimePlayer: { animeUrl: string; seasonData: Season; animeTitle: string };
  MangaReader: { mangaUrl: string; mangaTitle: string };
  About: undefined;
  NotFound: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#0f172a" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0f172a',
            borderBottomWidth: 1,
            borderBottomColor: '#1e293b',
          },
          headerTintColor: '#f8fafc',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          cardStyle: {
            backgroundColor: '#0f172a',
          },
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
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="AnimeDetail" 
          component={AnimeDetailScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen 
          name="AnimePlayer" 
          component={AnimePlayerScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="MangaReader" 
          component={MangaReaderScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="About" 
          component={AboutScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="NotFound" 
          component={NotFoundScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="PrivacyPolicy" 
          component={PrivacyPolicyScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="TermsOfService" 
          component={TermsOfServiceScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;