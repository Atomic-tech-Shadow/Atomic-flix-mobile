# Configuration Telegram pour ATOMIC FLIX

## Instructions de configuration

### 1. Modifier l'URL du canal Telegram

Dans le fichier `App.tsx`, ligne 78, remplacez :

```typescript
telegramChannelUrl="https://t.me/votre_canal" // Remplacez par votre URL
```

Par votre vraie URL Telegram, par exemple :
```typescript
telegramChannelUrl="https://t.me/atomicflix_official"
```

### 2. Modifier le nom du canal

Ligne 79, changez :
```typescript
channelName="ATOMIC FLIX Official"
```

Par le nom de votre canal.

### 3. Types d'URLs Telegram supportées

- **Canal public** : `https://t.me/nom_du_canal`
- **Canal privé** : `https://t.me/+lien_d_invitation`
- **Groupe** : `https://t.me/joinchat/lien_d_invitation`

### 4. Fonctionnalités implémentées

✅ **Bouton S'abonner** : Ouvre directement votre canal Telegram
✅ **Bouton Vérifier** : Simule la vérification d'abonnement
✅ **Stockage local** : Se souvient des utilisateurs vérifiés
✅ **Interface intuitive** : Design cohérent avec l'app
✅ **Bouton reset** : Pour tester (mode développement uniquement)

### 5. Flux utilisateur

1. **Splash Screen** animé (4 secondes)
2. **Écran Telegram** avec message d'abonnement requis
3. L'utilisateur clique "S'abonner" → Telegram s'ouvre
4. L'utilisateur revient et clique "Vérifier"
5. **Application principale** se lance

### 6. Test et debug

- En mode développement, un bouton "Reset" permet de retester le flux
- Le status de vérification est sauvegardé dans AsyncStorage
- L'app vérifie automatiquement au démarrage si l'utilisateur est déjà vérifié

### 7. Personnalisation avancée

Pour intégrer une vraie vérification d'abonnement via l'API Telegram Bot, modifiez la fonction `handleVerify` dans `TelegramVerification.tsx`.

---

**Note** : Cette implémentation utilise une simulation de vérification. Pour une vraie vérification, vous devrez intégrer l'API Telegram Bot.