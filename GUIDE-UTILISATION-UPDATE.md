# 🚀 Guide d'utilisation de la commande /update

## Comment diffuser une mise à jour à tous vos utilisateurs

### 1. Préparer votre APK
- Buildez votre nouvelle version d'ATOMIC FLIX
- Uploadez l'APK sur APKPure
- Récupérez l'URL de téléchargement

### 2. Utiliser la commande /update
```
/update https://apkpure.com/fr/atomic-flix/com.atomicflix.mobile/download
```

### 3. Confirmer la diffusion
Le bot vous demande confirmation :
```
🚀 DIFFUSION MISE À JOUR

📱 Lien: https://apkpure.com/fr/atomic-flix/...
📊 Utilisateurs ciblés: 1,247

Confirmer la diffusion ?
[✅ Confirmer] [❌ Annuler]
```

### 4. Diffusion automatique
- Notification envoyée à TOUS les utilisateurs vérifiés
- Message reçu instantanément sur leurs téléphones
- Boutons "Télécharger APK" et "Voir sur APKPure"

## 📱 Ce que voit l'utilisateur

Notification push reçue :
```
🎉 NOUVELLE MISE À JOUR ATOMIC FLIX !

✨ Une nouvelle version est disponible sur APKPure

📱 Fonctionnalités améliorées:
• Performance optimisée
• Corrections de bugs  
• Nouvelles fonctionnalités

⬇️ Téléchargez maintenant pour profiter des dernières améliorations !

[📥 Télécharger APK] [📰 Voir sur APKPure]
```

## ✅ Avantages du système

1. **Diffusion massive instantanée** - Tous les utilisateurs notifiés en même temps
2. **Taux de mise à jour élevé** - Notification directe sur téléphone
3. **Simplicité** - Une seule commande Telegram
4. **Statistiques** - Rapport de diffusion avec succès/échecs
5. **Ciblage précis** - Seulement les utilisateurs vérifiés

## 🔧 Intégration technique

### Dans l'app mobile :
- Service PushNotificationService enregistre automatiquement l'utilisateur
- UserService génère un ID unique persistant
- Intégration invisible lors de la vérification Telegram

### Côté serveur :
- API `/api/register-push-token` gère les enregistrements
- Bot Telegram diffuse via l'API Expo Push
- Respect des limites (30 messages/seconde)

## 📊 Monitoring

Vérifiez les statistiques :
```
/stats
```

Voir les utilisateurs actifs, tokens enregistrés, dernière activité, etc.

---

**Résultat :** Une simple commande Telegram permet de notifier instantanément tous vos utilisateurs d'une nouvelle version disponible !