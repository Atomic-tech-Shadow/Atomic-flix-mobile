# ⚡ GUIDE RAPIDE - Configuration Bot Telegram

## 🎯 CE QUE VOUS DEVEZ FAIRE

### 1. Créer le Bot (5 minutes)
1. Ouvrir Telegram → Rechercher `@BotFather`
2. Envoyer `/newbot`
3. Nom : `ATOMIC FLIX Verifier`
4. Username : `atomic_flix_verifier_bot`
5. **COPIER LE TOKEN** (format : `1234567890:ABCDEF...`)

### 2. Configurer le Canal (2 minutes)
1. Aller sur https://t.me/Atomic_flix_officiel
2. Gérer le canal → Administrateurs → Ajouter
3. Rechercher `atomic_flix_verifier_bot`
4. Donner permissions : "Gérer les messages" + "Voir les membres"

### 3. Déployer le Serveur (10 minutes)
**Option recommandée : Replit**
1. Créer nouveau Repl Node.js
2. Copier les fichiers du dossier `server/`
3. Installer : `npm install`
4. Configurer les secrets Replit :
   - `BOT_TOKEN` = votre token
   - `CHANNEL_ID` = @Atomic_flix_officiel
5. Démarrer : `npm start`

### 4. Tester (3 minutes)
1. Accéder à votre URL + `/health`
2. Tester le bot : `/start` puis `/verify`
3. Vérifier l'API avec Postman

### 5. Intégrer (5 minutes)
1. Modifier `src/utils/telegramAPI.js`
2. Remplacer `API_BASE_URL` par votre URL
3. Tester l'application

## 🔗 APRÈS DÉPLOIEMENT

**M'envoyer :**
- ✅ URL du backend (ex: https://votre-app.replit.app)
- ✅ Confirmation que `/health` fonctionne
- ✅ Nom du bot créé

**Je vais :**
- ✅ Intégrer l'URL dans l'app React Native
- ✅ Remplacer la simulation par la vérification réelle
- ✅ Tester le système complet

## 📋 FICHIERS À DÉPLOYER

```
atomic-flix-telegram-server/
├── telegramBot.js      (serveur principal)
├── package.json        (dépendances)
├── .env               (BOT_TOKEN + CHANNEL_ID)
```

## 🆘 EN CAS DE PROBLÈME

**Bot ne répond pas :**
- Vérifier que le bot est admin du canal
- Vérifier le token dans les variables d'environnement

**API ne fonctionne pas :**
- Vérifier `/health` endpoint
- Vérifier les logs du serveur

**"User not found" :**
- L'utilisateur doit d'abord envoyer `/start` au bot

---

**🎯 OBJECTIF : Une fois votre serveur déployé, envoyez-moi simplement l'URL et je finalise l'intégration !**