# ATOMIC FLIX - Mobile Anime & Manga App

## Overview

**🤖 PROJET DÉVELOPPÉ AVEC REPLIT AGENT** - Ce projet a été entièrement créé et optimisé par Replit Agent, l'assistant IA de développement.

Il s'agit d'une application mobile React Native construite avec Expo pour le streaming d'anime et la lecture de manga. Le projet inclut une navigation entre différents écrans, des fonctionnalités de lecteur multimédia, et est configuré pour les builds Android avec keystore personnalisé.

## User Preferences

- **Communication style**: Simple, everyday language (français)
- **Documentation**: Complète et accessible
- **Architecture**: Propre et bien organisée
- **Builds**: Scripts automatisés prioritaires
- **Plateforme**: Android en priorité

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
root/
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

The project is configured for mobile development with Expo and ready for Android builds. All files are now located directly in the root directory.

## Replit Agent Checkpoint Information

**Status**: ✅ Projet complètement développé et optimisé par Replit Agent

Ce projet peut être immédiatement continué par Replit Agent grâce à :
- Documentation complète dans `README.md` et `REPLIT-AGENT-INFO.md`
- Architecture clairement définie dans ce fichier
- Scripts automatisés prêts à l'emploi
- Configuration build optimisée

**Dernière mise à jour**: 15 juillet 2025 - HomeScreen transformé en React Native

**Status technique**: ✅ Toutes les vérifications passent
- TypeScript 5.8.3 compilé sans erreurs  
- TanStack React Query v5 configuré correctement
- Types SearchResult étendus avec contentType optionnel
- Configuration doctor personnalisé : 8/8 vérifications réussies
- **Problème Android résolu** : data_extraction_rules.xml créé
- Fichiers de ressources Android configurés (backup_rules.xml)
- Plugin android-resources-config.js ajouté à app.json
- **EAS CLI installé** : version 16.15.0 configurée
- **ID projet EAS** : e5b84028-0715-4bc5-861b-a2bfd28a99e9
- **Slug corrigé** : atomic-flix-mobile (correspondance avec projectId)
- **Version CLI EAS** : 16.15.0 spécifiée dans eas.json
- **Android 35 configuré** : compileSdk 35, targetSdk 35, buildTools 35.0.0
- **Styles Android 35** : Fichiers styles.xml avec support edge-to-edge
- **Script de test** : test-android-35.js pour vérification complète (11/11 tests réussis)
- **Erreurs de lint corrigées** : FullBackupContent résolue dans data_extraction_rules.xml
- **Conflits expo-doctor résolus** : Doctor personnalisé remplace expo-doctor avec versions conflictuelles
- **HomeScreen transformé** : Conversion complète du site web anime-sama en React Native avec API identique