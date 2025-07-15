# 🛠️ Guide de développement ATOMIC FLIX

## 🤖 Développé avec Replit Agent

Ce guide a été créé par Replit Agent pour faciliter le développement et la maintenance du projet.

## 🚀 Démarrage rapide

### 1. Première installation

```bash
# Cloner le projet
git clone <votre-repo>
cd atomic-flix

# Installer les dépendances
npm install

# Vérifier la configuration
npm run doctor
```

### 2. Développement local

```bash
# Lancer en mode développement
npm start

# Ou directement sur Android
npm run android

# Pour iOS (si configuré)
npm run ios
```

## 🔧 Scripts disponibles

### Développement
```bash
npm start                    # Lance Expo dev server avec QR code
npm run android             # Lance directement sur émulateur Android
npm run ios                 # Lance sur simulateur iOS
npm run web                 # Lance version web (pour tests)
```

### Vérification et maintenance
```bash
npm run doctor              # Vérification configuration personnalisée
npm run check-deps          # Vérifie les dépendances Expo
npm run fix-deps           # Répare les dépendances Expo
npm run health             # Audit sécurité + doctor
npm run clean              # Nettoie le cache Metro
```

### Build production
```bash
npm run build:android       # Build EAS Android
npm run build:production    # Build production optimisé
npm run build:fix          # Script de réparation build

# Script automatique recommandé
./build-with-keystore.sh    # Build complet avec keystore
```

## 📱 Configuration développement

### Prérequis
- **Node.js** : Version 18 ou supérieure
- **npm** : Inclus avec Node.js
- **Expo CLI** : Installé automatiquement
- **Android Studio** : Pour l'émulateur (optionnel)

### Configuration Android
```bash
# Variables d'environnement (optionnelles)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Configuration iOS (macOS uniquement)
```bash
# Xcode Command Line Tools
xcode-select --install

# CocoaPods (si nécessaire)
sudo gem install cocoapods
```

## 🏗️ Architecture de développement

### Structure des composants
```
src/
├── navigation/              # Configuration routing
│   └── AppNavigator.tsx    # Stack navigator principal
├── screens/                # Écrans de l'application
│   ├── HomeScreen.tsx      # Écran accueil + recherche
│   ├── AnimeDetailScreen.tsx  # Détails anime + saisons
│   ├── AnimePlayerScreen.tsx  # Lecteur vidéo
│   └── MangaReaderScreen.tsx  # Lecteur manga
├── types/                  # Définitions TypeScript
│   └── index.ts           # Types centralisés
└── utils/                  # Utilitaires
    └── queryClient.ts     # Configuration React Query
```

### Flux de données
1. **React Query** gère l'état des API calls
2. **React Navigation** gère les transitions d'écrans
3. **TypeScript** assure la cohérence des types
4. **Expo** fournit les APIs natives

## 🎨 Styling et UI

### Système de design
- **React Native Elements** ou composants custom
- **Expo LinearGradient** pour les dégradés
- **React Native Reanimated** pour les animations
- **Safe Area Context** pour les zones sûres

### Couleurs et thèmes
```typescript
// Exemple de palette (à définir dans src/styles/)
const colors = {
  primary: '#1E88E5',
  secondary: '#FFC107',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF'
};
```

## 🔍 Debug et tests

### Debugging React Native
```bash
# React DevTools
npx react-devtools

# Flipper (optionnel)
npx react-native doctor
```

### Logs et monitoring
```bash
# Logs Metro
npm start -- --verbose

# Logs natifs Android
adb logcat | grep ReactNativeJS

# Logs natifs iOS
npx react-native log-ios
```

## 📦 Gestion des dépendances

### Ajout de nouvelles dépendances
```bash
# Utiliser Expo install pour compatibilité
npx expo install nom-du-package

# Ou npm pour packages génériques
npm install nom-du-package
```

### Mise à jour dépendances
```bash
# Vérifier les updates Expo
npx expo install --check

# Mettre à jour Expo SDK
npx expo upgrade
```

## 🚀 Process de build

### Build local (développement)
```bash
# Build APK local avec keystore
./build-with-keystore.sh

# Build EAS local
npx eas build --platform android --local
```

### Build production (EAS Cloud)
```bash
# Configuration EAS (une seule fois)
npx eas build:configure

# Build production
npx eas build --platform android --profile production
```

## 🔐 Sécurité et signatures

### Keystore management
- **Ne jamais** commiter `signing.keystore` dans Git public
- **Sauvegarder** le keystore et les mots de passe
- **Utiliser** EAS credentials pour la production

### Variables d'environnement
```bash
# Fichier .env (à créer si nécessaire)
API_BASE_URL=https://api.example.com
API_KEY=your-api-key-here
```

## 🐛 Résolution de problèmes courants

### Problèmes Metro
```bash
# Nettoyer le cache
npm run clean
./reset-metro.sh

# Problèmes persistants
rm -rf node_modules package-lock.json
npm install
```

### Problèmes build Android
```bash
# Vérifier configuration
./validate-config.sh

# Fix dépendances
./fix-dependencies.sh

# Fix Java/Gradle
./java-fix.sh
```

### Problèmes Expo
```bash
# Doctor personnalisé
npm run doctor

# Doctor officiel Expo
npx expo doctor
```

## 📚 Ressources utiles

### Documentation
- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)

### Outils recommandés
- **IDE** : VS Code avec extensions React Native
- **Testing** : Jest + React Native Testing Library
- **Linting** : ESLint + Prettier
- **Git** : Hooks pre-commit pour quality

---

**💡 Conseil** : Ce guide évolue avec le projet. N'hésitez pas à le mettre à jour selon vos besoins !