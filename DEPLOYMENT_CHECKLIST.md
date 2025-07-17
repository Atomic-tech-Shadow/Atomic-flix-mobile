# 🚀 CHECKLIST DE DÉPLOIEMENT - Vérification Telegram ATOMIC FLIX

## 📋 ÉTAPES À SUIVRE DANS L'ORDRE

### 1. 🤖 CRÉER LE BOT TELEGRAM

#### A. Création du bot
1. **Ouvrir Telegram** et rechercher `@BotFather`
2. **Envoyer** : `/newbot`
3. **Choisir le nom** : `ATOMIC FLIX Verifier`
4. **Choisir le username** : `atomic_flix_verifier_bot`
5. **SAUVEGARDER LE TOKEN** fourni (format : `1234567890:ABCDEF...`)

#### B. Configuration du bot
1. **Envoyer** : `/setdescription` à @BotFather
2. **Sélectionner** votre bot
3. **Définir la description** : "Bot officiel de vérification d'abonnement pour ATOMIC FLIX"
4. **Envoyer** : `/setabouttext` à @BotFather
5. **Définir le texte** : "Vérification d'abonnement ATOMIC FLIX"

#### C. Ajout du bot au canal
1. **Aller sur** : https://t.me/Atomic_flix_officiel
2. **Cliquer** sur le nom du canal (en haut)
3. **Cliquer** sur "Gérer le canal"
4. **Cliquer** sur "Administrateurs"
5. **Ajouter un administrateur**
6. **Rechercher** : `atomic_flix_verifier_bot`
7. **Donner les permissions** :
   - ✅ Gérer les messages
   - ✅ Voir les membres
   - ❌ Autres permissions (pas nécessaires)

### 2. 🌐 DÉPLOYER LE SERVEUR BACKEND

#### A. Préparer les fichiers
1. **Créer un dossier** : `atomic-flix-telegram-server`
2. **Copier ces fichiers** du projet :
   - `server/telegramBot.js`
   - `server/package.json`
   - `server/.env.example`

#### B. Configurer l'environnement
1. **Renommer** `.env.example` en `.env`
2. **Remplir** le fichier `.env` :
```env
BOT_TOKEN=1234567890:ABCDEF_votre_token_ici
CHANNEL_ID=@Atomic_flix_officiel
PORT=3000
NODE_ENV=production
```

#### C. Hébergement recommandé
**Option 1: Replit (Recommandé)**
1. Créer un nouveau Repl Node.js
2. Uploader les fichiers
3. Installer les dépendances : `npm install`
4. Configurer les secrets dans Replit
5. Démarrer : `npm start`

**Option 2: Vercel**
1. Créer un compte Vercel
2. Connecter le repository GitHub
3. Configurer les variables d'environnement
4. Déployer

**Option 3: Heroku**
1. Créer une app Heroku
2. Configurer les variables d'environnement
3. Déployer via Git

### 3. 🧪 TESTER LE SERVEUR

#### A. Test de santé
1. **Accéder** à : `https://votre-url.com/health`
2. **Vérifier** la réponse :
```json
{
  "status": "OK",
  "timestamp": "2025-01-17T...",
  "botToken": "Configuré",
  "channelId": "@Atomic_flix_officiel"
}
```

#### B. Test du bot
1. **Rechercher** votre bot sur Telegram : `@atomic_flix_verifier_bot`
2. **Envoyer** : `/start`
3. **Vérifier** la réponse de bienvenue
4. **Envoyer** : `/verify`
5. **Vérifier** le statut d'abonnement

#### C. Test de l'API
1. **Utiliser Postman** ou curl :
```bash
curl -X POST https://votre-url.com/api/verify-subscription \
  -H "Content-Type: application/json" \
  -d '{"userId": "votre_telegram_id"}'
```

### 4. 📱 INTÉGRER DANS L'APP REACT NATIVE

