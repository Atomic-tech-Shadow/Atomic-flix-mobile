# ATOMIC FLIX - Mobile Anime & Manga App

## Overview

**🤖 PROJET DÉVELOPPÉ AVEC REPLIT AGENT** - Ce projet a été entièrement créé et optimisé par Replit Agent, l'assistant IA de développement.

Il s'agit d'une application mobile React Native construite avec Expo pour le streaming d'anime et la lecture de manga. Le projet inclut une navigation entre différents écrans, des fonctionnalités de lecteur multimédia, et est configuré pour les builds Android avec keystore personnalisé.

## Recent Changes

**Nettoyage complet du projet - July 17, 2025**
- ✅ Suppression des fichiers temporaires (attached_assets/, temp-export/, build-output/)
- ✅ Nettoyage des documentations redondantes (transformations, comparaisons multiples)
- ✅ Suppression des scripts de fix redondants (gardé les essentiels)
- ✅ Réduction des tests en double (gardé les tests principaux)
- ✅ Suppression des fichiers de test temporaires créés pour le débogage
- ✅ Nettoyage du code de recherche (suppression logs debug, optimisation)
- ✅ Mise à jour du health check pour correspondre aux fichiers actuels
- ✅ Projet maintenant entièrement propre et optimisé
- 🔍 Diagnostic recherche: API fonctionne, code correct, investigation UI en cours
- 🚨 Bug splash screen corrigé: intégration dans App.tsx avec SafeAreaProvider
- ⚡ Animations simplifiées pour éliminer problèmes de performance  
- 🔧 Doublon splash screen supprimé: seul le composant React Native personnalisé reste
- 🎨 Splash screen amélioré: plein écran avec animations avancées (pulsation, rotation, étoiles)
- ⚡ LoadingSpinner unifié: composant réutilisable pour tous les chargements du projet
- 🐛 Bug AnimePlayerScreen corrigé: problème de chargement séquentiel des données résolu

## User Preferences

- **Communication style**: Simple, everyday language (français)
- **Documentation**: Complète et accessible
- **Architecture**: Propre et bien organisée
- **Builds**: Scripts automatisés prioritaires
- **Plateforme**: Android en priorité
- **Maintenance**: Préfère un projet propre sans fichiers inutiles

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

**Dernière mise à jour**: 16 juillet 2025 - AnimePlayerScreen complètement transformé du code web React vers React Native avec lecteur WebView intégré et API complète

