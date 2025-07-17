# Guide de Vérification Telegram pour ATOMIC FLIX

## Vue d'ensemble

Ce guide explique comment implémenter la vérification réelle de l'abonnement Telegram pour l'application ATOMIC FLIX.

## Étapes de mise en place

### 1. Création du Bot Telegram

1. **Créer le bot** :
   - Ouvrir Telegram et rechercher `@BotFather`
   - Envoyer `/newbot`
   - Choisir un nom : `ATOMIC FLIX Verifier`
   - Choisir un username : `atomic_flix_verifier_bot`
   - Sauvegarder le token fourni

2. **Configurer le bot** :
   - Ajouter le bot comme administrateur du canal `@Atomic_flix_officiel`
   - Donner les permissions nécessaires (lecture des membres)

### 2. Backend Node.js

#### Installation des dépendances
```bash
npm install node-telegram-bot-api express dotenv
```

#### Code backend (server.js)
```javascript
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const bot = new TelegramBot(process.env.BOT_TOKEN);

// Configuration
const CHANNEL_ID = '@Atomic_flix_officiel';
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Fonction de vérification d'abonnement
async function checkSubscription(userId) {
    try {
        const member = await bot.getChatMember(CHANNEL_ID, userId);
        const validStatuses = ['member', 'administrator', 'creator'];
        
        return {
            isSubscribed: validStatuses.includes(member.status),
            status: member.status,
            userInfo: {
                id: member.user.id,
                username: member.user.username,
                firstName: member.user.first_name
            }
        };
    } catch (error) {
        console.error('Erreur vérification:', error);
        return {
            isSubscribed: false,
            status: 'error',
            error: error.message
        };
    }
}

// Route de vérification
app.post('/api/verify-subscription', async (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ 
            error: 'ID utilisateur requis' 
        });
    }
    
    try {
        const result = await checkSubscription(userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            error: 'Erreur serveur lors de la vérification' 
        });
    }
});

// Webhook pour le bot (optionnel)
app.post('/api/telegram-webhook', async (req, res) => {
    const update = req.body;
    
    if (update.message && update.message.text === '/verify') {
        const userId = update.message.from.id;
        const result = await checkSubscription(userId);
        
        if (result.isSubscribed) {
            await bot.sendMessage(
                update.message.chat.id,
                '✅ Vous êtes bien abonné à ATOMIC FLIX!'
            );
        } else {
            await bot.sendMessage(
                update.message.chat.id,
                '❌ Veuillez vous abonner à @Atomic_flix_officiel'
            );
        }
    }
    
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
```

#### Variables d'environnement (.env)
```env
BOT_TOKEN=your_bot_token_here
CHANNEL_ID=@Atomic_flix_officiel
PORT=3000
```

### 3. Intégration React Native

#### Mise à jour du composant TelegramVerification
```javascript
// src/utils/telegramAPI.js
const API_BASE_URL = 'https://your-backend-url.com';

export const verifyTelegramSubscription = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/verify-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur API:', error);
        return { isSubscribed: false, error: 'Erreur réseau' };
    }
};
```

#### Authentification Telegram
```javascript
// Ajouter cette fonction dans TelegramVerification.tsx
import { verifyTelegramSubscription } from '../utils/telegramAPI';

const handleVerify = async () => {
    if (!hasSubscribed) {
        Alert.alert(
            'Abonnement requis',
            'Veuillez d\'abord vous abonner au canal Telegram.'
        );
        return;
    }
    
    setIsVerifying(true);
    
    try {
        // Récupérer l'ID utilisateur Telegram (voir section Auth)
        const userId = await getTelegramUserId();
        
        if (!userId) {
            throw new Error('Impossible de récupérer l\'ID utilisateur');
        }
        
        const result = await verifyTelegramSubscription(userId);
        
        if (result.isSubscribed) {
            await AsyncStorage.setItem('telegram_verified', 'true');
            Alert.alert(
                'Vérification réussie !',
                'Vous êtes bien abonné au canal. Bienvenue !',
                [{ text: 'Accéder à l\'app', onPress: onVerified }]
            );
        } else {
            Alert.alert(
                'Échec de la vérification',
                'Vous devez être abonné au canal @Atomic_flix_officiel pour continuer.',
                [{ text: 'Réessayer' }]
            );
        }
    } catch (error) {
        Alert.alert(
            'Erreur',
            'Une erreur est survenue lors de la vérification. Veuillez réessayer.'
        );
    } finally {
        setIsVerifying(false);
    }
};
```

### 4. Authentification Telegram

#### Option 1 : Telegram Login Widget
```bash
npm install @telegram-auth/react
```

#### Option 2 : Deep Link Telegram
```javascript
// Générer un lien d'authentification unique
const generateAuthLink = () => {
    const botUsername = 'atomic_flix_verifier_bot';
    const startPayload = `auth_${Date.now()}`;
    return `https://t.me/${botUsername}?start=${startPayload}`;
};

// Ouvrir Telegram pour l'authentification
const handleTelegramAuth = async () => {
    const authLink = generateAuthLink();
    await Linking.openURL(authLink);
};
```

## Avantages de cette solution

1. **Vérification réelle** : Utilise l'API officielle Telegram
2. **Sécurisé** : Impossible de contourner la vérification
3. **Temps réel** : Vérification instantanée
4. **Fiable** : Utilise les systèmes officiels de Telegram

## Sécurité

- Le token du bot doit être gardé secret
- Utiliser HTTPS pour toutes les communications
- Valider les données côté serveur
- Implémenter un rate limiting

## Déploiement

### Backend
- Déployer sur Heroku, Vercel, ou AWS
- Configurer les variables d'environnement
- Mettre en place les webhooks Telegram

### React Native
- Configurer l'URL du backend
- Tester sur différents appareils
- Publier sur les stores

## Tests

```javascript
// Test de vérification
const testSubscription = async () => {
    const userId = 123456789; // ID de test
    const result = await checkSubscription(userId);
    console.log('Résultat:', result);
};
```

## Dépannage

### Erreurs courantes
- "Chat not found" : Le bot n'est pas admin du canal
- "User not found" : L'utilisateur n'a jamais interagi avec le bot
- "Unauthorized" : Token du bot incorrect

### Solutions
- Vérifier que le bot est admin du canal
- Demander à l'utilisateur d'envoyer `/start` au bot
- Vérifier les permissions et le token

## Conclusion

Cette solution offre une vérification robuste et sécurisée de l'abonnement Telegram, garantissant que seuls les vrais abonnés peuvent accéder à l'application ATOMIC FLIX.