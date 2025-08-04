# 🚀 Déploiement Rapide VITRINE - 5 Étapes

## ⚡ **Déploiement en 5 Minutes**

### **Étape 1 : Créer le Repository GitHub**
1. Aller sur [GitHub.com](https://github.com)
2. Cliquer "New repository"
3. Nom : `vitrine-av-uqam`
4. Description : `Application VITRINE - Diagnostic audiovisuel UQAM`
5. Public ou Private (selon vos besoins)
6. **NE PAS** cocher "Add a README file"
7. Cliquer "Create repository"

### **Étape 2 : Initialiser le Repository Local**
```bash
# Dans le dossier VITRINE
git init
git add .
git commit -m "Initial commit - VITRINE v4.0"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/vitrine-av-uqam.git
git push -u origin main
```

### **Étape 3 : Activer GitHub Pages**
1. Aller sur votre repository GitHub
2. Settings → Pages
3. Source : "Deploy from a branch"
4. Branch : `main`
5. Folder : `/ (root)`
6. Save

### **Étape 4 : Vérifier le Déploiement**
- Attendre 2-3 minutes
- Aller sur : `https://VOTRE_USERNAME.github.io/vitrine-av-uqam/`
- Tester l'application

### **Étape 5 : Mise à Jour (Optionnel)**
```bash
# Après modifications
git add .
git commit -m "Update VITRINE"
git push origin main
# Déploiement automatique
```

## 🎯 **URLs de Production**

### **GitHub Pages**
```
https://VOTRE_USERNAME.github.io/vitrine-av-uqam/
```

### **Alternative Netlify**
```
https://vitrine-av-uqam.netlify.app/
```

## 📋 **Checklist de Déploiement**

- [ ] Repository GitHub créé
- [ ] Fichiers poussés sur GitHub
- [ ] GitHub Pages activé
- [ ] URL accessible
- [ ] Application fonctionne
- [ ] Tests validés

## 🔧 **Dépannage**

### **Problème : Page 404**
- Vérifier que GitHub Pages est activé
- Attendre 5-10 minutes
- Vérifier le nom du repository

### **Problème : CSS ne se charge pas**
- Vérifier les chemins relatifs
- Tester en local d'abord
- Vérifier la console du navigateur

### **Problème : Images manquantes**
- Vérifier le dossier `images/`
- Vérifier les chemins dans le HTML
- Tester avec `test-simple.html`

## 🚀 **Script Automatique**

Utiliser le script PowerShell pour automatiser :

```powershell
# Dans le dossier VITRINE
.\deploy.ps1 -GitHubUsername "VOTRE_USERNAME" -RepositoryName "vitrine-av-uqam"
```

## 📊 **Statistiques de Déploiement**

- **Temps de déploiement** : 2-3 minutes
- **Taille totale** : ~2 MB
- **Fichiers** : 25 fichiers
- **HTTPS** : Automatique
- **CDN** : Global

## 🎉 **Félicitations !**

Votre application VITRINE est maintenant en ligne et accessible partout dans le monde !

---

**💡 Conseil** : Gardez une copie locale pour les tests et développements futurs. 