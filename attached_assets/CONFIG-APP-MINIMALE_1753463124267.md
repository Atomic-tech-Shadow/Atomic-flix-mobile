# Configuration Minimale App Mobile - ATOMIC FLIX

## ⚠️ Configuration Requise dans l'App

### 1. Installation Expo Notifications
```bash
npm install expo-notifications
```

### 2. Code Minimal à Ajouter (5 lignes)
```javascript
import * as Notifications from 'expo-notifications';

// Au démarrage de l'app (dans App.js ou équivalent)
async function initPushNotifications() {
  try {
    // Demander permission (obligatoire)
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    
    // Obtenir le token push
    const token = await Notifications.getExpoPushTokenAsync();
    
    // Enregistrer sur votre serveur (remplacez USER_ID)
    await fetch('https://atomic-flix-verifier-bot.vercel.app/api/register-push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        userId: 'user_' + Math.random().toString(36).substr(2, 9), // Ou votre système d'ID
        pushToken: token.data
      })
    });
    
    console.log('✅ Push notifications configured');
  } catch (error) {
    console.log('❌ Push setup failed:', error);
  }
}

// Appeler au démarrage
initPushNotifications();
```

### 3. Configuration app.json (Expo)
```json
{
  "expo": {
    "name": "ATOMIC FLIX",
    "slug": "atomic-flix",
    "notifications": {
      "icon": "./assets/notification-icon.png",
      "color": "#ff6b35"
    }
  }
}
```

## 🎯 Ce qui se Passe Côté Serveur

### Sans Configuration App:
- ❌ Pas de token push généré
- ❌ Aucun utilisateur enregistré
- ❌ Notifications simulées uniquement

### Avec Configuration Minimale:
- ✅ Token push généré automatiquement
- ✅ Utilisateurs enregistrés sur le serveur
- ✅ Vraies notifications push envoyées

## 📱 Test Simple

### Option 1: Test Manuel
```bash
# Enregistrer un token test
curl -X POST http://localhost:5000/api/register-push-token \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "userId": "test123",
    "pushToken": "ExponentPushToken[test-token-here]"
  }'
```

### Option 2: Simulation pour Démo
Je peux créer un mode "démo" qui simule des utilisateurs enregistrés:

```javascript
// Mode démo - tokens simulés
const demoTokens = [
  'ExponentPushToken[demo1]',
  'ExponentPushToken[demo2]',
  'ExponentPushToken[demo3]'
];
```

## 🔧 Alternatives

### Si pas d'app mobile encore:
1. **Mode simulation** - Je configure des tokens de test
2. **Interface web** - Page pour que les utilisateurs s'enregistrent
3. **Via Telegram** - Commande pour enregistrer un token manuellement

## ✅ Résumé

**MINIMUM REQUIS:**
- 5 lignes de code dans l'app mobile
- Permission notifications activée
- Un appel API au démarrage

**SANS CONFIG APP:**
- Le système fonctionne en mode simulation
- Pas de vraies notifications envoyées

Voulez-vous que je configure un mode démo avec des tokens simulés pour tester le système maintenant?