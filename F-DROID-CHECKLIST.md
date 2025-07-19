# ✅ F-Droid Submission Checklist

## Préparation automatique (TERMINÉE ✅)

- [x] Metadata fastlane créé (descriptions, icône, changelogs)
- [x] YAML F-Droid configuré (`metadata-fdroid/com.atomicflix.mobile.yml`)
- [x] LICENSE MIT ajouté
- [x] README.md avec instructions
- [x] .gitignore configuré pour React Native/Expo
- [x] CHANGELOG.md initialisé
- [x] Scripts de préparation créés
- [x] Documentation contributeur (CONTRIBUTING.md)

## Actions manuelles restantes

### 1. Upload sur Git (REQUIS)
- [ ] Créer un dépôt public sur GitHub ou GitLab
- [ ] Uploader tout le code source
- [ ] Créer le tag v1.0.0 : `git tag v1.0.0 && git push --tags`

### 2. Mise à jour configuration (REQUIS)
- [ ] Modifier `metadata-fdroid/com.atomicflix.mobile.yml`
- [ ] Remplacer `SourceCode: https://github.com/YOUR_USERNAME/atomic-flix-mobile` par votre vraie URL
- [ ] Remplacer `IssueTracker: https://github.com/YOUR_USERNAME/atomic-flix-mobile/issues` par votre vraie URL

### 3. Soumission F-Droid (REQUIS)
- [ ] Créer un compte GitLab si pas déjà fait
- [ ] Fork https://gitlab.com/fdroid/fdroiddata
- [ ] Copier `metadata-fdroid/com.atomicflix.mobile.yml` vers `metadata/com.atomicflix.mobile.yml`
- [ ] Créer merge request avec titre : "New App: com.atomicflix.mobile"

## Script d'aide
```bash
# Lance la vérification automatique
./scripts/prepare-fdroid.sh
```

## Timeline estimée
- Upload Git + configuration : 10 minutes
- Soumission F-Droid : 5 minutes  
- Review F-Droid : 1-2 jours
- Publication : 1-2 jours après review

## Résultat final
Votre app sera disponible sur F-Droid pour des millions d'utilisateurs Android, gratuitement et sans compte développeur requis !