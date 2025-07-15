import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Import screens - exact reproductions of web pages
import HomeScreen from '../screens/HomeScreen';
import AnimeDetailScreen from '../screens/AnimeDetailScreen';
import AnimePlayerScreen from '../screens/AnimePlayerScreen';
import MangaReaderScreen from '../screens/MangaReaderScreen';

export type RootStackParamList = {
  Home: undefined;
  AnimeDetail: { animeUrl: string; animeTitle: string };
  AnimePlayer: { animeUrl: string; seasonData: any; animeTitle: string };
  MangaReader: { mangaUrl: string; mangaTitle: string };
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
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'ATOMIC FLIX',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen 
          name="AnimeDetail" 
          component={AnimeDetailScreen}
          options={({ route }) => ({
            title: route.params.animeTitle,
            headerBackTitleVisible: false,
          })}
        />
        <Stack.Screen 
          name="AnimePlayer" 
          component={AnimePlayerScreen}
          options={({ route }) => ({
            title: route.params.animeTitle,
            headerBackTitleVisible: false,
          })}
        />
        <Stack.Screen 
          name="MangaReader" 
          component={MangaReaderScreen}
          options={({ route }) => ({
            title: route.params.mangaTitle,
            headerBackTitleVisible: false,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;