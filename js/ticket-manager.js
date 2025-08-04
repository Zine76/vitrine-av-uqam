/**
 * ========================================
 * VITRINE - GESTIONNAIRE DE TICKETS
 * ========================================
 */

window.TicketManager = {
    /**
     * Tickets de session en cours
     */
    _sessionTickets: new Map(),

    /**
     * État de chargement
     */
    _isLoading: false,

    /**
     * === INITIALISATION ===
     */

    /**
     * Initialiser le gestionnaire
     */
    init() {
        Utils.log.info('Initialisation TicketManager');
        
        // Charger les tickets de session depuis le localStorage
        this._loadSessionTickets();
        
        // Nettoyer les tickets expirés
        this._cleanupExpiredTickets();
        
        Utils.log.info(`TicketManager initialisé avec ${this._sessionTickets.size} ticket(s)`);
    },

    /**
     * === GESTION DES TICKETS ===
     */

    /**
     * Créer un nouveau ticket
     */
    async createTicket(ticketData) {
        if (this._isLoading) {
            throw new Error('Une création de ticket est déjà en cours');
        }

        Utils.log.info('Création nouveau ticket', ticketData);
        this._isLoading = true;

        try {
            // 1. Valider les données
            const validatedData = this._validateTicketData(ticketData);
            
            // 2. Vérifier les tickets existants
            const currentRoom = window.RoomManager?.getCurrentRoom();
            if (currentRoom && this.hasExistingTicket(currentRoom)) {
                const existingTicket = this.getLastSessionTicket(currentRoom);
                Utils.log.warn('Ticket déjà existant pour cette salle', existingTicket);
                
                // Afficher bannière ticket existant
                await BannerManager.show(getConfig('BANNER_TYPES.EXISTING_TICKET'), existingTicket);
                return existingTicket;
            }

            // 3. Préparer les données complètes
            const completeTicketData = await this._prepareTicketData(validatedData);

            // 4. Appel API pour création
            const response = await ApiClient.createTicket(completeTicketData);

            // 5. Traiter la réponse
            if (response.success && response.ticket) {
                const ticket = this._processTicketResponse(response.ticket);
                
                // 6. Sauvegarder en session
                this._addToSession(ticket);
                
                // 7. Afficher confirmation
                await BannerManager.show(getConfig('BANNER_TYPES.CONFIRMATION'), {
                    ticketNumber: ticket.number,
                    room: ticket.room
                });

                Utils.log.info('✅ Ticket créé avec succès', ticket);
                return ticket;
                
            } else {
                throw new Error(response.message || 'Erreur lors de la création du ticket');
            }

        } catch (error) {
            Utils.log.error('❌ Erreur création ticket:', error);
            
            // Afficher bannière d'erreur
            await this._showErrorBanner(error);
            throw error;
            
        } finally {
            this._isLoading = false;
        }
    },

    /**
     * Vérifier s'il existe un ticket pour une salle
     */
    hasExistingTicket(room) {
        if (!room) return false;
        
        const tickets = Array.from(this._sessionTickets.values())
            .filter(ticket => ticket.room === room)
            .filter(ticket => !this._isTicketExpired(ticket));
            
        return tickets.length > 0;
    },

    /**
     * Obtenir le dernier ticket d'une salle
     */
    getLastSessionTicket(room) {
        if (!room) return null;
        
        const tickets = Array.from(this._sessionTickets.values())
            .filter(ticket => ticket.room === room)
            .filter(ticket => !this._isTicketExpired(ticket))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
        return tickets.length > 0 ? tickets[0] : null;
    },

    /**
     * Obtenir tous les tickets de session
     */
    getSessionTickets() {
        return Array.from(this._sessionTickets.values())
            .filter(ticket => !this._isTicketExpired(ticket))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    /**
     * === VALIDATION ET PRÉPARATION ===
     */

    /**
     * Valider les données de ticket
     */
    _validateTicketData(data) {
        const errors = [];

        // Room obligatoire
        if (!data.room || !Utils.validation.isValidRoom(data.room)) {
            errors.push('Salle invalide ou manquante');
        }

        // Description optionnelle mais si présente, doit être valide
        if (data.description && !Utils.validation.isValidProblem(data.description)) {
            errors.push('Description invalide (trop courte ou trop longue)');
        }

        // Type de problème
        if (data.problemType && !Object.values(getConfig('PROBLEM_TYPES')).includes(data.problemType)) {
            errors.push('Type de problème invalide');
        }

        if (errors.length > 0) {
            throw new Error(`Données invalides: ${errors.join(', ')}`);
        }

        return {
            room: data.room.trim().toUpperCase(),
            description: Utils.validation.sanitizeInput(data.description || ''),
            problemType: data.problemType || 'unknown',
            source: data.source || 'manual',
            ...data
        };
    },

    /**
     * Préparer les données complètes pour l'API
     */
    async _prepareTicketData(validatedData) {
        const currentRoom = validatedData.room;
        
        // Données de base
        const ticketData = {
            room: currentRoom,
            priority: 'medium',
            title: this._generateTicketTitle(validatedData),
            description: this._generateTicketDescription(validatedData),
            client_message: this._generateClientMessage(validatedData),
            copilot_analysis: 'Ticket créé via interface Vitrine',
            device_name: 'Non spécifié',
            reporter_name: 'Utilisateur Vitrine',
            timestamp: new Date().toISOString(),
            source: validatedData.source
        };

        // Enrichir avec les infos de salle si disponibles
        try {
            const roomInfo = window.RoomManager?.getCachedRoomInfo(currentRoom);
            if (roomInfo && roomInfo.source === 'podio' && roomInfo.data) {
                ticketData.room_pavillon = roomInfo.data.pavillon || null;
                ticketData.room_bassin = roomInfo.data.bassin || null;
                ticketData.room_type = roomInfo.data.type || null;
                ticketData.room_capacite = roomInfo.data.capacite || null;
                
                Utils.log.debug('Infos Podio ajoutées au ticket', roomInfo.data);
            }
        } catch (error) {
            Utils.log.warn('Impossible d\'enrichir avec infos Podio:', error);
        }

        return ticketData;
    },

    /**
     * Générer le titre du ticket
     */
    _generateTicketTitle(data) {
        const problemTypeText = this._getProblemTypeText(data.problemType);
        return `Problème ${problemTypeText} signalé via vitrine - Salle ${data.room}`;
    },

    /**
     * Générer la description du ticket
     */
    _generateTicketDescription(data) {
        const problemTypeText = this._getProblemTypeText(data.problemType);
        const baseDescription = `Problème ${problemTypeText} signalé par un utilisateur via l'interface vitrine nécessitant une intervention technique.`;
        
        if (data.description && data.description.trim()) {
            return `${baseDescription}\n\nDescription : ${data.description}`;
        }
        
        return baseDescription;
    },

    /**
     * Générer le message client
     */
    _generateClientMessage(data) {
        const isClientDescription = data.description && 
            data.description.trim() && 
            !data.description.includes('Problème ') && 
            data.description.length > 20;

        if (isClientDescription) {
            return `Signalement via vitrine SAV Qonnect\n\nDescription client : ${data.description}`;
        } else {
            const genericMessage = this._getGenericMessage(data.problemType);
            return `Signalement via vitrine SAV Qonnect\n\nMessage générique : ${genericMessage}`;
        }
    },

    /**
     * Obtenir le texte du type de problème
     */
    _getProblemTypeText(problemType) {
        const types = {
            [getConfig('PROBLEM_TYPES.VIDEO')]: 'vidéo',
            [getConfig('PROBLEM_TYPES.AUDIO')]: 'audio',
            [getConfig('PROBLEM_TYPES.NETWORK')]: 'réseau',
            [getConfig('PROBLEM_TYPES.SYSTEM')]: 'système'
        };
        return types[problemType] || 'technique';
    },

    /**
     * Obtenir un message générique selon le type
     */
    _getGenericMessage(problemType) {
        const messages = {
            [getConfig('PROBLEM_TYPES.VIDEO')]: 'Problème vidéo signalé - aucun affichage ou image déformée',
            [getConfig('PROBLEM_TYPES.AUDIO')]: 'Problème audio signalé - aucun son ou qualité dégradée',
            [getConfig('PROBLEM_TYPES.NETWORK')]: 'Problème réseau signalé - connexion défaillante',
            [getConfig('PROBLEM_TYPES.SYSTEM')]: 'Problème système signalé - ordinateur qui ne répond plus'
        };
        return messages[problemType] || 'Problème technique signalé nécessitant intervention';
    },

    /**
     * === GESTION DE SESSION ===
     */

    /**
     * Traiter la réponse de création de ticket
     */
    _processTicketResponse(ticketData) {
        return {
            id: ticketData.id || Utils.generate.id('ticket'),
            number: ticketData.ticket_number || ticketData.number || Utils.generate.ticketNumber(),
            room: ticketData.room,
            title: ticketData.title,
            description: ticketData.description,
            status: ticketData.status || 'created',
            priority: ticketData.priority || 'medium',
            timestamp: ticketData.created_at || ticketData.timestamp || new Date().toISOString(),
            source: 'vitrine',
            session_id: this._getSessionId()
        };
    },

    /**
     * Ajouter un ticket à la session
     */
    _addToSession(ticket) {
        const sessionId = ticket.number || ticket.id;
        this._sessionTickets.set(sessionId, ticket);
        this._saveSessionTickets();
        
        Utils.log.info(`Ticket ${sessionId} ajouté à la session`);
    },

    /**
     * Charger les tickets depuis localStorage
     */
    _loadSessionTickets() {
        try {
            const saved = Utils.storage.get('SESSION_TICKETS', {});
            
            // Convertir en Map et filtrer les expirés
            Object.entries(saved).forEach(([id, ticket]) => {
                if (!this._isTicketExpired(ticket)) {
                    this._sessionTickets.set(id, ticket);
                }
            });
            
            Utils.log.debug(`${this._sessionTickets.size} ticket(s) chargé(s) depuis localStorage`);
            
        } catch (error) {
            Utils.log.error('Erreur chargement tickets session:', error);
            this._sessionTickets.clear();
        }
    },

    /**
     * Sauvegarder les tickets en localStorage
     */
    _saveSessionTickets() {
        try {
            const toSave = {};
            this._sessionTickets.forEach((ticket, id) => {
                if (!this._isTicketExpired(ticket)) {
                    toSave[id] = ticket;
                }
            });
            
            Utils.storage.set('SESSION_TICKETS', toSave);
            Utils.log.debug(`${Object.keys(toSave).length} ticket(s) sauvegardé(s)`);
            
        } catch (error) {
            Utils.log.error('Erreur sauvegarde tickets session:', error);
        }
    },

    /**
     * Vérifier si un ticket est expiré
     */
    _isTicketExpired(ticket) {
        if (!ticket || !ticket.timestamp) return true;
        
        const ticketAge = Date.now() - new Date(ticket.timestamp).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 heures
        
        return ticketAge > maxAge;
    },

    /**
     * Nettoyer les tickets expirés
     */
    _cleanupExpiredTickets() {
        const beforeCount = this._sessionTickets.size;
        
        const expired = Array.from(this._sessionTickets.entries())
            .filter(([_, ticket]) => this._isTicketExpired(ticket))
            .map(([id]) => id);
            
        expired.forEach(id => this._sessionTickets.delete(id));
        
        if (expired.length > 0) {
            this._saveSessionTickets();
            Utils.log.info(`${expired.length} ticket(s) expiré(s) supprimé(s) (${beforeCount} → ${this._sessionTickets.size})`);
        }
    },

    /**
     * Obtenir l'ID de session
     */
    _getSessionId() {
        let sessionId = Utils.storage.get('USER_PREFERENCES', {}).sessionId;
        if (!sessionId) {
            sessionId = Utils.generate.id('session');
            const prefs = Utils.storage.get('USER_PREFERENCES', {});
            prefs.sessionId = sessionId;
            Utils.storage.set('USER_PREFERENCES', prefs);
        }
        return sessionId;
    },

    /**
     * === GESTION D'ERREURS ===
     */

    /**
     * Afficher une bannière d'erreur
     */
    async _showErrorBanner(error) {
        const errorMessage = this._getErrorMessage(error);
        
        // Utiliser une bannière SEA modifiée pour les erreurs
        await BannerManager.show(getConfig('BANNER_TYPES.SEA'), {
            error: true,
            title: 'Erreur de création',
            message: errorMessage,
            room: window.RoomManager?.getCurrentRoom() || ''
        });
    },

    /**
     * Obtenir un message d'erreur convivial
     */
    _getErrorMessage(error) {
        const message = error.message || error.toString();
        
        if (message.includes('timeout') || message.includes('Timeout')) {
            return 'Délai d\'attente dépassé. Veuillez réessayer.';
        } else if (message.includes('network') || message.includes('fetch')) {
            return 'Erreur de connexion. Vérifiez votre réseau.';
        } else if (message.includes('validation') || message.includes('invalid')) {
            return message; // Garder les erreurs de validation telles quelles
        } else {
            return `${message}\n\nVeuillez contacter le SEA directement au ${getConfig('CONTACTS.SEA.phone')}.`;
        }
    },

    /**
     * === MÉTHODES UTILITAIRES ===
     */

    /**
     * Vérifier l'état de chargement
     */
    isLoading() {
        return this._isLoading;
    },

    /**
     * Obtenir les statistiques des tickets
     */
    getStats() {
        const tickets = this.getSessionTickets();
        
        return {
            total: tickets.length,
            byRoom: tickets.reduce((acc, ticket) => {
                acc[ticket.room] = (acc[ticket.room] || 0) + 1;
                return acc;
            }, {}),
            byType: tickets.reduce((acc, ticket) => {
                const type = ticket.problemType || 'unknown';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {}),
            recent: tickets.filter(ticket => {
                const age = Date.now() - new Date(ticket.timestamp).getTime();
                return age < (60 * 60 * 1000); // Dernière heure
            }).length
        };
    },

    /**
     * Réinitialiser le gestionnaire
     */
    reset() {
        Utils.log.info('Réinitialisation TicketManager');
        
        this._sessionTickets.clear();
        this._isLoading = false;
        Utils.storage.remove('SESSION_TICKETS');
        
        Utils.log.info('TicketManager réinitialisé');
    },

    /**
     * Exporter les tickets (pour debug)
     */
    exportTickets() {
        const tickets = this.getSessionTickets();
        const stats = this.getStats();
        
        return {
            tickets,
            stats,
            exportedAt: new Date().toISOString(),
            sessionId: this._getSessionId()
        };
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    TicketManager.init();
});

// Log d'initialisation
Utils.log.info('TicketManager chargé');