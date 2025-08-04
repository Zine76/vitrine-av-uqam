# 🎯 CONTEXT PROMPT - VITRINE ARCHITECTURE MODULAIRE

## 🏗️ **ARCHITECTURE OVERVIEW**

Vous travaillez sur **VITRINE**, une application d'assistance audiovisuelle modulaire (v4.0) qui remplace un monolithe de 6623 lignes par une architecture propre et maintenable.

### **STRUCTURE DOSSIERS**
```
Annexe/VITRINE/
├── index.html              # Point d'entrée
├── css/                    # Styles modulaires
│   ├── main.css           # Variables CSS + base
│   ├── banners.css        # Système bannières unifié  
│   └── components.css     # UI composants
├── js/                     # Modules JavaScript
│   ├── config.js          # Configuration centralisée
│   ├── utils.js           # Utilitaires communs
│   ├── api-client.js      # Client API unifié
│   ├── banner-manager.js  # Gestionnaire bannières
│   ├── ticket-manager.js  # Gestionnaire tickets
│   ├── room-manager.js    # Gestionnaire salles
│   ├── escalation-engine.js # Moteur escalade intelligent
│   ├── ui-controller.js   # Contrôleur interface
│   └── app.js            # Application principale
└── README.md              # Documentation technique
```

---

## 🎯 **PHILOSOPHIE ARCHITECTURE**

