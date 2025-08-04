# 🧪 Guide de Test Complet VITRINE

## 🎯 **Objectif**
Tester **réellement** l'application VITRINE pour vérifier que le design et les fonctionnalités fonctionnent correctement.

## 📋 **Fichiers de Test Disponibles**

### **1. Test Simple (RECOMMANDÉ)**
- **Fichier** : `test-simple.html`
- **Usage** : Test immédiat de l'interface avec CSS et JavaScript minimal
- **Fonctionnalités** : Navigation, saisie salle, palettes problèmes, mode nuit
- **Lancement** : Double-clic sur le fichier ou `start test-simple.html`

### **2. Test des Bannières**
- **Fichier** : `test-banners.html`
- **Usage** : Test des bannières SEA, SI, SIM, tickets existants
- **Fonctionnalités** : Affichage exact des bannières comme dans les images
- **Lancement** : Double-clic sur le fichier

### **3. Test d'Intégration**
- **Fichier** : `test-integration.html`
- **Usage** : Test complet de tous les composants
- **Fonctionnalités** : Landing page, assistant, modales, thèmes
- **Lancement** : Double-clic sur le fichier

### **4. Application Complète**
- **Fichier** : `index.html`
- **Usage** : Application finale avec modules JavaScript
- **Fonctionnalités** : Toutes les fonctionnalités complètes
- **Lancement** : Double-clic sur le fichier (nécessite backend)

## 🚀 **Tests à Effectuer**

### **Test 1 : Interface de Base**
1. **Ouvrir** `test-simple.html`
2. **Vérifier** :
   - ✅ Logo VITRINE s'affiche
   - ✅ Header avec bouton mode nuit
   - ✅ Bannière de saisie de salle
   - ✅ Exemples de salles cliquables
   - ✅ CSS appliqué correctement

### **Test 2 : Navigation**
1. **Saisir** une salle (ex: A-1750)
2. **Cliquer** "Confirmer" ou appuyer Entrée
3. **Vérifier** :
   - ✅ Transition vers l'assistant
   - ✅ Header de salle affiché
   - ✅ 4 palettes de problèmes visibles
   - ✅ Bouton "Changer" fonctionne
   - ✅ Bouton "Accueil" fonctionne

### **Test 3 : Mode Nuit**
1. **Cliquer** sur le bouton "Mode nuit"
2. **Vérifier** :
   - ✅ Changement de thème
   - ✅ Icône change (lune → soleil)
   - ✅ Texte change ("Mode nuit" → "Mode jour")
   - ✅ Couleurs s'adaptent

### **Test 4 : Palettes de Problèmes**
1. **Cliquer** sur chaque palette :
   - 🔵 Problème Audio
   - 🟣 Problème Vidéo
   - 🟠 Problème Réseau
   - 🟢 Autres Problèmes
2. **Vérifier** :
   - ✅ Bannière de test s'affiche
   - ✅ Message et salle affichés
   - ✅ Bouton "Fermer" fonctionne
   - ✅ Clic sur overlay ferme la bannière

### **Test 5 : Bannières Spécialisées**
1. **Ouvrir** `test-banners.html`
2. **Tester** chaque bannière :
   - 🎫 Bannière SEA (Service Expert Audiovisuel)
   - 🎫 Ticket Existant
   - 💻 Bannière SI (Services Informatiques)
   - 🏢 Bannière SIM (Service des Immeubles)
3. **Vérifier** :
   - ✅ Design exact comme les images
   - ✅ Logos s'affichent correctement
   - ✅ Mode nuit fonctionne
   - ✅ Boutons d'action fonctionnent

### **Test 6 : Responsive Design**
1. **Redimensionner** la fenêtre du navigateur
2. **Vérifier** :
   - ✅ Interface s'adapte sur mobile
   - ✅ Palettes se réorganisent
   - ✅ Textes restent lisibles
   - ✅ Boutons restent accessibles

## 🔧 **Tests Techniques**

### **Test CSS**
```javascript
// Dans la console du navigateur
console.log('CSS chargé:', document.styleSheets.length, 'fichiers');
// Doit afficher 4 (Font Awesome + 3 CSS modulaires)
```

### **Test Images**
```javascript
// Vérifier que les images se chargent
const images = document.querySelectorAll('img');
images.forEach(img => {
    console.log(img.src, img.complete ? '✅' : '❌');
});
```

### **Test JavaScript**
```javascript
// Vérifier les fonctions
console.log('Fonctions disponibles:', {
    toggleTheme: typeof toggleTheme,
    confirmRoom: typeof confirmRoom,
    sendExampleMessage: typeof sendExampleMessage
});
```

## 🐛 **Dépannage**

### **Problème : CSS ne se charge pas**
- **Solution** : Vérifier les chemins dans les `<link>`
- **Test** : Ouvrir les outils de développement → Onglet Network

### **Problème : Images ne s'affichent pas**
- **Solution** : Vérifier le dossier `images/`
- **Test** : `ls "Annexe/VITRINE/images"`

### **Problème : JavaScript ne fonctionne pas**
- **Solution** : Vérifier la console pour les erreurs
- **Test** : F12 → Console

### **Problème : Interface sans style**
- **Solution** : Utiliser `test-simple.html` au lieu de `index.html`
- **Raison** : Les modules JS ne sont pas encore connectés au backend

## 📊 **Checklist de Validation**

### **Interface**
- [ ] Logo VITRINE visible
- [ ] Header avec mode nuit
- [ ] Bannière de saisie de salle
- [ ] Exemples de salles cliquables
- [ ] Navigation vers l'assistant
- [ ] 4 palettes de problèmes
- [ ] Boutons de navigation

### **Fonctionnalités**
- [ ] Saisie de salle
- [ ] Validation de salle
- [ ] Changement de salle
- [ ] Retour à l'accueil
- [ ] Mode nuit/jour
- [ ] Clic sur palettes
- [ ] Affichage bannières

### **Design**
- [ ] Couleurs cohérentes
- [ ] Typographie lisible
- [ ] Espacement correct
- [ ] Animations fluides
- [ ] Responsive design
- [ ] Mode nuit fonctionnel

### **Bannières**
- [ ] SEA avec logo
- [ ] SI avec logo
- [ ] SIM avec logo
- [ ] Ticket existant
- [ ] Overlay fonctionnel
- [ ] Boutons d'action

## 🎯 **Résultat Attendu**

Après tous ces tests, vous devriez avoir :
- ✅ Une interface VITRINE fonctionnelle et belle
- ✅ Une navigation fluide entre les pages
- ✅ Un mode nuit qui fonctionne
- ✅ Des bannières qui s'affichent correctement
- ✅ Un design responsive
- ✅ Une expérience utilisateur satisfaisante

## 🚀 **Prochaines Étapes**

Une fois les tests validés :
1. **Connecter** les modules JavaScript au backend
2. **Tester** avec le serveur Go (port 7070)
3. **Valider** les appels API
4. **Tester** les diagnostics réels
5. **Déployer** en production

---

**💡 Conseil** : Commencez toujours par `test-simple.html` pour vérifier que le design fonctionne, puis passez aux tests plus avancés. 