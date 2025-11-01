# ATOMIC FLIX - Mobile Anime & Manga App

## Overview

ATOMIC FLIX is a React Native mobile application built with Expo, designed for streaming anime and reading manga. Its primary purpose is to provide a seamless and feature-rich experience for anime and manga enthusiasts, offering intuitive navigation, robust media playback, and a consistent user interface across mobile platforms, primarily Android. The project aims to be a comprehensive and engaging platform for otakus, featuring real-time trending content, personalized planning for new releases, and intelligent notification systems.

## Recent Changes

### November 1, 2025 - Migration vers Expo SDK 54
-   **Mise à jour majeure**: Migration de React Native et React vers des versions compatibles avec Expo SDK 54.0.21
    -   React: 19.1.0 (version exacte requise)
    -   React Native: 0.81.5 (compatible avec Expo SDK 54)
    -   Résolution du problème `ReactNativeApplicationEntryPoint` qui causait l'échec des builds Android
-   **Nettoyage des dépendances**: Suppression de `@expo/cli` dans devDependencies pour éviter les conflits de versions
-   **Validation**: Tous les 15 checks expo doctor passent avec succès

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

-   **Mobile Framework**: React Native 0.81.5 with Expo SDK 54.0.21, focused on Android compatibility.
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
    -   **Error Handling System**: Intelligent error detection and display system that distinguishes between network errors (no internet connection) and server errors (server temporarily unavailable):
        -   `apiRequestWithRetry` in `src/utils/apiWithRetry.ts`: Automatic retry logic with exponential backoff and error type detection
        -   `ErrorType`: Type system that categorizes errors as 'network', 'server', or 'unknown'
        -   `ServerErrorCard`: Displays friendly message "Serveur temporairement indisponible - Notre équipe travaille pour résoudre le problème au plus vite" when server is down
        -   `OfflineErrorCard`: Displays "Connexion interrompue - Vérifiez votre connexion internet" when user has no internet
        -   Smart classification: Timeouts and AbortErrors are classified as server errors, while NetworkErrors and Failed fetch are network errors
    -   **Background Processing**: Services for notifications and content updates, using AsyncStorage.
    -   **User Interaction**: `expo-keep-awake` for video, `expo-screen-orientation` for dynamic orientation, and `SafeAreaView` for consistent UI.
    -   **Search Functionality**: Global search modal with caching, debouncing, and automatic navigation.
    -   **Theme System**: Comprehensive dark/light theme support with:
        -   `ThemeContext`: Centralized theme management with automatic persistence via AsyncStorage
        -   `useTheme()` hook: Provides theme state, colors, and utility functions (getGradient, getOverlayGradient, hexToRgba)
        -   `useThemedStyles()` hook: Creates reactive styles that update automatically on theme change
        -   Complete color palettes: COLORS (dark) and LIGHT_COLORS with full parity (gradients, states, badges, borders)
        -   Gradient helpers: `getGradientColors()`, `createCosmicGradient()`, `createOverlayGradient()` for consistent theming
        -   Text styles helper: `getThemedTextStyles(isDark)` returns dynamic text styles that adapt to theme (white text in dark mode, black text in light mode)
        -   Memoized color computations for optimal performance

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