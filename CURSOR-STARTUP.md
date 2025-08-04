# 🚀 Guide de Démarrage Cursor - VITRINE

## ⚡ **Démarrage en 5 Minutes**

### **1. Ouvrir le Projet dans Cursor**
```bash
# Dans Cursor
File → Open Folder → Sélectionner "Annexe/VITRINE"
```

### **2. Installer les Extensions Recommandées**
1. **Ctrl+Shift+X** → Ouvrir Extensions
2. **Installer automatiquement** les extensions recommandées
3. **Redémarrer Cursor** si nécessaire

### **3. Configurer Git**
```bash
# Dans le terminal Cursor (Ctrl+`)
git init
git add .
git commit -m "Initial commit - VITRINE v4.0"
```

### **4. Connecter GitHub**
```bash
# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/vitrine-av-uqam.git
git branch -M main
git push -u origin main
```

### **5. Authentifier GitHub dans Cursor**
1. **Ctrl+Shift+P** → "GitHub: Sign in"
2. **Suivre** le processus d'authentification
3. **Autoriser** Cursor à accéder à GitHub

## 🎯 **Workflow de Développement**

### **A. Développement Local**
```bash
# Tester localement
.\test-local.ps1
```

### **B. Commit et Push**
```bash
# Méthode 1: Terminal
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# Méthode 2: Interface Cursor
# Ctrl+Shift+G → Source Control
# Taper message → Ctrl+Enter
# Cliquer Sync
```

### **C. Déploiement Rapide**
```bash
# Déploiement automatique
.\deploy-quick.ps1 -Message "Update VITRINE"
```

## 🔧 **Raccourcis Cursor Essentiels**

### **Navigation**
- **Ctrl+P** : Recherche rapide de fichiers
- **Ctrl+Shift+P** : Command palette
- **Ctrl+G** : Aller à la ligne
- **Ctrl+Shift+G** : Source Control

### **Édition**
- **Ctrl+S** : Sauvegarder
- **Ctrl+Z** : Annuler
- **Ctrl+Shift+Z** : Rétablir
- **Ctrl+D** : Sélectionner prochaine occurrence
- **Alt+Shift+F** : Formater le document

### **Git**
- **Ctrl+Shift+G** : Source Control
- **Ctrl+Enter** : Commit (dans Source Control)
- **Ctrl+Shift+P** → "Git: Push"
- **Ctrl+Shift+P** → "Git: Pull"

### **Terminal**
- **Ctrl+`** : Ouvrir/fermer terminal
- **Ctrl+Shift+`** : Nouveau terminal
- **Ctrl+Shift+5** : Split terminal

## 📋 **Extensions Essentielles**

### **Git et GitHub**
- ✅ **GitHub Pull Requests and Issues**
- ✅ **GitHub Repositories**
- ✅ **GitLens**
- ✅ **Git Graph**

### **Développement Web**
- ✅ **Live Server**
- ✅ **Auto Rename Tag**
- ✅ **CSS Peek**
- ✅ **HTML CSS Support**

### **Productivité**
- ✅ **Prettier**
- ✅ **Path Intellisense**
- ✅ **Auto Close Tag**
- ✅ **Markdown All in One**

## 🎨 **Configuration Thème**

### **Thème Recommandé**
```json
{
  "workbench.colorTheme": "Default Dark+",
  "workbench.iconTheme": "vs-seti"
}
```

### **Paramètres Optimisés**
```json
{
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "editor.formatOnSave": true,
  "editor.wordWrap": "on",
  "editor.tabSize": 2
}
```

## 🧪 **Tests Intégrés**

### **Test Local**
```bash
# Lancer tous les tests
.\test-local.ps1
```

### **Test Rapide**
```bash
# Tester un fichier spécifique
start test-simple.html
```

### **Test Production**
- **GitHub Pages** : `https://VOTRE_USERNAME.github.io/vitrine-av-uqam/`
- **Netlify** : `https://vitrine-av-uqam.netlify.app/`

## 🔄 **Workflow Complet**

### **1. Développement**
1. **Modifier** le code dans Cursor
2. **Sauvegarder** automatiquement
3. **Tester** localement avec `.\test-local.ps1`

### **2. Versioning**
1. **Vérifier** les changements (Ctrl+Shift+G)
2. **Commit** avec message descriptif
3. **Push** vers GitHub

### **3. Déploiement**
1. **Déploiement automatique** sur GitHub Pages
2. **Déploiement automatique** sur Netlify
3. **Vérifier** les URLs de production

## 🐛 **Dépannage**

### **Problème : Git non configuré**
```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

### **Problème : GitHub non connecté**
1. **Ctrl+Shift+P** → "GitHub: Sign in"
2. **Suivre** le processus d'authentification

### **Problème : Extensions non installées**
1. **Ctrl+Shift+X** → Rechercher l'extension
2. **Installer** manuellement

### **Problème : Terminal ne fonctionne pas**
1. **Ctrl+Shift+P** → "Terminal: Create New Terminal"
2. **Vérifier** que PowerShell est disponible

## 🎯 **Prochaines Étapes**

### **1. Personnalisation**
- **Configurer** votre thème préféré
- **Ajouter** des extensions spécifiques
- **Créer** des snippets personnalisés

### **2. Collaboration**
- **Inviter** des collaborateurs sur GitHub
- **Configurer** les Pull Requests
- **Mettre en place** les Issues

### **3. Automatisation**
- **Configurer** GitHub Actions
- **Mettre en place** les tests automatisés
- **Configurer** le déploiement continu

---

## 🎉 **Félicitations !**

Vous êtes maintenant prêt à développer VITRINE avec Cursor, GitHub et Netlify !

**💡 Conseil** : Commencez par les tests locaux, puis passez au déploiement automatique. 