# 📁 Structure du projet ATOMIC FLIX

## 🎯 Organisation générale

```
atomic-flix/
├── 📖 Documentation
│   ├── README.md                    # Guide principal du projet
│   ├── REPLIT-AGENT-INFO.md        # Informations Replit Agent
│   ├── PROJECT-STRUCTURE.md        # Ce fichier - structure
│   ├── replit.md                   # Architecture et préférences
│   ├── BUILD-SOLUTION.md           # Guide build complet
│   └── BUILD-FINAL-GUIDE.md        # Configuration finale
│
├── 📱 Application React Native
│   ├── App.tsx                     # Point d'entrée principal
│   ├── index.ts                    # Index de démarrage
│   └── src/
│       ├── navigation/
│       │   └── AppNavigator.tsx    # Configuration navigation
│       ├── screens/
│       │   ├── HomeScreen.tsx      # Écran d'accueil
│       │   ├── AnimeDetailScreen.tsx
│       │   ├── AnimePlayerScreen.tsx
│       │   └── MangaReaderScreen.tsx
│       ├── types/
│       │   └── index.ts            # Types TypeScript
│       └── utils/
│           └── queryClient.ts      # Configuration React Query
│
├── 🎨 Assets
│   ├── adaptive-icon.png
│   ├── icon.png
│   ├── favicon.png
│   └── splash-icon.png
│
├── ⚙️ Configuration
│   ├── package.json                # Dépendances et scripts
│   ├── package-lock.json           # Lock des versions
│   ├── tsconfig.json              # Configuration TypeScript
│   ├── babel.config.js            # Configuration Babel
│   ├── metro.config.js            # Configuration Metro
│   ├── app.json                   # Configuration Expo
│   ├── eas.json                   # Configuration builds EAS
│   └── gradle.properties          # Propriétés Gradle
│
├── 🔐 Build & Signature
│   ├── signing.keystore           # Clé de signature Android
│   ├── signing-key-info.txt       # Infos keystore
│   ├── credentials.json           # Config EAS credentials
│   └── android-manifest-config.js # Config manifest Android
│
├── 🔧 Scripts automatisés
│   ├── build-with-keystore.sh     # Build auto avec keystore
│   ├── reset-metro.sh             # Reset Metro cache
│   └── complete-health-check.js   # Vérification complète du projet
│
├── 🤖 Replit Agent
│   └── .replitai                  # Marqueur projet Replit Agent
│
└── 📂 Autres
    └── node_modules/              # Dépendances npm
```

## 📋 Rôle des fichiers principaux

### Documentation (📖)
- **README.md** : Point d'entrée pour comprendre le projet
- **REPLIT-AGENT-INFO.md** : Guide spécifique pour Replit Agent
- **replit.md** : Architecture technique et préférences utilisateur

### Application (📱)
- **App.tsx** : Composant racine avec navigation
- **src/navigation/** : Gestion routing entre écrans
- **src/screens/** : Écrans de l'application
- **src/types/** : Définitions TypeScript
- **src/utils/** : Utilitaires et configuration

### Configuration (⚙️)
- **package.json** : Dépendances et scripts npm
- **app.json** : Configuration Expo (nom, version, permissions)
- **eas.json** : Profils de build pour Android/iOS
- **tsconfig.json** : Configuration TypeScript stricte

### Build & Signature (🔐)
- **signing.keystore** : Clé privée pour signer l'APK
- **credentials.json** : Config EAS avec keystore local
- **android-manifest-config.js** : Optimisations manifest

### Scripts (🔧)
- **build-with-keystore.sh** : Build APK automatique et optimisé
- **validate-config.sh** : Vérification complète configuration
- **reset-metro.sh** : Nettoyage cache Metro complet

## 🎯 Workflows de développement

### Développement local
```bash
npm start           # Lance Expo dev server
npm run android     # Lance sur émulateur Android
npm run doctor      # Vérifie la configuration
```

### Build production
```bash
./build-with-keystore.sh    # Recommandé - build auto
npm run build:android       # Build EAS standard
npm run build:production    # Build production optimisé
```

### Maintenance
```bash
npm run clean              # Nettoie cache Metro
./reset-metro.sh          # Reset complet Metro
./validate-config.sh      # Validation complète
```

## 🔍 Points d'attention pour développement

### Répertoires critiques
- `src/` : Code source principal - ne pas déplacer
- `assets/` : Icônes app - requis par Expo
- Configuration à la racine - ne pas déplacer dans sous-dossiers

### Fichiers sensibles
- `signing.keystore` : Clé privée - ne jamais commiter dans git public
- `credentials.json` : Contient mots de passe keystore
- `package-lock.json` : Généré automatiquement - ne pas éditer manuellement

### Scripts robustes
Tous les scripts sont testés et optimisés pour :
- Gestion d'erreurs complète
- Logs détaillés pour debugging
- Compatible environnement Replit
- Build cohérents reproductibles

---

**📝 Note** : Cette structure a été optimisée par Replit Agent pour un développement efficace et des builds stables.