# 🚀 Déploiement Tamboura sur GitHub

## Étape 1: Créer le repository GitHub

### Via interface GitHub.com
1. Allez sur [github.com](https://github.com)
2. Cliquez sur le bouton vert **"New"** ou le **"+"** en haut à droite
3. Remplissez les informations :
   - **Repository name:** `tamboura-pwa`
   - **Description:** `PWA mobile-first pour constats d'intervention numériques - Forces de l'ordre Mali`
   - **Visibilité:** Public ou Private selon vos besoins
   - ⚠️ **NE PAS** cocher "Add a README file" (nous en avons déjà un)
   - ⚠️ **NE PAS** ajouter .gitignore ou license (déjà présents)
4. Cliquez sur **"Create repository"**

## Étape 2: Connecter et pousser le code local

Une fois le repository créé, GitHub vous donnera des instructions. Utilisez celles-ci :

### Commandes à exécuter dans votre terminal

```bash
# Ajouter l'origine remote (remplacez YOUR_USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/YOUR_USERNAME/tamboura-pwa.git

# Renommer la branche principale (optionnel, si vous voulez main au lieu de master)
git branch -M main

# Pousser le code vers GitHub
git push -u origin main
```

### Exemple avec un nom d'utilisateur fictif
```bash
git remote add origin https://github.com/monusername/tamboura-pwa.git
git branch -M main
git push -u origin main
```

## Étape 3: Configurer le repository (optionnel)

### Ajouter des topics/tags
Dans les paramètres du repository sur GitHub, ajoutez ces topics :
- `pwa`
- `react`
- `typescript`
- `mobile-first`
- `offline-first`
- `law-enforcement`
- `incident-reporting`
- `mali`
- `africa`
- `tamboura`

### Activer GitHub Pages (pour demo)
1. Allez dans **Settings** > **Pages**
2. Source : **GitHub Actions**
3. Créez un workflow de déploiement automatique

## Étape 4: Déploiement en production

### Déploiement rapide avec Vercel
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Déploiement avec Netlify
```bash
npm run build
# Puis déposez le dossier `dist` sur netlify.com
```

### Variables d'environnement pour production
Créez un fichier `.env` avec :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-publique
VITE_APP_NAME=Tamboura
VITE_APP_VERSION=1.0.0
```

## 🎯 Repository prêt pour :

- ✅ **Collaboration** avec d'autres développeurs
- ✅ **Issues** et feature requests
- ✅ **Pull requests** pour contributions
- ✅ **Releases** avec versioning
- ✅ **CI/CD** avec GitHub Actions
- ✅ **Déploiement** automatique
- ✅ **Documentation** complète

## 📱 Test de l'app déployée

Une fois déployée, testez avec :
- **Agent:** A001 / demo123
- **Superviseur:** S001 / demo123  
- **Admin:** ADM001 / demo123

L'application sera accessible depuis n'importe quel appareil mobile avec navigation hors ligne complète !

## 🔗 Liens utiles après déploiement

- **Repository:** `https://github.com/YOUR_USERNAME/tamboura-pwa`
- **Demo live:** `https://tamboura-pwa.vercel.app` (exemple)
- **Documentation:** README.md dans le repo
- **Issues:** Pour bugs et feature requests