/**
 * ========================================
 * VITRINE - MOTEUR D'ESCALADE INTELLIGENT
 * ========================================
 */

window.EscalationEngine = {
    /**
     * Timer d'escalade automatique
     */
    _escalationTimer: null,

    /**
     * État de l'escalade
     */
    _isEscalating: false,

    /**
     * === MÉTHODES PRINCIPALES ===
     */

    /**
     * Analyser un problème et décider de l'action
     */
    async analyzeProblem(problemText, room = null) {
        const currentRoom = room || RoomManager.getCurrentRoom();
        
        if (!currentRoom) {
            throw new Error('Aucune salle définie pour l\'analyse');
        }

        Utils.log.info('Analyse problème', { 
            problem: Utils.format.truncate(problemText, 50), 
            room: currentRoom 
        });

        try {
            // 1. Vérifier tickets existants
            if (TicketManager.hasExistingTicket(currentRoom)) {
                Utils.log.info('Ticket existant détecté → Bannière ticket existant');
                const existingTicket = TicketManager.getLastSessionTicket(currentRoom);
                await BannerManager.show(getConfig('BANNER_TYPES.EXISTING_TICKET'), existingTicket);
                return { action: 'existing_ticket', ticket: existingTicket };
            }

            // 2. Classifier le type de problème
            const problemClassification = this._classifyProblem(problemText);
            Utils.log.debug('Classification problème:', problemClassification);

            // 3. Traiter selon la classification
            return await this._processProblemClassification(problemClassification, problemText, currentRoom);

        } catch (error) {
            Utils.log.error('Erreur analyse problème:', error);
            throw error;
        }
    },

    /**
     * Démarrer le timer d'escalade automatique
     */
    startEscalationTimer(problemType, room) {
        // Annuler le timer précédent si existant
        this.clearEscalationTimer();

        Utils.log.info(`Démarrage timer escalade ${problemType} pour ${room}`);

        this._escalationTimer = setTimeout(async () => {
            Utils.log.info(`⏰ Timeout escalade atteint pour ${problemType}`);
            
            // Vérifier encore les tickets existants
            if (TicketManager.hasExistingTicket(room)) {
                const existingTicket = TicketManager.getLastSessionTicket(room);
                await BannerManager.show(getConfig('BANNER_TYPES.EXISTING_TICKET'), existingTicket);
            } else {
                // Escalade automatique
                await this._forceEscalation(problemType, room);
            }
        }, getConfig('TIMEOUTS.ESCALATION_AUTO'));
    },

    /**
     * Annuler le timer d'escalade
     */
    clearEscalationTimer() {
        if (this._escalationTimer) {
            clearTimeout(this._escalationTimer);
            this._escalationTimer = null;
            Utils.log.debug('Timer escalade annulé');
        }
    },

    /**
     * === CLASSIFICATION DES PROBLÈMES ===
     */

    /**
     * Classifier un problème selon son type et sa catégorie
     */
    _classifyProblem(problemText) {
        const lowerText = problemText.toLowerCase();
        
        // Mots-clés pour les différentes catégories
        const categories = {
            // Problèmes hors scope
            outOfScope: [
                'bonjour', 'salut', 'hello', 'merci', 'au revoir',
                'comment ça va', 'test', 'essai', 'bonsoir', 'bonne nuit'
            ],
            
            // Problèmes non-audiovisuels (SIM)
            nonAudiovisual: [
                'chauffage', 'climatisation', 'température', 'froid', 'chaud',
                'électricité', 'prise', 'interrupteur', 'lumière', 'éclairage',
                'plomberie', 'eau', 'toilette', 'lavabo', 'fuite',
                'fenêtre', 'porte', 'serrure', 'clé', 'mobilier',
                'table', 'chaise', 'bureau', 'armoire'
            ],
            
            // Problèmes réseau/informatiques (SI)
            network: [
                'réseau', 'wifi', 'internet', 'connexion', 'access',
                'ordinateur', 'pc', 'laptop', 'clavier', 'souris',
                'imprimante', 'scanner', 'login', 'mot de passe',
                'session', 'compte', 'email', 'courriel'
            ],
            
            // Problèmes vidéo (AV - vidéo)
            video: [
                'projecteur', 'écran', 'moniteur', 'affichage', 'image',
                'vidéo', 'visual', 'projection', 'display', 'tv'
            ],
            
            // Problèmes audio (AV - audio)
            audio: [
                'micro', 'microphone', 'son', 'audio', 'haut-parleur',
                'speaker', 'volume', 'sound', 'acoustique', 'casque'
            ]
        };

        // Détecter la catégorie
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                return {
                    category,
                    confidence: this._calculateConfidence(lowerText, keywords),
                    detectedKeywords: keywords.filter(k => lowerText.includes(k))
                };
            }
        }

        // Détection par défaut si pas de mots-clés spécifiques
        if (this._hasGenericProblemIndicators(lowerText)) {
            return {
                category: 'generic_technical',
                confidence: 0.6,
                detectedKeywords: []
            };
        }

        return {
            category: 'outOfScope',
            confidence: 0.9,
            detectedKeywords: []
        };
    },

    /**
     * Calculer la confiance de classification
     */
    _calculateConfidence(text, keywords) {
        const matchCount = keywords.filter(k => text.includes(k)).length;
        const textLength = text.split(' ').length;
        
        // Plus de mots-clés = plus de confiance
        let confidence = Math.min(0.9, 0.4 + (matchCount * 0.2));
        
        // Texte plus long = légèrement plus de confiance
        if (textLength > 10) confidence += 0.1;
        
        return Math.min(0.95, confidence);
    },

    /**
     * Détecter des indicateurs génériques de problème
     */
    _hasGenericProblemIndicators(text) {
        const problemIndicators = [
            'problème', 'panne', 'ne fonctionne pas', 'ne marche pas',
            'défaillant', 'en panne', 'cassé', 'ne s\'allume pas',
            'ne répond pas', 'dysfonctionnement', 'bloqué', 'erreur',
            'bug', 'défaut', 'anomalie'
        ];
        
        return problemIndicators.some(indicator => text.includes(indicator));
    },

    /**
     * === TRAITEMENT DES CLASSIFICATIONS ===
     */

    /**
     * Traiter une classification de problème
     */
    async _processProblemClassification(classification, problemText, room) {
        Utils.log.debug('Traitement classification:', classification);

        switch (classification.category) {
            case 'outOfScope':
                return await this._handleOutOfScope(problemText);
                
            case 'nonAudiovisual':
                return await this._handleNonAudiovisual(problemText);
                
            case 'network':
                return await this._handleNetwork(problemText);
                
            case 'video':
                return await this._handleVideo(problemText, room);
                
            case 'audio':
                return await this._handleAudio(problemText, room);
                
            case 'generic_technical':
                return await this._handleGenericTechnical(problemText, room);
                
            default:
                return await this._handleUnknown(problemText, room);
        }
    },

    /**
     * Gérer les demandes hors scope
     */
    async _handleOutOfScope(problemText) {
        Utils.log.info('Problème hors scope détecté');
        
        // Réponse polie pour les salutations/questions hors sujet
        if (problemText.toLowerCase().includes('bonjour') || 
            problemText.toLowerCase().includes('salut') ||
            problemText.toLowerCase().includes('hello')) {
            return {
                action: 'greeting',
                message: '👋 Bonjour ! Comment puis-je vous aider avec vos équipements audiovisuels ?'
            };
        }
        
        return {
            action: 'out_of_scope',
            message: '🤖 Je suis votre assistant audiovisuel. Je ne peux pas répondre à cette question.'
        };
    },

    /**
     * Gérer les problèmes non-audiovisuels (SIM)
     */
    async _handleNonAudiovisual(problemText) {
        Utils.log.info('Problème non-audiovisuel → Bannière SIM');
        
        await BannerManager.show(getConfig('BANNER_TYPES.SIM'), {
            message: problemText
        });
        
        return {
            action: 'banner_sim',
            service: 'SIM'
        };
    },

    /**
     * Gérer les problèmes réseau (SI)
     */
    async _handleNetwork(problemText) {
        Utils.log.info('Problème réseau → Bannière SI');
        
        await BannerManager.show(getConfig('BANNER_TYPES.SI'), {
            message: problemText
        });
        
        return {
            action: 'banner_si',
            service: 'SI'
        };
    },

    /**
     * Gérer les problèmes vidéo
     */
    async _handleVideo(problemText, room) {
        Utils.log.info('Problème vidéo détecté');
        
        // Démarrer le timer d'escalade
        this.startEscalationTimer('video', room);
        
        try {
            // Tenter le diagnostic automatique via le Copilot
            const result = await this._attemptAutomaticDiagnosis(problemText, room, 'video');
            
            if (result.auto_executed) {
                // Action automatique réussie
                this.clearEscalationTimer();
                await BannerManager.show(getConfig('BANNER_TYPES.AUTO_RESULT'), {
                    message: result.auto_result
                });
                
                return {
                    action: 'auto_correction',
                    result: result.auto_result
                };
            } else {
                // Pas de correction automatique → Escalade
                this.clearEscalationTimer();
                return await this._escalateToSEA('video', room, problemText);
            }
            
        } catch (error) {
            Utils.log.warn('Échec diagnostic automatique:', error);
            this.clearEscalationTimer();
            return await this._escalateToSEA('video', room, problemText);
        }
    },

    /**
     * Gérer les problèmes audio
     */
    async _handleAudio(problemText, room) {
        Utils.log.info('Problème audio détecté');
        
        // Démarrer le timer d'escalade
        this.startEscalationTimer('audio', room);
        
        try {
            // Tenter le diagnostic automatique via le Copilot
            const result = await this._attemptAutomaticDiagnosis(problemText, room, 'audio');
            
            if (result.auto_executed) {
                // Action automatique réussie
                this.clearEscalationTimer();
                await BannerManager.show(getConfig('BANNER_TYPES.AUTO_RESULT'), {
                    message: result.auto_result
                });
                
                return {
                    action: 'auto_correction',
                    result: result.auto_result
                };
            } else {
                // Pas de correction automatique → Escalade
                this.clearEscalationTimer();
                return await this._escalateToSEA('audio', room, problemText);
            }
            
        } catch (error) {
            Utils.log.warn('Échec diagnostic automatique:', error);
            this.clearEscalationTimer();
            return await this._escalateToSEA('audio', room, problemText);
        }
    },

    /**
     * Gérer les problèmes techniques génériques
     */
    async _handleGenericTechnical(problemText, room) {
        Utils.log.info('Problème technique générique');
        
        // Pour les problèmes génériques, escalader directement
        return await this._escalateToSEA('technical', room, problemText);
    },

    /**
     * Gérer les problèmes non classifiés
     */
    async _handleUnknown(problemText, room) {
        Utils.log.info('Problème non classifié → Escalade par défaut');
        
        return await this._escalateToSEA('unknown', room, problemText);
    },

    /**
     * === DIAGNOSTIC AUTOMATIQUE ===
     */

    /**
     * Tenter un diagnostic automatique via l'API Copilot
     */
    async _attemptAutomaticDiagnosis(problemText, room, problemType) {
        Utils.log.info('Tentative diagnostic automatique', { problemType, room });
        
        try {
            // Appel API copilot pour diagnostic
            const response = await ApiClient.sendCopilotMessage(room, problemText, {
                expectAutoFix: true,
                problemType: problemType,
                timeout: 15000 // 15 secondes max pour le diagnostic
            });
            
            Utils.log.debug('Réponse diagnostic:', response);
            
            // Vérifier si une action automatique a été exécutée
            if (response && response.auto_executed === true) {
                Utils.log.info('✅ Correction automatique réussie:', response.auto_result);
                return response;
            } else {
                Utils.log.info('❌ Aucune correction automatique disponible');
                return { auto_executed: false, response };
            }
            
        } catch (error) {
            Utils.log.error('Erreur diagnostic automatique:', error);
            
            // Si timeout ou erreur réseau, considérer comme échec du diagnostic
            if (error.message.includes('timeout') || error.message.includes('network')) {
                throw new Error('Diagnostic automatique indisponible');
            }
            
            // Autres erreurs = pas de diagnostic possible
            return { auto_executed: false, error: error.message };
        }
    },

    /**
     * === ESCALADE ===
     */

    /**
     * Escalader vers le SEA
     */
    async _escalateToSEA(problemType, room, problemText) {
        Utils.log.info(`Escalade SEA pour problème ${problemType}`, { room });
        
        if (this._isEscalating) {
            Utils.log.warn('Escalade déjà en cours');
            return { action: 'escalation_in_progress' };
        }

        this._isEscalating = true;

        try {
            // Préparer les données d'escalade
            const escalationData = {
                room: room,
                problemType: problemType,
                originalMessage: problemText,
                escalation_reason: `Problème ${problemType} signalé - Intervention technique requise`,
                confidence: 0.9,
                intent: `${problemType}_problem`,
                escalation_needed: true
            };

            // Afficher la bannière SEA
            await BannerManager.show(getConfig('BANNER_TYPES.SEA'), escalationData);

            return {
                action: 'escalation_sea',
                data: escalationData
            };

        } finally {
            this._isEscalating = false;
        }
    },

    /**
     * Escalade forcée par timeout
     */
    async _forceEscalation(problemType, room) {
        Utils.log.info(`Escalade forcée par timeout: ${problemType}`);
        
        return await this._escalateToSEA(problemType, room, `Problème ${problemType} - Aucune correction automatique trouvée`);
    },

    /**
     * === MÉTHODES UTILITAIRES ===
     */

    /**
     * Vérifier l'état d'escalade
     */
    isEscalating() {
        return this._isEscalating;
    },

    /**
     * Vérifier si un timer est actif
     */
    hasActiveTimer() {
        return this._escalationTimer !== null;
    },

    /**
     * Obtenir l'état actuel du moteur
     */
    getState() {
        return {
            isEscalating: this._isEscalating,
            hasActiveTimer: this.hasActiveTimer(),
            timerActive: this._escalationTimer !== null
        };
    },

    /**
     * Réinitialiser le moteur
     */
    reset() {
        Utils.log.info('Réinitialisation EscalationEngine');
        
        this.clearEscalationTimer();
        this._isEscalating = false;
        
        Utils.log.info('EscalationEngine réinitialisé');
    },

    /**
     * === MÉTHODES DE TEST (DEBUG) ===
     */

    /**
     * Tester la classification d'un problème
     */
    testClassification(problemText) {
        const classification = this._classifyProblem(problemText);
        
        return {
            input: problemText,
            classification: classification,
            expectedAction: this._getExpectedAction(classification.category)
        };
    },

    /**
     * Obtenir l'action attendue pour une catégorie
     */
    _getExpectedAction(category) {
        const actions = {
            'outOfScope': 'Réponse polie ou message hors scope',
            'nonAudiovisual': 'Bannière SIM (Service des Immeubles)',
            'network': 'Bannière SI (Services Informatiques)',
            'video': 'Diagnostic automatique puis escalade si échec',
            'audio': 'Diagnostic automatique puis escalade si échec',
            'generic_technical': 'Escalade directe SEA',
            'unknown': 'Escalade par défaut SEA'
        };
        
        return actions[category] || 'Action inconnue';
    }
};

// Log d'initialisation
Utils.log.info('EscalationEngine chargé');