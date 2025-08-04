# 🔗 Association Cursor + GitHub + Netlify - VITRINE

## 🎯 **Workflow Intégré**

### **1. Configuration Git dans Cursor**

#### **A. Initialiser Git dans Cursor**
```bash
# Dans le terminal Cursor (Ctrl+`)
git init
git add .
git commit -m "Initial commit - VITRINE v4.0"
```

#### **B. Configurer GitHub Remote**
```bash
# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/vitrine-av-uqam.git
git branch -M main
git push -u origin main
```

#### **C. Vérifier la Configuration**
```bash
# Vérifier les remotes
git remote -v

# Vérifier le statut
git status
```

### **2. Intégration GitHub dans Cursor**

#### **A. Extension GitHub**
1. Ouvrir Cursor
2. Aller dans Extensions (Ctrl+Shift+X)
3. Rechercher "GitHub"
4. Installer "GitHub Pull Requests and Issues"
5. Installer "GitHub Repositories"

#### **B. Authentification GitHub**
1. Ctrl+Shift+P → "GitHub: Sign in"
2. Suivre le processus d'authentification
3. Autoriser Cursor à accéder à GitHub

#### **C. Fonctionnalités GitHub dans Cursor**
- **Source Control** : Ctrl+Shift+G
- **Commit** : Ctrl+Enter dans Source Control
- **Push/Pull** : Boutons dans Source Control
- **Branches** : Sélecteur en bas à gauche
- **Issues** : Onglet GitHub dans la sidebar

### **3. Configuration Netlify**

#### **A. Créer un Compte Netlify**
1. Aller sur [netlify.com](https://netlify.com)
2. Sign up avec votre compte GitHub
3. Autoriser l'accès aux repositories

#### **B. Connecter le Repository**
1. Dans Netlify Dashboard
2. "New site from Git"
3. Choisir "GitHub"
4. Sélectionner le repository `vitrine-av-uqam`
5. Configuration :
   - **Build command** : (laisser vide)
   - **Publish directory** : (laisser vide)
   - **Deploy site**

#### **C. Configuration Avancée Netlify**
```toml
# netlify.toml (créer dans le dossier VITRINE)
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### **4. Workflow de Développement Intégré**

#### **A. Développement Local**
```bash
# Dans Cursor Terminal
# 1. Modifier le code
# 2. Tester localement
start test-simple.html

# 3. Vérifier les changements
git status
git diff
```

#### **B. Commit et Push**
```bash
# 4. Ajouter les changements
git add .

# 5. Commit avec message descriptif
git commit -m "feat: ajouter nouvelle fonctionnalité"

# 6. Push vers GitHub
git push origin main
```

#### **C. Déploiement Automatique**
- **GitHub Pages** : Déploiement automatique en 2-3 minutes
- **Netlify** : Déploiement automatique en 1-2 minutes
- **URLs** :
  - GitHub Pages : `https://VOTRE_USERNAME.github.io/vitrine-av-uqam/`
  - Netlify : `https://vitrine-av-uqam.netlify.app/`

### **5. Extensions Cursor Recommandées**

#### **A. Git et GitHub**
```json
// Extensions à installer
{
  "extensions": [
    "GitHub.vscode-pull-request-github",
    "GitHub.vscode-github-repositories",
    "eamodio.gitlens",
    "mhutchie.git-graph"
  ]
}
```

#### **B. Développement Web**
```json
{
  "extensions": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag"
  ]
}
```

#### **C. Productivité**
```json
{
  "extensions": [
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-markdown-all-in-one",
    "yzhang.markdown-all-in-one"
  ]
}
```

### **6. Configuration Cursor Settings**

#### **A. Settings.json**
```json
{
  "git.enableSmartCommit": true,
  "git.confirmSync": false,
  "git.autofetch": true,
  "git.autofetchPeriod": 180,
  "github.pullRequests.enabled": true,
  "github.issues.enabled": true,
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  }
}
```

#### **B. Workspace Settings**
```json
// .vscode/settings.json
{
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/bower_components": true
  }
}
```

### **7. Scripts de Développement**

#### **A. Script de Déploiement Rapide**
```powershell
# deploy-quick.ps1
param([string]$Message = "Update VITRINE")

Write-Host "🚀 Déploiement Rapide VITRINE" -ForegroundColor Cyan

# Vérifier les changements
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Changements détectés" -ForegroundColor Yellow
    
    # Commit et push
    git add .
    git commit -m $Message
    git push origin main
    
    Write-Host "✅ Déployé sur GitHub Pages et Netlify" -ForegroundColor Green
    Write-Host "🌐 GitHub Pages: https://VOTRE_USERNAME.github.io/vitrine-av-uqam/" -ForegroundColor Cyan
    Write-Host "🌐 Netlify: https://vitrine-av-uqam.netlify.app/" -ForegroundColor Cyan
} else {
    Write-Host "ℹ️ Aucun changement détecté" -ForegroundColor Blue
}
```

#### **B. Script de Test**
```powershell
# test-local.ps1
Write-Host "🧪 Test Local VITRINE" -ForegroundColor Cyan

# Ouvrir les fichiers de test
Start-Process "test-simple.html"
Start-Sleep -Seconds 2
Start-Process "test-banners.html"
Start-Sleep -Seconds 2
Start-Process "index.html"

Write-Host "✅ Tests locaux lancés" -ForegroundColor Green
```

### **8. Workflow Complet**

#### **A. Développement Quotidien**
1. **Ouvrir Cursor** → Projet VITRINE
2. **Modifier le code** → Sauvegarde automatique
3. **Tester localement** → `.\test-local.ps1`
4. **Commit** → Ctrl+Shift+G → Ctrl+Enter
5. **Push** → Bouton Sync dans Source Control
6. **Vérifier déploiement** → URLs de production

#### **B. Collaboration**
1. **Pull Requests** : GitHub interface dans Cursor
2. **Code Review** : Extensions GitHub
3. **Issues** : Gestion dans Cursor
4. **Branches** : Création et gestion

#### **C. Monitoring**
- **GitHub Actions** : CI/CD automatique
- **Netlify Functions** : Backend serverless
- **Analytics** : Netlify Analytics
- **Forms** : Netlify Forms

### **9. Avantages de l'Intégration**

#### **A. Cursor + GitHub**
- ✅ **Édition collaborative** en temps réel
- ✅ **Gestion des branches** intégrée
- ✅ **Pull Requests** dans l'éditeur
- ✅ **Issues** et **Projects**
- ✅ **Code Review** avancée

#### **B. Cursor + Netlify**
- ✅ **Déploiement automatique**
- ✅ **Prévisualisation des PR**
- ✅ **Rollback facile**
- ✅ **Fonctions serverless**
- ✅ **Forms intégrés**

#### **C. Workflow Unifié**
- ✅ **Développement** → Cursor
- ✅ **Versioning** → GitHub
- ✅ **Déploiement** → Netlify
- ✅ **Monitoring** → Netlify Analytics

---

## 🎯 **Résultat Final**

Avec cette configuration, vous avez :
- **Développement fluide** dans Cursor
- **Versioning robuste** avec GitHub
- **Déploiement automatique** sur Netlify
- **Workflow professionnel** complet

**💡 Conseil** : Commencez par GitHub Pages pour la simplicité, puis ajoutez Netlify pour les fonctionnalités avancées. 