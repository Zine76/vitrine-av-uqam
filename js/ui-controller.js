/**
 * ========================================
 * VITRINE - CONTRÔLEUR D'INTERFACE
 * ========================================
 */

window.UIController = {
    /**
     * Éléments DOM cachés
     */
    _elements: {},

    /**
     * État de l'interface
     */
    _state: {
        currentView: 'room_selection',
        isLoading: false,
        roomConfirmed: false
    },

    /**
     * === INITIALISATION ===
     */

    /**
     * Initialiser le contrôleur UI
     */
    init() {
        Utils.log.info('Initialisation UIController');
        
        // Créer et injecter l'interface HTML
        this._createInterface();
        
        // Mettre en cache les éléments DOM
        this._cacheElements();
        
        // Configurer les événements
        this._setupEventListeners();
        
        // Initialiser l'état
        this._initializeState();
        
        Utils.log.info('UIController initialisé');
    },

    /**
     * === CRÉATION DE L'INTERFACE ===
     */

    /**
     * Créer l'interface HTML complète
     */
    _createInterface() {
        const container = document.querySelector('.app-content') || document.body;
        
        container.innerHTML = `
            <!-- Section sélection de salle -->
            <div id="roomSelectionSection" class="room-selector">
                <h2 class="room-selector-title">
                    📍 Dans quelle salle êtes-vous ?
                </h2>
                <div class="room-input-group">
                    <div class="room-input-wrapper">
                        <label class="room-input-label" for="roomInput">
                            Nom de la salle (ex: A-1750)
                        </label>
                        <input 
                            type="text" 
                            id="roomInput" 
                            class="room-input"
                            placeholder="A-1234"
                            maxlength="6"
                            autocomplete="off"
                        />
                    </div>
                    <button id="confirmRoomBtn" class="room-confirm-btn" disabled>
                        ✅ Confirmer
                    </button>
                </div>
                <div id="roomError" class="system-message error hidden">
                    Format invalide. Utilisez le format A-1234
                </div>
            </div>

            <!-- Section palettes de problèmes -->
            <div id="problemPalettesSection" class="hidden">
                <div id="currentRoomDisplay" class="system-message info">
                    📍 Salle actuelle : <strong id="currentRoomName">-</strong>
                    <button id="changeRoomBtn" class="banner-btn banner-btn-secondary" style="margin-left: 1rem; padding: 0.5rem 1rem;">
                        🔄 Changer
                    </button>
                </div>
                
                <div id="problemPalettes" class="problem-palettes">
                    <!-- Palettes générées dynamiquement -->
                </div>
            </div>

            <!-- Section formulaire de problème -->
            <div id="problemFormSection" class="problem-form hidden">
                <h2 class="problem-form-title">
                    📝 Décrivez votre problème
                </h2>
                <div class="problem-input-group">
                    <label class="problem-input-label" for="problemInput">
                        Que se passe-t-il exactement ?
                    </label>
                    <textarea 
                        id="problemInput" 
                        class="problem-input"
                        placeholder="Décrivez votre problème en détail... (ex: Le projecteur ne s'allume pas, pas de son dans les haut-parleurs, etc.)"
                        maxlength="1000"
                    ></textarea>
                    <div class="banner-help-text">
                        💡 Plus votre description est précise, plus nous pourrons vous aider efficacement.
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button id="cancelProblemBtn" class="banner-btn banner-btn-secondary" style="flex: 1;">
                        ← Retour
                    </button>
                    <button id="submitProblemBtn" class="problem-submit-btn" style="flex: 2;" disabled>
                        🚀 Envoyer le problème
                    </button>
                </div>
            </div>

            <!-- Messages système -->
            <div id="systemMessages" class="hidden">
                <!-- Messages dynamiques -->
            </div>

            <!-- Loading overlay -->
            <div id="loadingOverlay" class="banner-overlay hidden" style="background: rgba(0,0,0,0.5);">
                <div style="text-align: center; color: white;">
                    <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto 1rem;"></div>
                    <div id="loadingText" style="font-size: 1.2rem;">Traitement en cours...</div>
                </div>
            </div>
        `;
    },

    /**
     * Mettre en cache les éléments DOM
     */
    _cacheElements() {
        const ids = [
            'roomSelectionSection', 'roomInput', 'confirmRoomBtn', 'roomError',
            'problemPalettesSection', 'currentRoomDisplay', 'currentRoomName', 'changeRoomBtn',
            'problemPalettes', 'problemFormSection', 'problemInput', 'cancelProblemBtn',
            'submitProblemBtn', 'systemMessages', 'loadingOverlay', 'loadingText'
        ];

        ids.forEach(id => {
            this._elements[id] = document.getElementById(id);
        });

        Utils.log.debug('Éléments DOM mis en cache:', Object.keys(this._elements));
    },

    /**
     * === GESTION DES ÉVÉNEMENTS ===
     */

    /**
     * Configurer les écouteurs d'événements
     */
    _setupEventListeners() {
        // Saisie de salle
        this._elements.roomInput.addEventListener('input', (e) => {
            this._handleRoomInput(e.target.value);
        });

        this._elements.roomInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this._elements.confirmRoomBtn.disabled) {
                this._handleRoomConfirmation();
            }
        });

        // Confirmation de salle
        this._elements.confirmRoomBtn.addEventListener('click', () => {
            this._handleRoomConfirmation();
        });

        // Changement de salle
        this._elements.changeRoomBtn.addEventListener('click', () => {
            this._showRoomSelection();
        });

        // Formulaire de problème
        this._elements.problemInput.addEventListener('input', (e) => {
            this._handleProblemInput(e.target.value);
        });

        this._elements.cancelProblemBtn.addEventListener('click', () => {
            this._showProblemPalettes();
        });

        this._elements.submitProblemBtn.addEventListener('click', () => {
            this._handleProblemSubmission();
        });

        // Événements de changement de salle
        document.addEventListener('roomChanged', (event) => {
            this._handleRoomChanged(event.detail);
        });

        Utils.log.debug('Événements configurés');
    },

    /**
     * === GESTION DES VUES ===
     */

    /**
     * Afficher la sélection de salle
     */
    _showRoomSelection() {
        this._setState('room_selection');
        
        Utils.dom.show(this._elements.roomSelectionSection);
        Utils.dom.hide(this._elements.problemPalettesSection);
        Utils.dom.hide(this._elements.problemFormSection);
        
        // Focus sur l'input de salle
        this._elements.roomInput.focus();
    },

    /**
     * Afficher les palettes de problèmes
     */
    _showProblemPalettes() {
        this._setState('problem_palettes');
        
        Utils.dom.hide(this._elements.roomSelectionSection);
        Utils.dom.show(this._elements.problemPalettesSection);
        Utils.dom.hide(this._elements.problemFormSection);
        
        // Générer les palettes si pas encore fait
        this._generateProblemPalettes();
    },

    /**
     * Afficher le formulaire de problème
     */
    _showProblemForm() {
        this._setState('problem_form');
        
        Utils.dom.hide(this._elements.problemPalettesSection);
        Utils.dom.show(this._elements.problemFormSection);
        
        // Focus sur le textarea
        this._elements.problemInput.focus();
    },

    /**
     * === GESTION DES PALETTES ===
     */

    /**
     * Générer les palettes de problèmes
     */
    _generateProblemPalettes() {
        const palettes = getConfig('PROBLEM_PALETTES');
        
        this._elements.problemPalettes.innerHTML = palettes.map(palette => `
            <div class="problem-palette ${palette.id}" data-problem-type="${palette.id}">
                <div class="palette-icon">${palette.icon}</div>
                <div class="palette-title">${palette.title}</div>
                <div class="palette-description">${palette.description}</div>
            </div>
        `).join('');

        // Ajouter les événements de clic
        this._elements.problemPalettes.querySelectorAll('.problem-palette').forEach(palette => {
            palette.addEventListener('click', () => {
                const problemType = palette.dataset.problemType;
                this._handlePaletteClick(problemType);
            });
        });
    },

    /**
     * === GESTIONNAIRES D'ÉVÉNEMENTS ===
     */

    /**
     * Gérer la saisie de salle
     */
    _handleRoomInput(value) {
        const validation = RoomManager.validateRoomFormat(value);
        
        if (value.length === 0) {
            // Champ vide
            Utils.dom.setDisabled(this._elements.confirmRoomBtn, true);
            Utils.dom.hide(this._elements.roomError);
        } else if (validation.valid) {
            // Format valide
            Utils.dom.setDisabled(this._elements.confirmRoomBtn, false);
            Utils.dom.hide(this._elements.roomError);
            
            // Mettre en forme automatiquement
            if (value !== validation.normalized) {
                this._elements.roomInput.value = validation.normalized;
            }
        } else {
            // Format invalide
            Utils.dom.setDisabled(this._elements.confirmRoomBtn, true);
            Utils.dom.show(this._elements.roomError);
            this._elements.roomError.textContent = validation.error;
        }
    },

    /**
     * Gérer la confirmation de salle
     */
    async _handleRoomConfirmation() {
        const roomName = this._elements.roomInput.value.trim();
        
        if (!roomName) return;

        this._setLoading(true, 'Vérification de la salle...');

        try {
            await RoomManager.setCurrentRoom(roomName);
            
            // Succès - afficher les palettes
            this._setLoading(false);
            this._showProblemPalettes();
            
        } catch (error) {
            this._setLoading(false);
            this._showError(`Erreur: ${error.message}`);
            Utils.log.error('Erreur confirmation salle:', error);
        }
    },

    /**
     * Gérer le changement de salle
     */
    _handleRoomChanged(detail) {
        if (detail.newRoom) {
            this._elements.currentRoomName.textContent = detail.newRoom;
            this._state.roomConfirmed = true;
        } else {
            this._state.roomConfirmed = false;
        }
    },

    /**
     * Gérer le clic sur une palette
     */
    async _handlePaletteClick(problemType) {
        Utils.log.info(`Palette cliquée: ${problemType}`);
        
        // Obtenir la palette correspondante
        const palette = getConfig('PROBLEM_PALETTES').find(p => p.id === problemType);
        if (!palette) return;

        // Créer un message basé sur la palette
        const paletteMessage = palette.title;

        this._setLoading(true, 'Analyse du problème...');

        try {
            // Analyser le problème via EscalationEngine
            const result = await EscalationEngine.analyzeProblem(paletteMessage);
            
            this._setLoading(false);
            Utils.log.debug('Résultat analyse palette:', result);
            
            // Le résultat est géré par EscalationEngine (bannières, etc.)
            
        } catch (error) {
            this._setLoading(false);
            this._showError(`Erreur lors de l'analyse: ${error.message}`);
            Utils.log.error('Erreur analyse palette:', error);
        }
    },

    /**
     * Gérer la saisie du problème personnalisé
     */
    _handleProblemInput(value) {
        const isValid = Utils.validation.isValidProblem(value);
        Utils.dom.setDisabled(this._elements.submitProblemBtn, !isValid);
    },

    /**
     * Gérer la soumission du problème personnalisé
     */
    async _handleProblemSubmission() {
        const problemText = this._elements.problemInput.value.trim();
        
        if (!problemText || !Utils.validation.isValidProblem(problemText)) {
            this._showError('Veuillez décrire votre problème avec plus de détails');
            return;
        }

        this._setLoading(true, 'Analyse du problème...');

        try {
            // Analyser le problème via EscalationEngine
            const result = await EscalationEngine.analyzeProblem(problemText);
            
            this._setLoading(false);
            
            // Nettoyer le formulaire
            this._elements.problemInput.value = '';
            this._showProblemPalettes();
            
            Utils.log.debug('Résultat analyse problème:', result);
            
        } catch (error) {
            this._setLoading(false);
            this._showError(`Erreur lors de l'analyse: ${error.message}`);
            Utils.log.error('Erreur analyse problème:', error);
        }
    },

    /**
     * === GESTION DE L'ÉTAT ===
     */

    /**
     * Définir l'état actuel
     */
    _setState(newState) {
        const oldState = this._state.currentView;
        this._state.currentView = newState;
        
        Utils.log.debug(`État UI: ${oldState} → ${newState}`);
    },

    /**
     * Initialiser l'état selon la situation
     */
    _initializeState() {
        const currentRoom = RoomManager.getCurrentRoom();
        
        if (currentRoom) {
            // Salle déjà définie - aller aux palettes
            this._elements.currentRoomName.textContent = currentRoom;
            this._state.roomConfirmed = true;
            this._showProblemPalettes();
        } else {
            // Pas de salle - commencer par la sélection
            this._showRoomSelection();
        }
    },

    /**
     * === ÉTATS DE CHARGEMENT ET MESSAGES ===
     */

    /**
     * Définir l'état de chargement
     */
    _setLoading(isLoading, message = 'Chargement...') {
        this._state.isLoading = isLoading;
        
        if (isLoading) {
            this._elements.loadingText.textContent = message;
            Utils.dom.show(this._elements.loadingOverlay);
        } else {
            Utils.dom.hide(this._elements.loadingOverlay);
        }
    },

    /**
     * Afficher un message d'erreur
     */
    _showError(message) {
        this._showMessage(message, 'error');
    },

    /**
     * Afficher un message d'information
     */
    _showInfo(message) {
        this._showMessage(message, 'info');
    },

    /**
     * Afficher un message de succès
     */
    _showSuccess(message) {
        this._showMessage(message, 'success');
    },

    /**
     * Afficher un message système
     */
    _showMessage(message, type = 'info') {
        const messageElement = Utils.dom.createElement('div', {
            className: `system-message ${type} fade-in`
        }, message);

        // Nettoyer les anciens messages
        Utils.dom.removeAllChildren(this._elements.systemMessages);
        this._elements.systemMessages.appendChild(messageElement);
        
        Utils.dom.show(this._elements.systemMessages);

        // Auto-masquage après 5 secondes
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
                if (this._elements.systemMessages.children.length === 0) {
                    Utils.dom.hide(this._elements.systemMessages);
                }
            }
        }, 5000);
    },

    /**
     * === MÉTHODES PUBLIQUES ===
     */

    /**
     * Obtenir l'état actuel de l'interface
     */
    getState() {
        return {
            ...this._state,
            currentRoom: RoomManager.getCurrentRoom(),
            hasActiveBanners: BannerManager.getActiveBanners().length > 0,
            isEscalating: EscalationEngine.isEscalating()
        };
    },

    /**
     * Forcer le retour à l'accueil
     */
    goHome() {
        Utils.log.info('Retour forcé à l\'accueil');
        
        // Fermer toutes les bannières
        BannerManager.closeAll();
        
        // Réinitialiser les formulaires
        this._elements.roomInput.value = '';
        this._elements.problemInput.value = '';
        
        // Afficher la vue appropriée
        if (RoomManager.hasCurrentRoom()) {
            this._showProblemPalettes();
        } else {
            this._showRoomSelection();
        }
    },

    /**
     * Réinitialiser complètement l'interface
     */
    reset() {
        Utils.log.info('Réinitialisation complète UI');
        
        // Fermer bannières et loading
        BannerManager.closeAll();
        this._setLoading(false);
        
        // Nettoyer les formulaires
        this._elements.roomInput.value = '';
        this._elements.problemInput.value = '';
        Utils.dom.hide(this._elements.systemMessages);
        
        // Réinitialiser l'état
        this._state = {
            currentView: 'room_selection',
            isLoading: false,
            roomConfirmed: false
        };
        
        // Retourner à la sélection de salle
        this._showRoomSelection();
    },

    /**
     * Méthodes pour tests/debug
     */
    testPalette(problemType) {
        return this._handlePaletteClick(problemType);
    },

    testProblem(problemText) {
        this._elements.problemInput.value = problemText;
        return this._handleProblemSubmission();
    }
};

// Log d'initialisation
Utils.log.info('UIController chargé');