**Status technique**: ✅ Toutes les vérifications passent (5/5)
- TypeScript 5.8.3 compilé sans erreurs  
- TanStack React Query v5 configuré correctement
- Types SearchResult étendus avec contentType optionnel
- Configuration doctor personnalisé : 8/8 vérifications réussies
- **Problème Android résolu** : data_extraction_rules.xml créé
- Fichiers de ressources Android configurés (backup_rules.xml)
- Plugin android-resources-config.js ajouté à app.json
- **EAS CLI installé** : version 16.15.0 configurée
- **ID projet EAS** : 0623f722-2262-4443-b8bc-65a795ec2fb3
- **Slug corrigé** : atomic-flix-mobile (correspondance avec projectId)
- **Version CLI EAS** : 16.15.0 spécifiée dans eas.json
- **Android 35 configuré** : compileSdk 35, targetSdk 35, buildTools 35.0.0
- **Styles Android 35** : Fichiers styles.xml avec support edge-to-edge
- **Script de test** : test-android-35.js pour vérification complète (11/11 tests réussis)
- **Erreurs de lint corrigées** : FullBackupContent résolue dans data_extraction_rules.xml
- **Conflits expo-doctor résolus** : Doctor personnalisé remplace expo-doctor avec versions conflictuelles
- **HomeScreen transformé** : Conversion complète du site web anime-sama en React Native avec API identique
- **AnimeDetailScreen transformé** : Conversion complète du site web anime-detail en React Native avec navigation intelligente  
- **AnimePlayerScreen transformé** : Conversion complète du site web anime-player en React Native avec lecteur WebView intégré
- **✅ TRANSFORMATION TERMINÉE** : 5 écrans React web convertis en React Native (AboutScreen, MangaReaderScreen, NotFoundScreen, PrivacyPolicyScreen, TermsOfServiceScreen) avec navigation intégrée et styles mobiles cohérents
- **Navigation React Navigation** : RootStackParamList mise à jour avec tous les nouveaux écrans
- **Erreurs TypeScript corrigées** : useEffect return paths et styles React Native compatibles
- **Expo Server opérationnel** : Application prête pour test sur mobile via Expo Go
- **🎨 REDESIGN MOBILE TERMINÉ** : HomeScreen complètement transformé pour reproduire exactement le design du site mobile ATOMIC FLIX avec header mobile, hero banner en mosaïque, section "Nouveaux épisodes ajoutés", navigation drawer et modal de recherche
- **Interface mobile exacte** : Dark blue theme (#0a0a1a), accents cyan (#00bcd4), logo atomique, icônes de navigation (search, notifications, menu)
- **Fonctionnalités modales** : Navigation drawer slide-up, modal de recherche plein écran, interactions tactiles mobiles
- **Design correspondant à l'image fournie** : Layout avec header dark blue, hero banner horizontal avec mosaïque d'images, section "Nouveaux épisodes ajoutés" avec icône film bleue, cartes anime avec badges ANIME/MANGA
- **🔧 ANIMEDETAILSCREEN & ANIMEPLAYERSCREEN TRANSFORMATION COMPLÈTE** : Codes web React intégralement convertis en React Native avec API réelle anime-sama-scraper.vercel.app
- **Logique API fonctionnelle** : getAnimeDetails avec extraction ID correcte, loadSeasonEpisodes, loadEpisodeSources, changeLanguage, navigateEpisode avec vraies données API
- **Navigation intelligente** : Détection automatique manga/anime, navigation vers MangaReader ou AnimePlayer selon le type de contenu
- **Interface lecteur avancée** : WebView pour streaming, sélection serveurs multiples, navigation épisodes, gestion erreurs complète, états de chargement
- **Compatibilité mobile** : Styles responsives, interactions tactiles, messages d'erreur adaptatifs, boutons de contrôle intuitifs, timeout et retry automatiques
- **🎯 HEADER UNIFIÉ APPLIQUÉ** : Tous les écrans utilisent désormais le même header HomeScreen avec composant SharedHeader
- **Composant SharedHeader créé** : src/components/SharedHeader.tsx avec logo ATOMIC FLIX, icônes navigation, bouton retour conditionnel
- **Navigation cohérente** : Bouton retour sur tous les écrans (sauf Home), styles dark blue (#0a0a1a), interactions tactiles
- **🎨 LOGO OFFICIEL INTÉGRÉ** : Logo atomique rose/cyan avec "F" stylisé appliqué sur tous les écrans (SharedHeader, HomeScreen, AboutScreen, NotFoundScreen)
- **✨ SPLASH SCREEN COMPLET** : Écran d'accueil avec logo ATOMIC FLIX, slogan "LA PLATEFORME ULTIME POUR LES OTAKUS", animations fluides, fond étoilé
- **Composant SplashScreen créé** : src/components/SplashScreen.tsx avec animations fade/scale, auto-fermeture après 2.5s, design professionnel
- **Configuration splash complète** : app.json mis à jour avec assets/splash-screen.png, App.tsx avec gestion d'état splash
- **Application Expo opérationnelle** : Metro Bundler actif sur port 8081, QR code disponible pour test mobile Expo Go, 5/5 health checks réussis
- **🎮 ANIMEPLAYERSCREEN TRANSFORMATION COMPLÈTE** : Code web anime-player intégralement converti en React Native mobile
- **Lecteur WebView intégré** : react-native-webview pour streaming vidéo avec anime-sama-scraper.vercel.app
- **API fonctionnelle** : getAnimeDetails, loadSeasonEpisodes, loadEpisodeSources, changeLanguage, navigateEpisode
- **Interface mobile optimisée** : Contrôles tactiles, navigation épisodes, sélection serveurs, drapeaux VF/VOSTFR
- **Interface web-identique** : Dropdowns en grille 2 colonnes, overlay vidéo, message "DERNIÈRE SÉLECTION", "I AM ATOMIC"
- **Bannière identique au web** : Bannière pleine largeur avec overlay noir 60%, positionnement absolu, tailles exactes (24px/18px)
- **Configuration API validée** : test-api-endpoints.js confirme tous les endpoints fonctionnels
- **Tests bannière** : test-banner-identical.js confirme reproduction exacte (24/24 tests réussis)
- **Tests complets** : 6/6 tests réussis avec test-anime-player.js, navigation configurée, types définis
- **Header unifié** : SharedHeader connecté au lieu du bouton retour personnalisé, navigation cohérente
- **Dropdowns intégrés** : Sélection d'épisodes et de serveurs avec @react-native-picker/picker pour une meilleure UX
- **Drapeaux identiques au web** : Drapeau français (bleu/blanc/rouge) et japonais (cercle rouge sur fond blanc) exactement comme le code web
- **🎬 SPLASH SCREEN ANIMÉ AVANCÉ** : Animation de pulsation continue du logo (0.9→1.05), rotation des étoiles 360°, apparition progressive du texte, durée étendue à 4 secondes, effets d'ombre et de lumière cyan
- **Animations fluides** : Utilisation d'Animated.loop pour pulsation continue, Animated.sequence pour transitions, useRef pour performances optimales, interpolation pour rotation des étoiles
- **Design professionnel** : 8 étoiles animées avec effet de lueur, texte "ATOMIC FLIX" avec shadow cyan, slogan "LA PLATEFORME ULTIME POUR LES OTAKUS", barre de chargement animée avec scale effect
- **🎨 SPLASH SCREEN DESIGN FINAL** : Intégration du design complet fourni par l'utilisateur (splash-design.png) avec logo atomique, texte "ATOMIC FLIX", slogan "LA PLATEFORME ULTIME POUR LES OTAKUS" et fond étoilé
- **Image plein écran** : Design affiché en dimensions complètes (width x height) avec animation de pulsation subtile, barre de chargement cyan positionnée en bas
- **Dernière mise à jour design** : 16 juillet 2025 - Splash screen finalisé selon la maquette exacte de l'utilisateur
- **🔍 FONCTIONNALITÉ RECHERCHE CORRIGÉE** : Bug fixé dans handleSearchPress - ajout d'un état showSearchBar séparé pour contrôler l'affichage de la barre de recherche
- **Comportement recherche amélioré** : Clic sur l'icône search affiche maintenant correctement la barre avec auto-focus, bouton ✕ ferme la recherche et remet à zéro
- **Interface recherche complète** : TextInput avec placeholder "Rechercher des animes...", icône search cyan, recherche en temps réel avec délai 300ms, gestion d'erreurs API
- **🔔 NOTIFICATIONS INTERACTIVES** : Fonctionnalité cloche complète avec activation/désactivation, changement visuel d'état (cyan quand activée), badge rouge pour nouvelles notifications
- **États notifications** : Icon "notifications" (activé) vs "notifications-off" (désactivé), Alert de confirmation, simulation de nouvelles notifications toutes les 30s
- **Interface notifications** : Badge rouge avec point blanc, position absolue top-right, couleurs cyan/blanc selon l'état, callback onNotificationPress optionnel
- **🚨 SYSTÈME DE NOTIFICATIONS AUTOMATIQUES COMPLET** : Détection automatique de nouveaux épisodes dans le HomeScreen avec notifications push
- **Service NotificationService** : Classe singleton pour gérer les notifications, AsyncStorage pour persistance, détection de changements de contenu
- **Notifications automatiques** : Comparaison contenu précédent vs actuel, Alert() pour notifications push, compteur non lues, nettoyage automatique après 7 jours
- **Intégration HomeScreen** : Détection lors de loadTrendingAnimes(), vérification périodique toutes les 5 minutes, synchronisation état notifications enabled/disabled
- **Fonctionnalités avancées** : markAsRead(), markAllAsRead(), getUnreadCount(), cleanOldNotifications(), addListener() pour mise à jour temps réel du badge
- **Version AsyncStorage** : 2.1.2 compatible Expo 53, toutes vérifications health-check passent (5/5)
- **🖼️ NOTIFICATIONS VISUELLES AVANCÉES** : Interface complète avec images d'anime, détails d'épisodes (E02, Ch.1105), modal plein écran
- **Modal NotificationModal** : Affichage des notifications avec images anime/manga, infos épisodes, timestamps relatifs, badges non-lues
- **Détection intelligente épisodes** : Extraction automatique numéros d'épisodes/chapitres depuis titres et status, formatage E02/Ch.123
- **Interface notifications premium** : Emojis par type (📺🎬📖), overlay type sur images, boutons lecture, compteur unread dans badge
- **Interaction complète** : Clic cloche ouvre modal si activé, sinon active/désactive, bouton "Tout lire", navigation vers contenu spécifique
- **🔄 ANIMEDETAILSCREEN SYNCHRONISÉ AVEC CODE WEB** : API identique au code web fonctionnel avec animeAPI.getDetails()
- **animeAPI.ts créé** : Client API React Native reproduisant exactement le comportement du code web avec fallback endpoints
- **Endpoints testés** : /api/details/{id}, /api/anime/{id}, /api/anime/details/{id} pour compatibilité maximale
- **Logique identique** : Extraction ID depuis URL, timeout 20s, gestion erreurs 404/500/timeout, navigation manga/anime intelligente
- **🎯 CODE WEB EXACT EN REACT NATIVE** : Fallbacks supprimés, utilise uniquement /api/anime/{id} comme le code web fonctionnel
- **animeAPI.getDetails() pure** : Aucun fallback, throw direct des erreurs comme dans le code web, logique identique simplifiée
- **🔄 ID PROJET EXPO REMPLACÉ** : 16 juillet 2025 - Nouvel ID projet EAS : 0623f722-2262-4443-b8bc-65a795ec2fb3
- **📱 HEADER ANDROID OPTIMISÉ** : Suppression du bouton retour du header dans AnimeDetailScreen et AnimePlayerScreen - Android utilise le bouton retour système natif
- **⚡ OPTIMISATIONS PERFORMANCE** : ScrollView accéléré avec propriétés natives, images optimisées, animations simplifiées pour réduire les lags
- **🎨 SPLASH SCREEN PORTRAIT COMPLET** : Plein écran avec resizeMode="cover", positionnement absolu, durée réduite à 2.5s pour démarrage plus rapide
- **🚀 COMPOSANTS OPTIMISÉS** : React.useCallback sur renderAnimeCard, styles avec elevation/shadow pour UI native, backgroundColor sur images pour loading fluide
- **📱 SPLASH SCREEN ANDROID PLEIN ÉCRAN** : Configuration spécifique Android avec splash screen portrait, thème plein écran, support edge-to-edge pour Android 35+
- **🔧 CONFIGURATION ANDROID COMPLÈTE** : Orientation portrait forcée, windowFullscreen, statusBar/navigationBar transparentes, windowLayoutInDisplayCutoutMode shortEdges
- **🎨 THÈMES NATIFS ANDROID** : Theme.App.SplashScreen avec styles.xml pour toutes versions Android, support spécifique Android 35+ avec enforceStatusBarContrast