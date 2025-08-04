# 🚀 Déploiement GitHub Pages - VITRINE

## 📋 **Étapes de Déploiement**

### **1. Créer un Repository GitHub**
```bash
# Créer un nouveau repository sur GitHub
# Nom: vitrine-av-uqam
# Description: Application VITRINE - Diagnostic audiovisuel UQAM
# Public ou Private (selon vos besoins)
```

### **2. Initialiser le Repository Local**
```bash
# Dans le dossier VITRINE
git init
git add .
git commit -m "Initial commit - VITRINE v4.0"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/vitrine-av-uqam.git
git push -u origin main
```

### **3. Configurer GitHub Pages**
1. Aller sur GitHub → Repository → Settings
2. Scroll down → Pages
3. Source: Deploy from a branch
4. Branch: main
5. Folder: / (root)
6. Save

### **4. URL de Production**
```
https://VOTRE_USERNAME.github.io/vitrine-av-uqam/
```

## 🔧 **Configuration Spéciale**

### **Fichier .gitignore**
```gitignore
# Ignorer les fichiers de développement
*.log
.DS_Store
node_modules/
.env
```

### **Fichier README.md pour GitHub**
```markdown
# VITRINE - Diagnostic Audiovisuel UQAM

Application web pour le diagnostic et l'assistance audiovisuelle à l'UQAM.

## 🚀 Déploiement
- **URL Production**: https://VOTRE_USERNAME.github.io/vitrine-av-uqam/
- **Dernière mise à jour**: [Date]

## 📁 Structure
```
VITRINE/
├── index.html          # Application principale
├── test-simple.html    # Test interface
├── test-banners.html   # Test bannières
├── css/               # Styles modulaires
├── js/                # JavaScript modulaire
└── images/            # Images et logos
```

## 🧪 Tests
- Ouvrir `test-simple.html` pour tester l'interface
- Ouvrir `test-banners.html` pour tester les bannières
- Ouvrir `index.html` pour l'application complète
```

## ⚡ **Avantages GitHub Pages**
- ✅ **Gratuit** et illimité
- ✅ **HTTPS automatique**
- ✅ **CDN global**
- ✅ **Intégration Git**
- ✅ **Déploiement automatique**
- ✅ **Historique des versions**

## 🔄 **Mise à Jour**
```bash
# Après modifications
git add .
git commit -m "Update VITRINE - [description]"
git push origin main
# Déploiement automatique en 2-3 minutes
```

---

## 🎯 **Alternative : Netlify**

Si vous préférez Netlify :

### **1. Créer un compte Netlify**
- Aller sur netlify.com
- Sign up avec GitHub

### **2. Déployer depuis GitHub**
- New site from Git
- Connect GitHub
- Sélectionner le repository
- Build command: (laisser vide)
- Publish directory: (laisser vide)
- Deploy site

### **3. URL Netlify**
```
https://vitrine-av-uqam.netlify.app/
```

### **4. Avantages Netlify**
- ✅ **URL personnalisée**
- ✅ **Formulaires intégrés**
- ✅ **Fonctions serverless**
- ✅ **Prévisualisation des PR**
- ✅ **Rollback facile**

---

**💡 Recommandation** : Commencez avec GitHub Pages pour la simplicité, puis migrez vers Netlify si vous avez besoin de fonctionnalités avancées. 