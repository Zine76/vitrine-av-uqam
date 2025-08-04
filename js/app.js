/**
 * ========================================
 * VITRINE - APPLICATION PRINCIPALE
 * ========================================
 */

window.VitrineApp = {
    /**
     * État de l'application
     */
    _initialized: false,
    _modules: {},

    /**
     * === INITIALISATION ===
     */

    /**
     * Initialiser l'application complète
     */
    async init() {
        if (this._initialized) {
            Utils.log.warn('Application déjà initialisée');
            return;
        }

        Utils.log.info('🚀 Démarrage de l\'application Vitrine');

        try {
            // 1. Vérifier les dépendances
            this._checkDependencies();

            // 2. Initialiser les modules dans l'ordre
            await this._initializeModules();

            // 3. Configurer les gestionnaires globaux
            this._setupGlobalHandlers();

            // 4. Finaliser l'initialisation
            this._finalizeBoot();

            this._initialized = true;
            Utils.log.info('✅ Application Vitrine initialisée avec succès');

        } catch (error) {
            Utils.log.error('❌ Erreur critique lors de l\'initialisation:', error);
            this._handleBootError(error);
        }
    },

    /**
     * Vérifier que tous les modules requis sont disponibles
     */
    _checkDependencies() {
        const requiredModules = [
            'VitrineUtils', 'ApiClient', 'BannerManager', 
            'TicketManager', 'RoomManager', 'EscalationEngine', 'UIController'
        ];

        const missing = requiredModules.filter(module => !window[module]);
        
        if (missing.length > 0) {
            throw new Error(`Modules manquants: ${missing.join(', ')}`);
        }

        Utils.log.debug('✅ Toutes les dépendances sont présentes');
    },

    /**
     * Initialiser tous les modules
     */
    async _initializeModules() {
        Utils.log.info('Initialisation des modules...');

        // Ordre d'initialisation important
        const initOrder = [
            { name: 'RoomManager', instance: window.RoomManager },
            { name: 'TicketManager', instance: window.TicketManager },
            { name: 'UIController', instance: window.UIController }
        ];

        for (const module of initOrder) {
            try {
                Utils.log.debug(`Initialisation ${module.name}...`);
                
                if (module.instance && typeof module.instance.init === 'function') {
                    await module.instance.init();
                }
                
                this._modules[module.name] = module.instance;
                Utils.log.debug(`✅ ${module.name} initialisé`);
                
            } catch (error) {
                Utils.log.error(`❌ Erreur initialisation ${module.name}:`, error);
                throw new Error(`Échec initialisation ${module.name}: ${error.message}`);
            }
        }

        // Modules sans init explicite
        this._modules.ApiClient = window.ApiClient;
        this._modules.BannerManager = window.BannerManager;
        this._modules.EscalationEngine = window.EscalationEngine;
    },

    /**
     * Configurer les gestionnaires globaux
     */
    _setupGlobalHandlers() {
        // Gestion des erreurs globales
        window.addEventListener('error', this._handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this._handleUnhandledPromise.bind(this));

        // Gestion de la visibilité de la page
        document.addEventListener('visibilitychange', this._handleVisibilityChange.bind(this));

        // Gestion de la fermeture/rechargement
        window.addEventListener('beforeunload', this._handleBeforeUnload.bind(this));

        // Raccourcis clavier
        document.addEventListener('keydown', this._handleKeyboardShortcuts.bind(this));

        // Nettoyage périodique
        this._setupPeriodicCleanup();

        Utils.log.debug('Gestionnaires globaux configurés');
    },

    /**
     * Finaliser le démarrage
     */
    _finalizeBoot() {
        // Marquer l'app comme prête
        document.body.setAttribute('data-vitrine-ready', 'true');
        
        // Déclencher l'événement global
        const event = new CustomEvent('vitrineReady', {
            detail: {
                version: this.getVersion(),
                modules: Object.keys(this._modules),
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);

        // Afficher les informations de debug si demandé
        if (this._isDebugMode()) {
            this._showDebugInfo();
        }
    },

    /**
     * === GESTION DES ERREURS ===
     */

    /**
     * Gérer les erreurs de démarrage
     */
    _handleBootError(error) {
        Utils.log.error('ERREUR CRITIQUE DÉMARRAGE:', error);
        
        // Afficher un message d'erreur à l'utilisateur
        document.body.innerHTML = `
            <div style="
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: #fee; border: 2px solid #f87171; border-radius: 8px;
                padding: 2rem; text-align: center; font-family: sans-serif;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            ">
                <h2 style="color: #dc2626; margin-bottom: 1rem;">
                    ❌ Erreur de chargement
                </h2>
                <p style="margin-bottom: 1rem; color: #666;">
                    L'application Vitrine n'a pas pu démarrer correctement.
                </p>
                <p style="font-size: 0.9rem; color: #888;">
                    ${error.message}
                </p>
                <button 
                    onclick="location.reload()" 
                    style="
                        margin-top: 1rem; padding: 0.5rem 1rem; 
                        background: #3b82f6; color: white; border: none; 
                        border-radius: 4px; cursor: pointer;
                    "
                >
                    🔄 Recharger la page
                </button>
            </div>
        `;
    },

    /**
     * Gérer les erreurs JavaScript globales
     */
    _handleGlobalError(event) {
        Utils.log.error('Erreur JavaScript globale:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });

        // Ne pas interrompre l'exécution pour les erreurs non critiques
        return false;
    },

    /**
     * Gérer les promesses rejetées
     */
    _handleUnhandledPromise(event) {
        Utils.log.error('Promise rejetée non gérée:', event.reason);
        
        // Éviter l'affichage dans la console du navigateur
        event.preventDefault();
    },

    /**
     * === GESTIONNAIRES D'ÉVÉNEMENTS ===
     */

    /**
     * Gérer les changements de visibilité
     */
    _handleVisibilityChange() {
        if (document.hidden) {
            Utils.log.debug('Page cachée - pause des activités');
            this._pauseActivities();
        } else {
            Utils.log.debug('Page visible - reprise des activités');
            this._resumeActivities();
        }
    },

    /**
     * Gérer la fermeture de la page
     */
    _handleBeforeUnload(event) {
        // Sauvegarder les données importantes
        try {
            if (this._modules.TicketManager) {
                this._modules.TicketManager._saveSessionTickets();
            }
            if (this._modules.RoomManager) {
                this._modules.RoomManager._saveRoomCache();
            }
        } catch (error) {
            Utils.log.warn('Erreur sauvegarde avant fermeture:', error);
        }

        // Pas de message de confirmation par défaut
        return null;
    },

    /**
     * Gérer les raccourcis clavier
     */
    _handleKeyboardShortcuts(event) {
        // Échap : fermer toutes les bannières
        if (event.key === 'Escape') {
            if (this._modules.BannerManager) {
                this._modules.BannerManager.closeAll();
            }
        }

        // Ctrl+Home : retour à l'accueil
        if (event.ctrlKey && event.key === 'Home') {
            event.preventDefault();
            if (this._modules.UIController) {
                this._modules.UIController.goHome();
            }
        }

        // Ctrl+R : rafraîchir la salle actuelle
        if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            if (this._modules.RoomManager) {
                this._modules.RoomManager.refreshRoom().catch(err => {
                    Utils.log.warn('Erreur rafraîchissement salle:', err);
                });
            }
        }
    },

    /**
     * === GESTION DU CYCLE DE VIE ===
     */

    /**
     * Mettre en pause les activités
     */
    _pauseActivities() {
        // Annuler les timers d'escalade
        if (this._modules.EscalationEngine) {
            this._modules.EscalationEngine.clearEscalationTimer();
        }
    },

    /**
     * Reprendre les activités
     */
    _resumeActivities() {
        // Nettoyer les bannières expirées
        if (this._modules.BannerManager) {
            this._modules.BannerManager.cleanupExpired();
        }
        
        // Nettoyer le cache des salles
        if (this._modules.RoomManager) {
            this._modules.RoomManager.cleanupCache();
        }
    },

    /**
     * Configurer le nettoyage périodique
     */
    _setupPeriodicCleanup() {
        // Nettoyage toutes les 5 minutes
        setInterval(() => {
            try {
                if (this._modules.BannerManager) {
                    this._modules.BannerManager.cleanupExpired();
                }
                if (this._modules.RoomManager) {
                    this._modules.RoomManager.cleanupCache();
                }
                if (this._modules.TicketManager) {
                    this._modules.TicketManager._cleanupExpiredTickets();
                }
                
                Utils.log.debug('Nettoyage périodique effectué');
            } catch (error) {
                Utils.log.warn('Erreur nettoyage périodique:', error);
            }
        }, 5 * 60 * 1000);
    },

    /**
     * === MÉTHODES PUBLIQUES ===
     */

    /**
     * Obtenir la version de l'application
     */
    getVersion() {
        return '4.0.0-alpha';
    },

    /**
     * Vérifier si l'application est prête
     */
    isReady() {
        return this._initialized;
    },

    /**
     * Obtenir l'état global de l'application
     */
    getState() {
        if (!this._initialized) {
            return { ready: false, error: 'Non initialisé' };
        }

        return {
            ready: true,
            version: this.getVersion(),
            modules: Object.keys(this._modules),
            ui: this._modules.UIController?.getState(),
            room: this._modules.RoomManager?.getState(),
            tickets: this._modules.TicketManager?.getStats(),
            escalation: this._modules.EscalationEngine?.getState(),
            banners: this._modules.BannerManager?.getActiveBanners() || []
        };
    },

    /**
     * Redémarrer l'application
     */
    async restart() {
        Utils.log.info('🔄 Redémarrage de l\'application');

        try {
            // Réinitialiser tous les modules
            Object.values(this._modules).forEach(module => {
                if (module && typeof module.reset === 'function') {
                    module.reset();
                }
            });

            // Marquer comme non initialisé
            this._initialized = false;
            this._modules = {};

            // Réinitialiser
            await this.init();

        } catch (error) {
            Utils.log.error('Erreur redémarrage:', error);
            throw error;
        }
    },

    /**
     * === MÉTHODES DE DEBUG ===
     */

    /**
     * Vérifier si le mode debug est actif
     */
    _isDebugMode() {
        return new URLSearchParams(window.location.search).has('debug') ||
               localStorage.getItem('vitrine_debug') === 'true';
    },

    /**
     * Afficher les informations de debug
     */
    _showDebugInfo() {
        const state = this.getState();
        
        console.group('🔍 Vitrine Debug Info');
        console.log('Version:', state.version);
        console.log('Modules:', state.modules);
        console.log('État UI:', state.ui);
        console.log('État Room:', state.room);
        console.log('Tickets:', state.tickets);
        console.log('Bannières actives:', state.banners.length);
        console.groupEnd();
    },

    /**
     * Activer/désactiver le mode debug
     */
    toggleDebug() {
        const isDebug = this._isDebugMode();
        localStorage.setItem('vitrine_debug', (!isDebug).toString());
        
        Utils.log.info(`Mode debug ${!isDebug ? 'activé' : 'désactivé'}`);
        
        if (!isDebug) {
            this._showDebugInfo();
        }
    },

    /**
     * Exporter toutes les données pour debug
     */
    exportDebugData() {
        const data = {
            app: this.getState(),
            storage: {
                roomCache: Utils.storage.get('ROOM_CACHE', {}),
                sessionTickets: Utils.storage.get('SESSION_TICKETS', {}),
                userPrefs: Utils.storage.get('USER_PREFERENCES', {}),
                lastRoom: Utils.storage.get('LAST_ROOM', null)
            },
            config: window.VITRINE_CONFIG,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `vitrine-debug-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        Utils.log.info('Données de debug exportées');
    }
};

/**
 * === AUTO-DÉMARRAGE ===
 */

// Démarrer l'application quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        VitrineApp.init().catch(error => {
            console.error('Erreur démarrage application:', error);
        });
    });
} else {
    // DOM déjà prêt
    VitrineApp.init().catch(error => {
        console.error('Erreur démarrage application:', error);
    });
}

// Export global pour accès depuis la console
window.App = window.VitrineApp;

// Log de chargement
Utils.log.info('Application Vitrine chargée, démarrage en cours...');