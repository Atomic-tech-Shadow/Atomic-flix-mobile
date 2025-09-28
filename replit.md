# ATOMIC FLIX - Mobile Anime & Manga App

## Overview

ATOMIC FLIX is a React Native mobile application built with Expo, designed for streaming anime and reading manga. Its primary purpose is to provide a seamless and feature-rich experience for anime and manga enthusiasts, offering intuitive navigation, robust media playback, and a consistent user interface across mobile platforms, primarily Android. The project aims to be a comprehensive and engaging platform for otakus, featuring real-time trending content, personalized planning for new releases, and intelligent notification systems.

## User Preferences

-   **Communication style**: Simple, everyday language (français)
-   **Documentation**: Complète et accessible
-   **Architecture**: Propre et bien organisée
-   **Builds**: Scripts automatisés prioritaires
-   **Plateforme**: Android en priorité
-   **Maintenance**: Préfère un projet propre sans fichiers inutiles
-   **Design**: Cohérence visuelle - tous les écrans doivent utiliser le même fond (COLORS.primary)

## System Architecture

The application adopts a React Native/Expo mobile app architecture emphasizing clean code, performance, and user experience.

-   **Mobile Framework**: React Native with Expo SDK ~53.0.19, focused on Android compatibility.
-   **Navigation**: React Navigation for stack-based navigation.
-   **State Management**: TanStack React Query for efficient API state management.
-   **Language**: Full TypeScript support with strict configuration.
-   **Build System**: Expo Application Services (EAS) for Android APK generation with custom keystore signing.
-   **UI/UX Decisions**:
    -   **Color Scheme**: Uniform main purple background (`#8B5DFF`), bright cyan (`#00D4FF`) for headers and secondary elements, and accent pink (`#FF6B9D`) for special sections. All background colors use `COLORS.primary` for consistency.
    -   **Design Patterns**: Consistent use of horizontal scroll sections and compact, information-rich cards.
    -   **Interactive Elements**: Modern 3D logo, harmonized intelligent badges (ANIME: violet, MANGA: pink, FILM: cyan), and language badges (VF, VOSTFR) with consistent colors.
    -   **Performance**: `OptimizedScrollView` and `OptimizedFlatList` for smooth scrolling, native drivers, and minimal animations.
    -   **Splash Screen**: Custom atomic-themed animated logo and slogan.
    -   **Header**: Unified `SharedHeader` with 3D logo and gradient text.
    -   **Player Interface**: `WebView` for video streaming with custom controls for episode navigation, server selection, and language toggling using national flags.
    -   **Notifications**: Comprehensive system with interactive bell icon, unread badges, and visual modals.
    -   **Telegram Verification**: Dedicated modal for Telegram channel subscription verification.
-   **System Design Choices**:
    -   **Modular Components**: Reusable UI and logic components.
    -   **API Integration**: Strict adherence to specific API endpoints with robust error handling.
    -   **Background Processing**: Services for notifications and content updates, using AsyncStorage.
    -   **User Interaction**: `expo-keep-awake` for video, `expo-screen-orientation` for dynamic orientation, and `SafeAreaView` for consistent UI.
    -   **Search Functionality**: Global search modal with caching, debouncing, and automatic navigation.

## External Dependencies

-   **React**: Core UI library.
-   **React Native**: Mobile app framework.
-   **Expo**: SDK including `expo-notifications`, `expo-blur`, `expo-keep-awake`, `expo-screen-orientation`, `expo-splash-screen`.
-   **React Navigation**: Navigation library.
-   **TanStack React Query**: Data fetching and state management.
-   **React Native Gesture Handler**: Touch gestures.
-   **React Native Reanimated**: Animations.
-   **React Native Svg**: SVG rendering.
-   **React Native WebView**: Web content embedding (video streaming).
-   **@react-native-picker/picker**: Customizable dropdowns.
-   **AsyncStorage**: Local data persistence.
-   **Vercel**: Backend deployment for API services (e.g., `atomic-flix-verifier-bot.vercel.app`).
-   **Telegram API**: User subscription verification.