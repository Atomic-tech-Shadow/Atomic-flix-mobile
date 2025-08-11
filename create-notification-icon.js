// Script pour créer une icône de notification blanche
// Vous devez exécuter ce script pour générer l'icône appropriée

console.log(`
📱 SOLUTION pour l'icône de notification ATOMIC FLIX

❌ PROBLÈME IDENTIFIÉ:
- Votre icon.png est colorée (rose, cyan, violet)
- Android notifications exigent: BLANC UNIQUEMENT + fond transparent
- Votre config actuelle utilise une icône colorée

✅ SOLUTIONS:

1. CRÉATION D'ICÔNE MANUELLE (Recommandé):
   - Ouvrez: https://romannurik.github.io/AndroidAssetStudio/icons-notification.html
   - Uploadez votre logo ATOMIC FLIX
   - Sélectionnez "Trim" et "White"
   - Téléchargez le résultat (96x96px)
   - Remplacez assets/icon.png ou créez assets/notification-icon.png

2. SOLUTION TEMPORAIRE:
   - Utilisez une icône générique blanche
   - Créez un "F" blanc simple en SVG/PNG

3. CONFIGURATION ACTUELLE:
   - app.json configuré correctement
   - Double configuration (notification + plugin) ✓
   - Couleur blanche (#ffffff) ✓
   - Il faut juste la bonne icône PNG !

⚠️  IMPORTANT:
- Les changements de notification icon nécessitent un BUILD complet
- Ne fonctionne pas avec Expo Go (développement)
- Test uniquement avec APK/AAB compilé

🔧 PROCHAINES ÉTAPES:
1. Créer l'icône blanche (lien ci-dessus)
2. Remplacer assets/icon.png
3. Faire un build Android: "eas build -p android"
4. Tester avec l'APK final
`);