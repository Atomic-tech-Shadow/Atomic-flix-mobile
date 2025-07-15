# 🎬 ATOMIC FLIX - Anime & Manga Mobile App

[![Built with Replit Agent](https://img.shields.io/badge/Built%20with-Replit%20Agent-orange.svg)](https://replit.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)](https://reactnative.dev)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-53-black.svg)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org)

## 🚀 Développé avec Replit Agent

Ce projet a été entièrement développé et optimisé en utilisant **Replit Agent**, l'assistant IA qui a :

- ✅ Configuré l'architecture React Native/Expo complète
- ✅ Créé les écrans et la navigation
- ✅ Optimisé les builds Android avec keystore personnalisé
- ✅ Résolu tous les problèmes de dépendances
- ✅ Mis en place les scripts de build automatiques
- ✅ Configuré EAS Build pour production

## 📱 À propos de l'application

Une application mobile moderne pour le streaming d'anime et la lecture de manga, construite avec les dernières technologies React Native.

### ✨ Fonctionnalités

- 🎯 **Navigation fluide** entre les écrans
- 📺 **Lecteur vidéo** intégré pour les épisodes d'anime
- 📖 **Lecteur de manga** optimisé
- 🔍 **Recherche** et découverte de contenu
- 📱 **Interface native** Android

### 🛠️ Technologies utilisées

- **Framework**: React Native 0.79.5 avec Expo SDK 53
- **Navigation**: React Navigation v6
- **State Management**: TanStack React Query
- **Langage**: TypeScript 5.8.3
- **Build System**: EAS Build
- **Animations**: React Native Reanimated

## 🏗️ Structure du projet

```
📁 atomic-flix/
├── 📱 App.tsx                    # Point d'entrée principal
├── 📁 src/
│   ├── 🧭 navigation/           # Configuration de navigation
│   ├── 📱 screens/              # Écrans de l'application
│   ├── 🔧 types/                # Définitions TypeScript
│   └── ⚙️ utils/                # Utilitaires
├── 🎨 assets/                   # Icônes et images
├── 🔧 Configuration files
│   ├── app.json                 # Config Expo
│   ├── eas.json                 # Config builds
│   ├── package.json             # Dépendances
│   └── tsconfig.json            # Config TypeScript
└── 📜 Build scripts & docs
```

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- Expo CLI
- Android Studio (pour émulateur)

### Installation et lancement

```bash
# Clone le projet
git clone <your-repo>
cd atomic-flix

# Installer les dépendances
npm install

# Lancer en mode développement
npm start

# Ou directement sur Android
npm run android
```

### 📱 Build APK

```bash
# Authentification EAS (une seule fois)
npx eas login

# Build APK avec EAS (recommandé)
npx eas build --platform android --profile preview

# Ou build automatique avec keystore
./build-with-keystore.sh
```

## 📋 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm start` | Lance l'app en mode développement |
| `npm run android` | Lance sur émulateur Android |
| `npm run doctor` | Vérifie la configuration |
| `npm run build:android` | Build APK via EAS |
| `./build-with-keystore.sh` | Build automatique avec signature |

## 🔧 Configuration build

Le projet est configuré avec :

- **Keystore personnalisé** pour signature APK
- **Scripts automatisés** pour builds cohérents
- **Optimisations Metro** pour performance
- **Configuration EAS** pour production

### Fichiers de configuration build

- `credentials.json` - Configuration keystore
- `eas.json` - Profils de build
- `signing.keystore` - Clé de signature
- `build-with-keystore.sh` - Script automatique

## 📚 Documentation technique

- 📖 [`BUILD-SOLUTION.md`](BUILD-SOLUTION.md) - Guide complet de build
- 📋 [`BUILD-FINAL-GUIDE.md`](BUILD-FINAL-GUIDE.md) - Configuration finale optimisée
- 🔧 [`replit.md`](replit.md) - Architecture et préférences du projet

## 🤖 Replit Agent Checkpoint

> **Note importante :** Ce projet a été développé entièrement avec Replit Agent. 
> Toute la configuration, l'architecture, et les optimisations ont été faites par l'IA.
> 
> Pour continuer le développement avec Replit Agent, référez-vous au fichier `replit.md` 
> qui contient toutes les préférences et l'architecture du projet.

## 🛟 Support et résolution de problèmes

Si vous rencontrez des problèmes :

1. **Vérifiez la configuration** : `npm run doctor`
2. **Nettoyez Metro** : `npm run clean`
3. **Consultez les guides** dans `BUILD-SOLUTION.md`
4. **Utilisez les scripts** de réparation automatique

---

**Développé avec ❤️ par Replit Agent** - L'IA qui code pour vous !