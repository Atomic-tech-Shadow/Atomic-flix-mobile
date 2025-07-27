# Guide Complet - Notifications Trending ATOMIC FLIX

## Vue d'ensemble

Le système de notifications trending détecte automatiquement les nouveaux animes qui deviennent populaires et envoie des notifications push instantanées aux utilisateurs.

## Architecture

### 🏗️ Composants Principaux

#### 1. TrendingNotificationService.ts
- **Rôle** : Service singleton pour la gestion des notifications trending
- **Fonctionnalités** :
  - Initialisation Expo Push Notifications selon documentation 2025
  - Configuration canal Android automatique (requis Android 13+)
  - Détection nouvelles tendances par comparaison de données
  - Envoi notifications locales et push
  - Gestion permissions iOS/Android
  - Listeners navigation automatique

#### 2. Configuration app.json
```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/atomic-flix-logo.png",
        "color": "#00bcd4",
        "defaultChannel": "atomic-flix-trending",
        "sounds": [],
        "enableBackgroundRemoteNotifications": true
      }
    ]
  ]
}
```

#### 3. Intégration HomeScreen
- Import et initialisation du service
- Vérification trending lors du chargement API
- Configuration listeners de navigation

## Flux de Fonctionnement

### 🚀 Initialisation (App Launch)
1. **Service Initialize** : Canal Android + Permissions + Token Expo
2. **Listeners Setup** : Navigation automatique sur tap notification
3. **Données Précédentes** : Chargement depuis AsyncStorage

### 🔄 Détection Tendances (API Refresh)
1. **Comparaison** : Nouvelles données vs données précédentes
2. **Filtrage** : Détection nouveaux animes (par ID/URL)
3. **Limitation** : Maximum 3 notifications pour éviter spam
4. **Sauvegarde** : Nouvelles données pour prochaine comparaison

### 📱 Notifications
1. **Locale** : Notification immédiate via Expo Notifications
2. **Push** : Notification distante via API Expo Push
3. **Navigation** : Tap → AnimeDetail avec paramètres automatiques

## Fonctionnalités Techniques

### ⚙️ Configuration Avancée

#### Canal Android (Android 13+ requis)
```typescript
await Notifications.setNotificationChannelAsync('atomic-flix-trending', {
  name: 'ATOMIC FLIX - Tendances',
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#00bcd4',
  enableLights: true,
  enableVibrate: true,
  showBadge: true,
});
```

#### Permissions iOS Spécifiques
```typescript
await Notifications.requestPermissionsAsync({
  ios: {
    allowAlert: true,
    allowBadge: true,
    allowSound: true,
    allowDisplayInCarPlay: true,
    allowCriticalAlerts: false,
    allowProvisional: false,
  },
});
```

### 🧠 Logique de Détection

#### Comparaison Intelligente
- **Critère** : ID anime ou URL comme identifiant unique
- **Stockage** : Map des animes précédents en mémoire + AsyncStorage
- **Performance** : Vérification max toutes les 5 minutes

#### Prévention Spam
- **Limite** : 3 nouveautés maximum par vérification
- **Intervalle** : Pause 1s entre chaque notification
- **Fréquence** : Contrôle temporel automatique

### 📨 API Push Notifications

#### Endpoint Expo
```typescript
const response = await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: expoPushToken,
    title: '🔥 Nouvelle tendance !',
    body: `${anime.title} fait fureur en ce moment !`,
    data: {
      type: 'trending',
      animeId: anime.id,
      screen: 'AnimeDetail',
      params: { id: anime.id, contentType: anime.contentType }
    },
    channelId: 'atomic-flix-trending',
    priority: 'high',
  }),
});
```

## Tests et Validation

### 🧪 Tests Automatisés
```bash
# Validation complète configuration
node test-trending-notifications.js

# Résultats attendus : 25/25 tests réussis
```

### 🔧 Tests Manuels

#### 1. Test Permission
- Ouvrir app → Permissions demandées automatiquement
- Accepter → Token Expo généré

#### 2. Test Notification
- Utiliser NotificationTester component
- Bouton "🧪 Tester Notification"
- Vérifier réception notification

#### 3. Test Navigation
- Tap sur notification reçue
- Vérifier navigation vers AnimeDetail
- Paramètres corrects transmis

### 📱 Validation Production

#### Build APK
```bash
npx eas build --platform android --profile production
```

#### Installation Device
1. Transférer APK sur appareil physique
2. Installer et autoriser permissions
3. Tester notifications en conditions réelles

## Limitations et Prérequis

### ⚠️ Restrictions Techniques

#### Appareil Physique Obligatoire
- **Push Notifications** : Ne fonctionnent PAS dans :
  - Expo Go Web
  - Émulateurs Android
  - Simulateurs iOS
- **Solution** : Build APK/IPA natif requis

#### Project ID EAS Requis
- Token Expo push nécessite projectId EAS valide
- Configuration dans Constants.expoConfig.extra.eas.projectId

### 🔧 Configuration Environnement

#### Permissions Android
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
```

#### Info.plist iOS
```xml
<!-- ios/App/App/Info.plist -->
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

## Maintenance et Monitoring

### 🗃️ Nettoyage Automatique
- **Données anciennes** : Suppression après 7 jours
- **AsyncStorage** : Nettoyage périodique automatique
- **Optimisation** : Prévention accumulation données

### 📊 Monitoring
- **Logs Production** : Erreurs silencieuses, succès loggés
- **Performance** : Limitation fréquence vérifications
- **Statistiques** : Comptage notifications envoyées

## Évolutions Futures

### 🚀 Améliorations Possibles
1. **Analytics** : Tracking engagement notifications
2. **Personnalisation** : Filtres par genre/langue
3. **Planning** : Notifications programmées
4. **Backup** : Synchronisation cloud des préférences

### 🔐 Sécurité
- **Token Protection** : Pas de logs tokens en production
- **Rate Limiting** : Protection contre spam
- **Validation** : Vérification données API avant notification

---

## Configuration Validée ✅

- **Date** : 27 juillet 2025
- **Version** : 2.7.8
- **Tests** : 25/25 réussis
- **Status** : Production Ready

**Prêt pour déploiement APK sur appareil physique !**