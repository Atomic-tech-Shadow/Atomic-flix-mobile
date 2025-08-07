# ATOMIC FLIX - Mobile Anime & Manga App

## Overview

ATOMIC FLIX is a React Native mobile application built with Expo, designed for streaming anime and reading manga. Developed entirely with Replit Agent, its primary purpose is to provide a seamless and feature-rich experience for anime and manga enthusiasts. The project aims to offer intuitive navigation, robust media playback capabilities, and a consistent user interface across mobile platforms, primarily Android. It integrates advanced features like real-time trending content, personalized planning for new releases, and intelligent notification systems. The vision is to create a go-to platform for otakus, offering a comprehensive and engaging content consumption experience.

**Current Version**: 3.3.3 (Updated: 6 août 2025)

## Recent Changes (August 2025)

- **Version Bump**: 3.3.0 → 3.3.3 with versionCode 333
- **Server Switching Bug Fixed** (6 août 2025): Corrected critical issue where changing video servers would reset to episode 1
  - Removed automatic `setSelectedPlayer(0)` reset in `loadEpisodeSources()` 
  - Added immediate WebView reload on server change while preserving episode selection
  - User server preference is now maintained across episode and server changes
- **Date Updates**: Corrected all 2024 dates to 2025 across application
- **Visual Consistency**: Complete uniformization of purple background theme (#8B5DFF) across all screens
- **Color Semantics**: Standardized all background colors to use COLORS.primary instead of COLORS.background.secondary
- **Text Color System**: Complete standardization of text colors (6 août 2025)
  - Enhanced `COLORS.text` with semantic color system: primary, secondary, muted, accent, success, warning, error, disabled
  - Replaced all hardcoded color values (#ffffff, #ef4444, #94a3b8, etc.) with COLORS constants
  - Improved accessibility and design consistency across all components
  - Better color hierarchy for titles, descriptions, and UI states
- **Language Switching**: Complete overhaul for fluid language switching (7 août 2025)
  - Removed old pendingEpisodeReload system that required refresh
  - Immediate visual feedback when clicking VF/VOSTFR buttons
  - Episodes list instantly cleared and repopulated with selected language only
  - Automatic episode loading for equivalent episode in new language
  - Enhanced UI with language indicators in episode picker
  - No page refresh required - completely fluid experience
- **TypeScript**: All compilation errors resolved, production-ready codebase
- **Code Quality**: Removed duplicate properties, added missing styles, optimized structure, improved maintainability

## User Preferences

- **Communication style**: Simple, everyday language (français)
- **Documentation**: Complète et accessible
- **Architecture**: Propre et bien organisée
- **Builds**: Scripts automatisés prioritaires
- **Plateforme**: Android en priorité
- **Maintenance**: Préfère un projet propre sans fichiers inutiles
- **Design**: Cohérence visuelle - tous les écrans doivent utiliser le même fond (COLORS.primary)

## System Architecture

The application adopts a React Native/Expo mobile app architecture with a strong emphasis on clean code, performance, and user experience.

-   **Mobile Framework**: React Native with Expo SDK ~53.0.19, ensuring cross-platform compatibility with a focus on Android.
-   **Navigation**: React Navigation is used for stack-based navigation, providing intuitive screen transitions and routing.
-   **State Management**: TanStack React Query is employed for efficient API state management, caching, and synchronization.
-   **Language**: Full TypeScript support with strict configuration for enhanced code quality and maintainability.
-   **Build System**: Expo Application Services (EAS) is utilized for production builds, specifically targeting Android APK generation with custom keystore signing.
-   **UI/UX Decisions**:
    -   **Color Scheme**: Application complètement transformée avec les couleurs exactes du logo 3D - violet principal (`#8B5DFF`) comme fond principal uniforme pour tous les écrans, cyan éclatant (`#00D4FF`) pour les headers et éléments secondaires, et rose accent (`#FF6B9D`) pour les accents et sections spéciales. Correction complète effectuée (4 août 2025) : remplacement de toutes les couleurs de fond codées en dur (`#0a0a1a`) par `COLORS.primary` pour assurer une cohérence visuelle parfaite.
    -   **Design Patterns**: Consistent use of horizontal scroll sections for content categories (Trending, Planning, Legendary, Discoveries) and compact, information-rich cards.
    -   **Interactive Elements**: Nouveau logo 3D F moderne, badges intelligents harmonisés (ANIME: violet, MANGA: rose, FILM: cyan) et badges de langue (VF, VOSTFR) avec couleurs cohérentes du logo.
    -   **Responsiveness**: Optimized layouts for various screen sizes, including careful management of image dimensions and text truncation.
    -   **Performance**: Implementation of `OptimizedScrollView` and `OptimizedFlatList` for ultra-smooth scrolling, native drivers, and removal of unnecessary animations in critical paths.
    -   **Splash Screen**: Custom splash screen with atomic-themed animated logo, slogan, and subtle animations, adhering to Expo's best practices for smooth transitions.
    -   **Header**: `SharedHeader` unifié avec nouveau logo 3D et gradient moderne (cyan→violet→rose) pour le texte ATOMIC FLIX.
    -   **Player Interface**: Integrated `WebView` for video streaming, with custom controls for episode navigation, server selection, and language toggling (VF/VOSTFR) using authentic national flags.
    -   **Notifications**: Comprehensive notification system with interactive bell icon, unread badges, and visual modals displaying anime/manga images and episode details.
    -   **Telegram Verification**: A dedicated modal for Telegram channel subscription verification, styled consistently with the app's theme and featuring clear instructions.
-   **System Design Choices**:
    -   **Modular Components**: Breakdown of UI and logic into reusable components (e.g., `SharedHeader`, `AnimeCard`, `NotificationModal`).
    -   **API Integration**: Strict adherence to specific API endpoints (`/api/trending`, `/api/planning`, `/api/popular`, `/api/details`, `/api/anime/`) with robust error handling and intelligent data parsing.
    -   **Background Processing**: Services for managing notifications and trending content updates, leveraging AsyncStorage for data persistence.
    -   **User Interaction**: Implementation of `expo-keep-awake` for video playback, `expo-screen-orientation` for dynamic screen orientation, and `SafeAreaView` for consistent UI across Android devices.
    -   **Search Functionality**: Global search modal with intelligent caching, debouncing, and automatic navigation based on content type.

## External Dependencies

-   **React**: Core library for building user interfaces.
-   **React Native**: Framework for building native mobile apps using React.
-   **Expo**: Full SDK providing tools and services for React Native development, including `expo-notifications`, `expo-blur`, `expo-keep-awake`, `expo-screen-orientation`, and `expo-splash-screen`.
-   **React Navigation**: Library for handling navigation between screens.
-   **TanStack React Query**: For declarative and efficient data fetching, caching, and state management.
-   **React Native Gesture Handler**: For handling complex touch gestures and interactions.
-   **React Native Reanimated**: For creating smooth and performant animations.
-   **React Native Svg**: For rendering SVG images and animations.
-   **React Native WebView**: For embedding web content, primarily for video streaming.
-   **@react-native-picker/picker**: For customizable dropdown components.
-   **AsyncStorage**: For local data persistence.
-   **Vercel**: Backend deployment platform for API services (e.g., `atomic-flix-verifier-bot.vercel.app`).
-   **Telegram API**: Integrated for user subscription verification.
-   **Metro Bundler**: JavaScript bundler for React Native.
-   **Babel**: JavaScript compiler for transpilation.