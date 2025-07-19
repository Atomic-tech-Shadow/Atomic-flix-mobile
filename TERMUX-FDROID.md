# F-Droid avec Termux

## Configuration terminée ✅
- Structure fastlane complète (metadata, icône, descriptions)
- YAML F-Droid prêt : `metadata-fdroid/com.atomicflix.mobile.yml`
- License MIT

## Commandes Termux

```bash
# Setup
pkg install git
git init && git add . && git commit -m "Atomic Flix v1.0.0"
git tag v1.0.0

# Upload (créer repo sur GitHub d'abord)
git remote add origin https://github.com/USERNAME/atomic-flix-mobile.git
git push -u origin main --tags

# Modifier YAML
nano metadata-fdroid/com.atomicflix.mobile.yml
# Remplacer YOUR_USERNAME par votre username

# Soumission F-Droid
git clone --depth=1 https://gitlab.com/USERNAME/fdroiddata.git
cd fdroiddata
git checkout -b com.atomicflix.mobile
cp ../metadata-fdroid/com.atomicflix.mobile.yml metadata/
git add . && git commit -m "New App: com.atomicflix.mobile"
git push origin com.atomicflix.mobile
```

Ensuite créer merge request sur GitLab.