#### A. Mettre à jour l'URL API
1. **Modifier** `src/utils/telegramAPI.js`
2. **Remplacer** :
```javascript
const API_BASE_URL = 'https://votre-url-backend.com';
```

#### B. Mettre à jour TelegramVerification.tsx
1. **Importer** l'API :
```javascript
import { verifyTelegramSubscription } from '../utils/telegramAPI';
```

2. **Remplacer** la fonction `handleVerify` :
```javascript
const handleVerify = async () => {
  if (!hasSubscribed) {
    Alert.alert('Erreur', 'Veuillez d\'abord vous abonner.');
    return;
  }
  
  setIsVerifying(true);
  
  try {
    // Récupérer l'ID utilisateur Telegram
    const userId = await getTelegramUserId();
    
    const result = await verifyTelegramSubscription(userId);
    
    if (result.isSubscribed) {
      await AsyncStorage.setItem('telegram_verified', 'true');
      Alert.alert('Succès', 'Vérification réussie !');
      onVerified();
    } else {
      Alert.alert('Erreur', 'Abonnement non détecté.');
    }
  } catch (error) {
    Alert.alert('Erreur', 'Problème de vérification.');
  } finally {
    setIsVerifying(false);
  }
};
```

### 5. 🔑 OBTENIR L'ID UTILISATEUR TELEGRAM

#### Option 1: Via bot (Simple)
1. **Créer** une commande `/getid` dans le bot
2. **Afficher** l'ID dans la conversation
3. **Copier** manuellement dans l'app

#### Option 2: Via Telegram Login Widget (Avancé)
1. **Installer** : `npm install @telegram-auth/react`
2. **Intégrer** le widget d'authentification
3. **Récupérer** l'ID automatiquement

### 6. 🧪 TESTS COMPLETS

#### A. Test de bout en bout
1. **Utilisateur NON abonné** :
   - Ouvrir l'app
   - Cliquer "Vérifier" → Doit échouer
   
2. **Utilisateur abonné** :
   - S'abonner au canal
   - Cliquer "Vérifier" → Doit réussir
   
3. **Utilisateur qui quitte** :
   - Quitter le canal
   - Cliquer "Vérifier" → Doit échouer

#### B. Test des erreurs
1. **Serveur hors ligne** → Message d'erreur approprié
2. **Token invalide** → Erreur d'autorisation
3. **Canal inexistant** → Erreur de canal

### 7. 📊 MONITORING ET LOGS

#### A. Logs importants à surveiller
- Nombre de vérifications par jour
- Taux de succès/échec
- Erreurs d'API
- Performances du serveur

#### B. Alertes à configurer
- Serveur hors ligne
- Erreurs d'authentification
- Quota API dépassé

## 🎯 CHECKLIST FINAL

### ✅ Avant déploiement
- [ ] Bot créé et configuré
- [ ] Token récupéré et sécurisé
- [ ] Bot ajouté comme admin du canal
- [ ] Serveur déployé et fonctionnel
- [ ] Tests de santé passés
- [ ] API testée avec Postman

### ✅ Après déploiement
- [ ] URL backend envoyée à l'équipe
- [ ] App React Native mise à jour
- [ ] Tests de bout en bout réussis
- [ ] Monitoring activé
- [ ] Documentation mise à jour

## 📞 SUPPORT

### En cas de problème
1. **Vérifier** les logs du serveur
2. **Tester** l'API manuellement
3. **Vérifier** les permissions du bot
4. **Contacter** l'équipe technique

### URLs utiles
- Documentation Telegram Bot API: https://core.telegram.org/bots/api
- @BotFather: https://t.me/BotFather
- Canal ATOMIC FLIX: https://t.me/Atomic_flix_officiel

---

**📝 NOTES IMPORTANTES**
- Gardez le token du bot SECRET
- Testez toujours sur un canal de test d'abord
- Surveillez les quotas API Telegram
- Sauvegardez les configurations