# Guide des Notifications Planning - Atomic Flix

## 🕐 Vue d'ensemble

Le système de notifications planning d'Atomic Flix permet aux utilisateurs de recevoir des rappels automatiques pour les sorties d'animes prévues dans la section "🕐 Sorties cette semaine".

## 🎯 Fonctionnalités

### Types de Notifications
1. **🌅 Rappel du matin** (9h00) - "📅 Aujourd'hui : [Titre anime]"
2. **⏰ 1h avant** - "🕐 Dans 1h : [Titre anime]" 
3. **🎉 Heure exacte** - "🎉 Disponible : [Titre anime]"

### Programmation Intelligente
- **Parsing automatique** des heures (20h15, 12h00, 9h30, etc.)
- **Filtrage** : seules les sorties futures sont programmées
- **Limitation** : 15 animes maximum pour éviter le spam
- **Nettoyage** : suppression automatique des anciennes notifications

## 🚀 Configuration Technique

### Canal Android
```javascript
{
  name: 'Rappels Planning',
  importance: AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#FFC107', // Jaune planning
  sound: 'notification_sound_default'
}
```

### Structure des Données
```typescript
interface PlanningItem {
  id: string;
  title: string;
  releaseTime: string; // Format "20h15"
  language: string;    // VF, VOSTFR, etc.
  image: string;
  animeId: string;
  url: string;
}
```

## 🎮 Utilisation

### Activation/Désactivation
1. **Cloche HomeScreen** : Active/désactive toutes les notifications
2. **Activation** : Programme automatiquement les 15 prochaines sorties
3. **Désactivation** : Annule toutes les notifications planning

### Navigation
- **Tap notification** → Navigation directe vers AnimeDetailScreen
- **Données** : Titre, URL, type de rappel inclus dans la notification

### Refresh Automatique
- **Pull-to-refresh** : Reprogramme les notifications avec les dernières données
- **Mise à jour** : Utilise l'API `/api/planning` en temps réel

## 🧪 Tests et Validation

### Script de Test
```bash
node test-planning-notifications.js
```

#### Vérifications (7/7 réussies)
1. ✅ **Service existe** : PlanningNotificationService.ts
2. ✅ **Méthodes complètes** : initialize, schedule, parse, cancel, stats
3. ✅ **Intégration HomeScreen** : import, instance, initialize, toggle
4. ✅ **Parsing heures** : 20h15 → {hours: 20, minutes: 15}
5. ✅ **Configuration Android** : canal, vibration, couleur
6. ✅ **Types notifications** : hour_before, morning_reminder, day_of
7. ✅ **Imports TypeScript** : expo-notifications, AsyncStorage, animeAPI

## 📅 Logique de Programmation

### Exemple : Anime sortant à 20h15
```
📅 09h00 : "📅 Aujourd'hui : Attack on Titan S4"
⏰ 19h15 : "🕐 Dans 1h : Attack on Titan S4" 
🎉 20h15 : "🎉 Disponible : Attack on Titan S4"
```

### Conditions
- **Heure future** : Pas de notification pour les sorties passées
- **Jour suivant** : Si 20h15 est passé aujourd'hui → programmation demain
- **Weekend** : Système fonctionne 7j/7

## 🔧 Maintenance

### AsyncStorage Keys
- `planning_notifications` : Paramètres utilisateur
- `scheduled_planning_notifications` : Liste des notifications programmées

### API Endpoint
- **URL** : `https://anime-sama-scraper.vercel.app/api/planning`
- **Format** : Array d'objets avec title, releaseTime, language, image
- **Limite** : 80 animes disponibles, 15 utilisés pour notifications

## 🚨 Gestion d'Erreurs

### Cas d'Échec
1. **Parsing impossible** : Heure au format non standard (ex: "Bientôt")
2. **Permission refusée** : Notifications bloquées dans les paramètres
3. **API indisponible** : Erreur réseau ou serveur

### Fallbacks
- **Erreur parsing** : Skip l'anime, continue avec les suivants
- **Échec programmation** : Log erreur, continue le traitement
- **API down** : Conserve les notifications existantes

## 📱 UX Mobile

### Indicateurs Visuels
- **Badge rouge** : Notifications non lues générales
- **État cloche** : Cyan = activé, Gris = désactivé
- **Section planning** : Badges "SORTIE" avec horaires

### Messages Utilisateur
- **Activation** : Programmation silencieuse en arrière-plan
- **Désactivation** : Annulation immediate de tous les rappels
- **Refresh** : Reprogrammation automatique des nouvelles données

---

**Note** : Ce système est conçu pour fonctionner en production avec les vraies permissions Android et les notifications push Expo.