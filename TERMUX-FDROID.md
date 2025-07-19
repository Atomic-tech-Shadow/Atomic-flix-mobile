# F-Droid avec Termux

## ✅ TOUT CONFIGURÉ POUR VOTRE REPO
- YAML F-Droid: `metadata-fdroid/com.atomicflix.mobile.yml` 
- SourceCode: https://github.com/Atomic-tech-Shadow/Atomic-flix-mobile
- License MIT, fastlane metadata complet

## Commandes Termux complètes

```bash
# 1. Setup local
pkg install git
git init
git add .
git commit -m "F-Droid configuration complete"
git tag v1.0.0

# 2. Push vers votre repo GitHub
git remote add origin https://github.com/Atomic-tech-Shadow/Atomic-flix-mobile.git
git push -u origin main --tags

# 3. Fork fdroiddata sur GitLab puis:
git clone https://gitlab.com/Atomic-tech-Shadow/fdroiddata.git ~/fdroid
cd ~/fdroid
git checkout -b com.atomicflix.mobile

# 4. Copier metadata et soumettre
cp ~/workspace/metadata-fdroid/com.atomicflix.mobile.yml metadata/
git add metadata/com.atomicflix.mobile.yml
git commit -m "New App: com.atomicflix.mobile - Atomic Flix"
git push origin com.atomicflix.mobile
```

## Résultat
App sur F-Droid dans 2-4 jours après merge request approuvé.