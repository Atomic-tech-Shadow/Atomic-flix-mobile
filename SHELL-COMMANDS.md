# Commandes Shell pour F-Droid

## 1. Sur votre machine locale (après téléchargement)

```bash
# Télécharger le projet depuis Replit
# Puis sur votre machine :

cd atomic-flix-mobile

# Initialiser git
git init
git add .
git commit -m "Initial commit: Atomic Flix v1.0.0"

# Créer le tag
git tag v1.0.0

# Ajouter votre dépôt distant (remplacer par votre URL)
git remote add origin https://github.com/VOTRE_USERNAME/atomic-flix-mobile.git

# Push vers GitHub/GitLab
git push -u origin main
git push --tags
```

## 2. Mettre à jour la configuration F-Droid

```bash
# Ouvrir et modifier le fichier YAML
nano metadata-fdroid/com.atomicflix.mobile.yml

# Remplacer YOUR_USERNAME par votre vrai nom d'utilisateur
sed -i 's/YOUR_USERNAME/votre-username/g' metadata-fdroid/com.atomicflix.mobile.yml
```

## 3. Préparer soumission F-Droid

```bash
# Cloner fdroiddata
git clone --depth=1 https://gitlab.com/VOTRE_USERNAME/fdroiddata.git ~/fdroiddata
cd ~/fdroiddata

# Créer branche
git checkout -b com.atomicflix.mobile

# Copier metadata
cp ~/atomic-flix-mobile/metadata-fdroid/com.atomicflix.mobile.yml metadata/

# Commit et push
git add metadata/com.atomicflix.mobile.yml
git commit -m "New App: com.atomicflix.mobile"
git push origin com.atomicflix.mobile
```

## 4. Alternative : Automatisation complète

```bash
# Script tout-en-un (après avoir set vos variables)
export GITHUB_USERNAME="votre-username"
export REPO_NAME="atomic-flix-mobile"

# Setup
git init && git add . && git commit -m "Initial: Atomic Flix v1.0.0"
git tag v1.0.0
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
git push -u origin main --tags

# F-Droid
sed -i "s/YOUR_USERNAME/$GITHUB_USERNAME/g" metadata-fdroid/com.atomicflix.mobile.yml
echo "✅ Configuration mise à jour pour $GITHUB_USERNAME"
```

Tout peut être fait en shell ! 🚀