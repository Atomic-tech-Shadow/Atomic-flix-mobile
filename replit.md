# Shadow Project

## Overview

This is a React Native mobile application built with Expo for anime and manga streaming/reading. The project includes navigation between different screens, media player functionality, and is configured for Android builds.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a React Native/Expo mobile app architecture:

- **Mobile Framework**: React Native with Expo SDK ~53.0.19
- **Navigation**: React Navigation with stack navigator
- **State Management**: TanStack React Query for API state management
- **TypeScript**: Full TypeScript support with strict configuration
- **Build System**: Expo Application Services (EAS) for production builds

## Key Components

### Main Application (`App.tsx`)
- Root component with navigation setup
- Status bar configuration
- Main app entry point

### Navigation (`src/navigation/AppNavigator.tsx`)
- Stack-based navigation between screens
- Screen routing configuration

### Screens
- **HomeScreen**: Main landing page
- **AnimeDetailScreen**: Detailed anime information
- **AnimePlayerScreen**: Video player for anime episodes  
- **MangaReaderScreen**: Manga reading interface

### Configuration Files
- `app.json`: Expo app configuration
- `eas.json`: Build configuration for Android/iOS
- `babel.config.js`: Babel transpilation setup
- `metro.config.js`: Metro bundler configuration

## Data Flow

1. App initializes with React Query client
2. Navigation system handles screen transitions
3. API calls managed through React Query hooks
4. Media content displayed in specialized player components

## External Dependencies

- **React**: 19.0.0 with React Native 0.79.5
- **Expo**: Complete Expo SDK for mobile development
- **Navigation**: React Navigation for screen management
- **Query Client**: TanStack React Query for data fetching
- **Gestures**: React Native Gesture Handler for interactions
- **Animation**: React Native Reanimated for smooth animations

## Build & Deployment Strategy

The application supports multiple build configurations:

- **Development**: `expo start` for local development
- **Android**: EAS Build for production APK generation
- **Signing**: Custom keystore for Android app signing
- **Scripts**: Automated build and dependency management scripts

### Current Structure
```
shadow/
├── App.tsx (main app component)
├── src/
│   ├── navigation/ (routing)
│   ├── screens/ (app screens)
│   ├── types/ (TypeScript definitions)
│   └── utils/ (utilities)
├── assets/ (app icons and images)
├── package.json (dependencies)
├── app.json (expo config)
├── eas.json (build config)
└── build scripts and configuration files
```

The project is configured for mobile development with Expo and ready for Android builds.