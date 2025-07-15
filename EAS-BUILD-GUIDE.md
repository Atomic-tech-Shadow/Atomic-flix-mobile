# 🚀 Guide EAS Build - ATOMIC FLIX

## Configuration EAS

L'ID du projet EAS a été configuré dans `app.json` :
```json
{
  "extra": {
    "eas": {
      "projectId": "e5b84028-0715-4bc5-861b-a2bfd28a99e9"
    }
  }
}
```

## Authentification EAS

Pour utiliser EAS CLI, vous devez vous authentifier :

```bash
# Connexion avec email/nom d'utilisateur
npx eas login

# Ou avec token d'accès
npx eas login --token YOUR_TOKEN
```

## Commandes de build disponibles

### Build Android

```bash
# Build APK de test (profile preview)
npx eas build --platform android --profile preview

# Build APK de production
npx eas build --platform android --profile production

# Build local avec keystore
npx eas build --platform android --profile preview --local
```

### Build iOS (si configuré)

```bash
# Build iOS de test
npx eas build --platform ios --profile preview

# Build iOS de production
npx eas build --platform ios --profile production
```

## Profiles de build configurés

### Preview (développement/test)
- Type : APK
- Distribution : Interne
- Keystore : Local
- Environnement : Production

### Production
- Type : APK
- Distribution : Store
- Keystore : Local
- Optimisations : Maximales

## Structure des credentials

Le projet utilise un keystore local configuré dans :
- `signing.keystore` - Fichier keystore
- `credentials.json` - Configuration keystore pour EAS
- `signing-key-info.txt` - Informations keystore

## Workflow de build recommandé

1. **Authentification**
   ```bash
   npx eas login
   ```

2. **Build de test**
   ```bash
   npx eas build --platform android --profile preview
   ```

3. **Téléchargement APK**
   - Lien fourni dans le terminal
   - Ou via : `npx eas build:list`

4. **Build de production**
   ```bash
   npx eas build --platform android --profile production
   ```

## Dépannage

### Problèmes d'authentification
- Vérifiez votre connexion internet
- Utilisez `npx eas logout` puis `npx eas login`
- Vérifiez vos credentials Expo

### Problèmes de build
- Vérifiez la configuration dans `eas.json`
- Assurez-vous que le keystore est présent
- Testez avec `npm run doctor`

### Problèmes de keystore
- Vérifiez `signing.keystore` et `credentials.json`
- Testez les mots de passe dans `signing-key-info.txt`
- Régénérez le keystore si nécessaire

## Scripts automatisés

Le projet inclut des scripts pour simplifier le build :

```bash
# Build avec keystore automatique
./build-with-keystore.sh

# Test de configuration
./test-android-config.sh

# Correction des problèmes
./fix-android-build.sh
```

---

**Note :** EAS CLI est maintenant installé et configuré. Vous pouvez commencer à builder dès que vous vous authentifiez avec `npx eas login`.