### **PRINCIPES DIRECTEURS**
- **Single Responsibility** : Chaque module a un rôle précis
- **DRY (Don't Repeat Yourself)** : Utilitaires réutilisables
- **Configuration centralisée** : Toutes constantes dans config.js
- **Error handling uniforme** : Try/catch + logging partout
- **État immutable** : Pas de modification directe des données

### **PATTERNS UTILISÉS**
- **Module Pattern** : Modules exposés via `window.ModuleName`
- **Observer Pattern** : Événements DOM pour communication inter-modules
- **Strategy Pattern** : EscalationEngine pour classification problèmes
- **Factory Pattern** : BannerManager pour création bannières
- **Cache Pattern** : RoomManager et TicketManager

---

## 🔧 **MODULES PRINCIPAUX**

### **1. CONFIG.JS - Configuration Centralisée**
```javascript
// Accès aux configurations
const baseUrl = getConfig('API.BASE_URL');
const bannerConfig = getConfig('BANNERS.SEA');
const timeout = getConfig('TIMEOUTS.ESCALATION_AUTO');

// CONTENUS PRINCIPAUX :
- API.ENDPOINTS : URLs backend
- TIMEOUTS : Délais et timeouts
- BANNER_TYPES : Types bannières disponibles
- BANNERS : Configuration chaque bannière  
- PROBLEM_TYPES : Classification problèmes
- CONTACTS : Numéros téléphone services
- VALIDATION : Patterns et règles
```

### **2. UTILS.JS - Utilitaires Communs**
```javascript
// Modules disponibles :
Utils.log.info('message', data)           // Logging unifié
Utils.storage.get('ROOM_CACHE', {})       // localStorage wrapper
Utils.validation.isValidRoom('A-1750')   // Validation données
Utils.dom.show(element)                   // Manipulation DOM
Utils.events.debounce(func, 300)          // Gestion événements
Utils.format.date(new Date())             // Formatage
Utils.async.wait(1000)                    // Promesses
Utils.clipboard.copy('text')              // Presse-papiers
```

### **3. API-CLIENT.JS - Communications Backend**
```javascript
// Méthodes principales :
await ApiClient.sendCopilotMessage(room, message)     // Chat Copilot
await ApiClient.createTicket(ticketData)              // Création ticket
await ApiClient.getRoomInfo(roomName)                 // Info salle Podio
await ApiClient.getRoomEquipment(roomName)            // Équipements NeonDB
await ApiClient.getCompleteRoomInfo(roomName)         // Stratégie Podio+NeonDB

// Features :
- Retry automatique avec backoff
- Timeout configurable  
- Gestion erreurs réseau
- Fallback Podio → NeonDB
```

### **4. BANNER-MANAGER.JS - Système Bannières Unifié**
```javascript
// API principale :
const bannerId = await BannerManager.show('sea', data)    // Afficher
await BannerManager.close(bannerId)                       // Fermer
await BannerManager.closeAllOfType('sea')                 // Fermer type
await BannerManager.closeAll()                            // Fermer toutes

// Types bannières :
- 'sea' : Escalade vers SEA
- 'existing_ticket' : Ticket déjà créé
- 'auto_result' : Action automatique réussie
- 'sim' : Service des Immeubles  
- 'si' : Services Informatiques
- 'confirmation' : Ticket créé avec succès

// Features :
- Auto-nettoyage bannières existantes
- Animations CSS fluides
- Gestion événements (clic overlay, propagation)
- Auto-fermeture configurable
```

### **5. TICKET-MANAGER.JS - Gestion Tickets**
```javascript
// API principale :
await TicketManager.createTicket(data)           // Créer ticket
TicketManager.hasExistingTicket(room)             // Vérifier existence
const ticket = TicketManager.getLastSessionTicket(room)  // Dernier ticket
const stats = TicketManager.getStats()           // Statistiques

// Features :
- Validation données complète
- Cache session avec expiration (24h)
- Nettoyage automatique tickets expirés
- Enrichissement avec infos Podio
- Gestion états loading
```

### **6. ROOM-MANAGER.JS - Gestion Salles**
```javascript
// API principale :
await RoomManager.setCurrentRoom('A-1750')       // Définir salle
const room = RoomManager.getCurrentRoom()        // Salle actuelle  
const info = await RoomManager.getRoomInfo(room) // Infos complètes
const equipment = await RoomManager.getRoomEquipment(room) // Équipements

// Features :
- Validation format salle (A-1234)
- Cache intelligent avec expiration (15min)
- Stratégie Podio → NeonDB fallback
- Événements roomChanged
- Nettoyage périodique cache
```

### **7. ESCALATION-ENGINE.JS - Intelligence Escalade**
```javascript
// API principale :
const result = await EscalationEngine.analyzeProblem(text, room)
EscalationEngine.startEscalationTimer('video', room)
EscalationEngine.clearEscalationTimer()

// Classification automatique :
- 'outOfScope' : Salutations, hors-sujet
- 'nonAudiovisual' : Chauffage, électricité → Bannière SIM
- 'network' : Wi-Fi, ordinateurs → Bannière SI  
- 'video' : Projecteurs, écrans → Diagnostic auto + escalade
- 'audio' : Micros, haut-parleurs → Diagnostic auto + escalade
- 'generic_technical' : Problèmes génériques → Escalade directe

// Features :
- Classification intelligente par mots-clés
- Timer escalade automatique (2s)
- Diagnostic automatique via Copilot
- Gestion états escalade
```

### **8. UI-CONTROLLER.JS - Interface Utilisateur**
```javascript
// États interface :
UIController.getState()                    // État actuel
UIController.goHome()                      // Retour accueil
UIController.reset()                       // Réinitialisation

// Vues disponibles :
- 'room_selection' : Saisie et confirmation salle
- 'problem_palettes' : Choix type problème  
- 'problem_form' : Formulaire problème personnalisé

// Features :
- Navigation fluide entre vues
- Validation temps réel
- États de chargement
- Messages système (erreur, succès, info)
- Génération dynamique palettes
```

### **9. APP.JS - Application Principale**
```javascript
// Contrôle application :
VitrineApp.getState()                      // État global
await VitrineApp.restart()                 // Redémarrage
VitrineApp.toggleDebug()                   // Mode debug

// Features :
- Initialisation ordonnée modules
- Gestion erreurs globales  
- Gestionnaires cycle de vie
- Raccourcis clavier (Esc, Ctrl+Home, Ctrl+R)
- Nettoyage périodique (5min)
- Export debug données
```

---

## 🔄 **FLUX FONCTIONNELS TYPIQUES**

### **FLUX 1 : Démarrage Application**
```
1. app.js → Vérification dépendances
2. app.js → Initialisation modules (RoomManager, TicketManager, UIController)
3. ui-controller.js → Création interface HTML
4. room-manager.js → Restauration dernière salle si existe
5. ui-controller.js → Affichage vue appropriée (sélection salle ou palettes)
```

### **FLUX 2 : Sélection Salle**
```
1. UI → Saisie utilisateur dans input salle
2. ui-controller.js → Validation format temps réel
3. UI → Clic bouton "Confirmer"
4. room-manager.js → setCurrentRoom('A-1750')
5. api-client.js → getCompleteRoomInfo() [Podio → NeonDB fallback]
6. room-manager.js → Mise en cache + événement roomChanged
7. ui-controller.js → Transition vers vue palettes
```

### **FLUX 3 : Rapport Problème via Palette**
```
1. UI → Clic palette "Problème Vidéo"
2. ui-controller.js → handlePaletteClick('video')
3. escalation-engine.js → analyzeProblem('Problème vidéo')
4. escalation-engine.js → _classifyProblem() → 'video'
5. escalation-engine.js → _handleVideo() → startEscalationTimer()
6. escalation-engine.js → _attemptAutomaticDiagnosis()
7A. Si diagnostic réussi → banner-manager.js → show('auto_result')
7B. Si diagnostic échoue → banner-manager.js → show('sea')
```

### **FLUX 4 : Création Ticket SEA**
```
1. banner-manager.js → Bannière SEA affichée
2. UI → Saisie description (optionnelle) + clic "Créer ticket"  
3. banner-manager.js → _handleSEATicketCreation()
4. ticket-manager.js → createTicket()
5. ticket-manager.js → Validation + vérification tickets existants
6. api-client.js → createTicket() vers backend
7. ticket-manager.js → Ajout cache session + sauvegarde localStorage
8. banner-manager.js → Fermeture bannière SEA + show('confirmation')
```

### **FLUX 5 : Gestion Tickets Existants**
```
1. ticket-manager.js → hasExistingTicket(room) vérifie cache
2. Si ticket existe → banner-manager.js → show('existing_ticket')
3. UI → Options : Fermer, Appeler SEA, Copier numéro
4. banner-manager.js → _handlePhoneCall() ou _handleCopyTicket()
```

---

## 🎨 **SYSTÈME CSS MODULAIRE**

### **VARIABLES CSS PRINCIPALES (main.css)**
```css
:root {
    --primary-blue: #3b82f6;
    --success-green: #10b981;
    --warning-orange: #f59e0b;
    --danger-red: #ef4444;
    
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    
    --transition-fast: 0.15s ease-in-out;
    --transition-normal: 0.3s ease-in-out;
}
```

### **CLASSES UTILITAIRES**
```css
.hidden { display: none !important; }
.visible { display: block !important; }
.fade-in { animation: fadeIn 0.3s ease-in-out; }
.loading { /* spinner + animation */ }
.disabled { opacity: 0.6; pointer-events: none; }
```

### **SYSTÈME BANNIÈRES (banners.css)**
```css
.banner-overlay     # Overlay plein écran avec blur
.banner-base        # Base commune toutes bannières
.banner-sea         # Bannière escalade SEA (bleu)
.banner-existing-ticket # Bannière ticket existant (orange)
.banner-auto-result # Bannière succès auto (vert)
.banner-sim         # Bannière SIM (violet)
.banner-si          # Bannière SI (cyan)
.banner-confirmation # Bannière confirmation (vert)
```

### **COMPOSANTS UI (components.css)**
```css
.problem-palettes   # Grille palettes problèmes
.problem-palette    # Palette individuelle avec hover
.room-selector      # Section sélection salle
.problem-form       # Formulaire problème personnalisé
.system-message     # Messages info/success/warning/error
```

---

## 🐛 **DEBUGGING ET MONITORING**

### **LOGGING UNIFORME**
```javascript
// Niveaux de log (config.js)
LOGGING: {
    LEVELS: { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 },
    CURRENT_LEVEL: 2  // INFO par défaut
}

// Usage dans modules
Utils.log.error('Erreur critique', errorObject)
Utils.log.warn('Attention', data)  
Utils.log.info('Information', data)
Utils.log.debug('Debug détaillé', data)
```

### **ÉTATS ET DIAGNOSTICS**
```javascript
// État global application
const globalState = VitrineApp.getState()
// → { ready, version, modules, ui, room, tickets, escalation, banners }

// États modules individuels  
const roomState = RoomManager.getState()
const uiState = UIController.getState()
const ticketStats = TicketManager.getStats()
const bannersActive = BannerManager.getActiveBanners()

// Mode debug
VitrineApp.toggleDebug()          // Active/désactive
VitrineApp.exportDebugData()      // Export JSON complet
```

### **GESTION ERREURS**
- **Erreurs globales** : window.addEventListener('error') dans app.js
- **Promesses rejetées** : window.addEventListener('unhandledrejection')
- **Erreurs modules** : try/catch avec logging Utils.log.error()
- **Fallbacks** : Dégradation gracieuse (Podio → NeonDB → Erreur)

---

## 📱 **RESPONSIVE ET ACCESSIBILITÉ**

### **BREAKPOINTS**
```css
@media (max-width: 768px) {
    .main-container { width: 95%; padding: 1rem; }
    .problem-palettes { grid-template-columns: 1fr; }
    .banner-actions { flex-direction: column; }
}
```

### **ACCESSIBILITÉ**
- **Labels** : Tous inputs ont des labels explicites
- **ARIA** : Roles et propriétés ARIA sur éléments interactifs  
- **Keyboard** : Navigation clavier complète (Tab, Esc, Enter)
- **Focus** : Indicateurs de focus visibles
- **Contraste** : Couleurs respectent WCAG 2.1

---

## 🔧 **DÉVELOPPEMENT ET MAINTENANCE**

### **AJOUT NOUVEAU TYPE BANNIÈRE**
```javascript
// 1. config.js → Ajouter type et configuration
BANNER_TYPES: { NEW_TYPE: 'new_type' }
BANNERS: { NEW_TYPE: { title: '...', icon: '...', actions: [...] } }

// 2. banner-manager.js → Ajouter méthode création
_createNewTypeBanner(bannerId, data, config) { /* ... */ }

// 3. banner-manager.js → Ajouter case dans _createBanner()
case getConfig('BANNER_TYPES.NEW_TYPE'):
    bannerElement = this._createNewTypeBanner(bannerId, data, config);
    break;

// 4. banners.css → Ajouter styles si nécessaire
.banner-new-type { background: linear-gradient(...); }
```

### **AJOUT NOUVELLE CLASSIFICATION PROBLÈME**
```javascript
// 1. config.js → Ajouter type et palette
PROBLEM_TYPES: { NEW_PROBLEM: 'new_problem' }
PROBLEM_PALETTES: [{ id: 'new_problem', title: '...', icon: '...', description: '...' }]

// 2. escalation-engine.js → Ajouter mots-clés classification
const categories = {
    newProblemCategory: ['keyword1', 'keyword2', ...]
};

// 3. escalation-engine.js → Ajouter gestionnaire
_handleNewProblemCategory(problemText, room) { /* Logique spécifique */ }

// 4. escalation-engine.js → Ajouter case dans _processProblemClassification()
```

### **MODIFICATION ENDPOINT API**
```javascript
// 1. config.js → Ajouter/modifier endpoint
API: {
    ENDPOINTS: {
        NEW_ENDPOINT: '/api/new/endpoint'
    }
}

// 2. api-client.js → Ajouter méthode
async callNewEndpoint(data) {
    return this.post(getConfig('API.ENDPOINTS.NEW_ENDPOINT'), data);
}

// 3. Module consommateur → Utiliser
const result = await ApiClient.callNewEndpoint(requestData);
```

### **TESTS ET VALIDATION**
```javascript
// Tests manuels via console
EscalationEngine.testClassification('Le projecteur ne marche pas');
UIController.testPalette('video');
UIController.testProblem('Problème audio dans la salle');

// Validation états
console.log('App State:', VitrineApp.getState());
console.log('Active Banners:', BannerManager.getActiveBanners());
console.log('Room Cache:', RoomManager.getCacheStats());
```

---

## 🚀 **DÉPLOIEMENT ET CONFIGURATION**

### **VARIABLES ENVIRONNEMENT**
```javascript
// config.js → Adapter selon environnement
API: {
    BASE_URL: window.location.origin.includes('localhost') 
        ? 'http://localhost:7070'           // Développement
        : window.location.origin           // Production
},
LOGGING: {
    CURRENT_LEVEL: process.env.NODE_ENV === 'production' ? 1 : 3  // WARN vs DEBUG
}
```

### **COMPATIBILITÉ BACKEND**
- ✅ **Endpoints existants** : Aucun changement requis
- ✅ **Formats JSON** : Structures identiques
- ✅ **Headers** : Content-Type, Accept standard

### **MIGRATION DEPUIS ANCIEN SYSTÈME**
1. **Backup** : `assistant-salle-av-copie.html` → `assistant-salle-av-copie.html.backup`
2. **Config serveur** : Pointer vers `VITRINE/index.html`
3. **Test** : Vérifier tous flux fonctionnels
4. **Rollback plan** : Restauration backup si problème

---

## 💡 **BONNES PRATIQUES DÉVELOPPEMENT**

### **CONVENTIONS NOMMAGE**
- **Modules** : PascalCase (BannerManager, TicketManager)
- **Fonctions publiques** : camelCase (getRoomInfo, createTicket)  
- **Fonctions privées** : _camelCase (_handleError, _validateData)
- **Constantes** : UPPER_SNAKE_CASE (BANNER_TYPES, API_ENDPOINTS)
- **CSS classes** : kebab-case (banner-overlay, problem-palette)

### **GESTION ÉTAT**
- **Immutabilité** : Ne jamais modifier directement les objets partagés
- **Cache expiration** : Toujours vérifier _isCacheExpired()
- **Nettoyage** : Utiliser cleanup() methods pour éviter fuites mémoire
- **Events** : Utiliser CustomEvents pour communication inter-modules

### **GESTION ERREURS**
- **Try/catch systématique** : Toutes fonctions async
- **Logging contextualisé** : Inclure données pertinentes
- **Fallbacks gracieux** : Jamais laisser l'utilisateur bloqué
- **Messages utilisateur** : Erreurs techniques → Messages compréhensibles

### **PERFORMANCE**
- **Debounce inputs** : Éviter requêtes multiples
- **Cache intelligent** : Réutiliser données valides
- **Lazy loading** : Charger modules selon besoin
- **Cleanup automatique** : Timers, événements, cache expiré

---

## 🎯 **OBJECTIFS ARCHITECTURE**

### **MAINTENABILITÉ** ✅
- Code modulaire avec responsabilités claires
- Configuration centralisée et documentation complète
- Patterns cohérents et conventions respectées

### **ROBUSTESSE** ✅  
- Gestion erreurs uniforme avec fallbacks
- Validation entrées utilisateur et API
- États cohérents et recovery automatique

### **EXTENSIBILITÉ** ✅
- Ajout facilité nouveaux types (bannières, problèmes, endpoints)
- Architecture découplée permettant évolutions
- Configuration driven vs hard-coded

### **PERFORMANCE** ✅
- Cache intelligent et nettoyage automatique
- Évite re-fetch données disponibles
- Animations CSS fluides et responsive

Cette architecture modulaire garantit un **code maintenable, robuste et évolutif** pour l'équipe de développement SAV Qonnect.