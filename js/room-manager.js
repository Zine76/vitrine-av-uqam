/**
 * ========================================
 * VITRINE - GESTIONNAIRE DE SALLES
 * ========================================
 */

window.RoomManager = {
    /**
     * Salle actuelle
     */
    _currentRoom: null,

    /**
     * Cache des informations de salles
     */
    _roomCache: new Map(),

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
        Utils.log.info('Initialisation RoomManager');
        
        // Charger la dernière salle depuis localStorage
        this._loadLastRoom();
        
        // Charger le cache des salles
        this._loadRoomCache();
        
        Utils.log.info(`RoomManager initialisé. Salle actuelle: ${this._currentRoom || 'Aucune'}`);
    },

    /**
     * === GESTION DE LA SALLE ACTUELLE ===
     */

    /**
     * Définir la salle actuelle
     */
    async setCurrentRoom(roomName) {
        if (!roomName || typeof roomName !== 'string') {
            throw new Error('Nom de salle invalide');
        }

        const normalizedRoom = roomName.trim().toUpperCase();
        
        if (!Utils.validation.isValidRoom(normalizedRoom)) {
            throw new Error('Format de salle invalide (attendu: A-1234)');
        }

        Utils.log.info(`Changement de salle: ${this._currentRoom || 'Aucune'} → ${normalizedRoom}`);

        try {
            // Charger les informations de la salle
            const roomInfo = await this.getRoomInfo(normalizedRoom);
            
            // Mettre à jour la salle actuelle
            this._currentRoom = normalizedRoom;
            
            // Sauvegarder en localStorage
            Utils.storage.set('LAST_ROOM', normalizedRoom);
            
            // Déclencher l'événement de changement
            this._triggerRoomChange(normalizedRoom, roomInfo);
            
            Utils.log.info(`✅ Salle ${normalizedRoom} confirmée`);
            return roomInfo;
            
        } catch (error) {
            Utils.log.error(`❌ Erreur confirmation salle ${normalizedRoom}:`, error);
            throw error;
        }
    },

    /**
     * Obtenir la salle actuelle
     */
    getCurrentRoom() {
        return this._currentRoom;
    },

    /**
     * Vérifier si une salle est définie
     */
    hasCurrentRoom() {
        return this._currentRoom !== null;
    },

    /**
     * Réinitialiser la salle actuelle
     */
    clearCurrentRoom() {
        Utils.log.info(`Réinitialisation salle actuelle: ${this._currentRoom}`);
        
        this._currentRoom = null;
        Utils.storage.remove('LAST_ROOM');
        
        this._triggerRoomChange(null, null);
    },

    /**
     * === RÉCUPÉRATION D'INFORMATIONS ===
     */

    /**
     * Obtenir les informations complètes d'une salle
     */
    async getRoomInfo(roomName, forceRefresh = false) {
        const normalizedRoom = roomName.trim().toUpperCase();
        Utils.log.info(`Récupération infos salle ${normalizedRoom}`, { forceRefresh });

        // Vérifier le cache si pas de force refresh
        if (!forceRefresh && this._roomCache.has(normalizedRoom)) {
            const cached = this._roomCache.get(normalizedRoom);
            if (!this._isCacheExpired(cached)) {
                Utils.log.debug(`✅ Cache hit pour salle ${normalizedRoom}`);
                return cached;
            }
        }

        if (this._isLoading) {
            Utils.log.warn('Chargement déjà en cours, attente...');
            await this._waitForLoading();
        }

        this._isLoading = true;

        try {
            Utils.log.debug(`🔍 Récupération API pour salle ${normalizedRoom}`);
            
            // Utiliser la stratégie Podio + NeonDB de l'ApiClient
            const roomInfo = await ApiClient.getCompleteRoomInfo(normalizedRoom);
            
            // Enrichir avec métadonnées
            const enrichedInfo = {
                ...roomInfo,
                lastUpdated: Date.now(),
                cacheExpiry: Date.now() + (15 * 60 * 1000) // 15 minutes
            };

            // Mettre en cache
            this._roomCache.set(normalizedRoom, enrichedInfo);
            this._saveRoomCache();

            Utils.log.info(`✅ Infos salle ${normalizedRoom} récupérées via ${roomInfo.source}`);
            return enrichedInfo;

        } catch (error) {
            Utils.log.error(`❌ Erreur récupération salle ${normalizedRoom}:`, error);
            
            // Retourner un objet d'erreur structuré
            const errorInfo = {
                room: normalizedRoom,
                source: 'error',
                error: error.message,
                data: null,
                equipment: null,
                lastUpdated: Date.now()
            };

            return errorInfo;

        } finally {
            this._isLoading = false;
        }
    },

    /**
     * Obtenir les équipements d'une salle
     */
    async getRoomEquipment(roomName) {
        const roomInfo = await this.getRoomInfo(roomName);
        
        if (roomInfo.error) {
            throw new Error(roomInfo.error);
        }

        // Équipements depuis NeonDB
        if (roomInfo.source === 'neondb' && roomInfo.equipment) {
            return roomInfo.equipment;
        }

        // Équipements depuis Podio (format différent)
        if (roomInfo.source === 'podio' && roomInfo.data) {
            return this._extractEquipmentFromPodio(roomInfo.data);
        }

        return [];
    },

    /**
     * Obtenir les informations depuis le cache
     */
    getCachedRoomInfo(roomName) {
        const normalizedRoom = roomName.trim().toUpperCase();
        const cached = this._roomCache.get(normalizedRoom);
        
        if (cached && !this._isCacheExpired(cached)) {
            return cached;
        }
        
        return null;
    },

    /**
     * === VALIDATION ET DÉTECTION ===
     */

    /**
     * Valider le format d'une salle
     */
    validateRoomFormat(roomName) {
        if (!roomName || typeof roomName !== 'string') {
            return { valid: false, error: 'Nom de salle requis' };
        }

        const normalized = roomName.trim().toUpperCase();
        
        if (!Utils.validation.isValidRoom(normalized)) {
            return { 
                valid: false, 
                error: 'Format invalide (attendu: A-1234)' 
            };
        }

        return { valid: true, normalized };
    },

    /**
     * Détecter des mentions de salle dans un message
     */
    detectRoomInMessage(message) {
        if (!message || typeof message !== 'string') return [];

        const roomPattern = /\b[A-Z]-\d{4}\b/g;
        const matches = message.toUpperCase().match(roomPattern);
        
        return matches ? [...new Set(matches)] : [];
    },

    /**
     * Vérifier si une salle mentionnée diffère de la salle actuelle
     */
    checkRoomConsistency(message) {
        const detectedRooms = this.detectRoomInMessage(message);
        const currentRoom = this.getCurrentRoom();
        
        if (!currentRoom || detectedRooms.length === 0) {
            return { consistent: true };
        }

        const differentRooms = detectedRooms.filter(room => room !== currentRoom);
        
        if (differentRooms.length > 0) {
            return {
                consistent: false,
                currentRoom,
                detectedRooms: differentRooms,
                suggestion: `Vous êtes dans ${currentRoom}, mais ${differentRooms[0]} est mentionné.`
            };
        }

        return { consistent: true };
    },

    /**
     * === GESTION DU CACHE ===
     */

    /**
     * Vérifier si le cache est expiré
     */
    _isCacheExpired(cached) {
        if (!cached || !cached.cacheExpiry) return true;
        return Date.now() > cached.cacheExpiry;
    },

    /**
     * Charger le cache depuis localStorage
     */
    _loadRoomCache() {
        try {
            const saved = Utils.storage.get('ROOM_CACHE', {});
            
            // Convertir en Map et filtrer les expirés
            Object.entries(saved).forEach(([room, info]) => {
                if (!this._isCacheExpired(info)) {
                    this._roomCache.set(room, info);
                }
            });
            
            Utils.log.debug(`${this._roomCache.size} salle(s) chargée(s) depuis le cache`);
            
        } catch (error) {
            Utils.log.error('Erreur chargement cache salles:', error);
            this._roomCache.clear();
        }
    },

    /**
     * Sauvegarder le cache en localStorage
     */
    _saveRoomCache() {
        try {
            const toSave = {};
            this._roomCache.forEach((info, room) => {
                if (!this._isCacheExpired(info)) {
                    toSave[room] = info;
                }
            });
            
            Utils.storage.set('ROOM_CACHE', toSave);
            Utils.log.debug(`Cache sauvegardé: ${Object.keys(toSave).length} salle(s)`);
            
        } catch (error) {
            Utils.log.error('Erreur sauvegarde cache salles:', error);
        }
    },

    /**
     * Nettoyer le cache expiré
     */
    cleanupCache() {
        const beforeCount = this._roomCache.size;
        
        const expired = Array.from(this._roomCache.entries())
            .filter(([_, info]) => this._isCacheExpired(info))
            .map(([room]) => room);
            
        expired.forEach(room => this._roomCache.delete(room));
        
        if (expired.length > 0) {
            this._saveRoomCache();
            Utils.log.info(`Cache nettoyé: ${expired.length} salle(s) expirée(s) (${beforeCount} → ${this._roomCache.size})`);
        }
    },

    /**
     * === UTILITAIRES INTERNES ===
     */

    /**
     * Charger la dernière salle utilisée
     */
    _loadLastRoom() {
        try {
            const lastRoom = Utils.storage.get('LAST_ROOM');
            if (lastRoom && Utils.validation.isValidRoom(lastRoom)) {
                this._currentRoom = lastRoom;
                Utils.log.debug(`Dernière salle restaurée: ${lastRoom}`);
            }
        } catch (error) {
            Utils.log.warn('Impossible de charger la dernière salle:', error);
        }
    },

    /**
     * Attendre la fin du chargement en cours
     */
    async _waitForLoading() {
        while (this._isLoading) {
            await Utils.async.wait(100);
        }
    },

    /**
     * Déclencher l'événement de changement de salle
     */
    _triggerRoomChange(newRoom, roomInfo) {
        const event = new CustomEvent('roomChanged', {
            detail: {
                previousRoom: this._currentRoom,
                newRoom: newRoom,
                roomInfo: roomInfo
            }
        });
        
        document.dispatchEvent(event);
        Utils.log.debug('Événement roomChanged déclenché', { newRoom, roomInfo });
    },

    /**
     * Extraire les équipements depuis les données Podio
     */
    _extractEquipmentFromPodio(podioData) {
        // Cette fonction dépend du format des données Podio
        // À adapter selon la structure réelle
        if (!podioData) return [];

        try {
            // Exemple de mapping depuis Podio
            if (podioData.equipements) {
                return podioData.equipements.map(eq => ({
                    id: eq.id || Utils.generate.id('eq'),
                    name: eq.nom || eq.name,
                    type: eq.type || 'unknown',
                    status: eq.statut || eq.status || 'unknown',
                    source: 'podio'
                }));
            }
            
            return [];
            
        } catch (error) {
            Utils.log.warn('Erreur extraction équipements Podio:', error);
            return [];
        }
    },

    /**
     * === MÉTHODES PUBLIQUES UTILITAIRES ===
     */

    /**
     * Obtenir les statistiques du cache
     */
    getCacheStats() {
        const all = Array.from(this._roomCache.values());
        const expired = all.filter(info => this._isCacheExpired(info));
        
        return {
            total: all.length,
            expired: expired.length,
            valid: all.length - expired.length,
            bySource: all.reduce((acc, info) => {
                acc[info.source] = (acc[info.source] || 0) + 1;
                return acc;
            }, {}),
            oldestEntry: all.length > 0 ? Math.min(...all.map(info => info.lastUpdated)) : null,
            newestEntry: all.length > 0 ? Math.max(...all.map(info => info.lastUpdated)) : null
        };
    },

    /**
     * Forcer le rafraîchissement d'une salle
     */
    async refreshRoom(roomName = null) {
        const targetRoom = roomName || this._currentRoom;
        if (!targetRoom) {
            throw new Error('Aucune salle à rafraîchir');
        }

        Utils.log.info(`Rafraîchissement forcé salle ${targetRoom}`);
        
        // Supprimer du cache
        this._roomCache.delete(targetRoom);
        
        // Recharger
        const refreshedInfo = await this.getRoomInfo(targetRoom, true);
        
        // Déclencher événement si c'est la salle actuelle
        if (targetRoom === this._currentRoom) {
            this._triggerRoomChange(targetRoom, refreshedInfo);
        }
        
        return refreshedInfo;
    },

    /**
     * Obtenir l'état actuel du gestionnaire
     */
    getState() {
        return {
            currentRoom: this._currentRoom,
            isLoading: this._isLoading,
            cacheSize: this._roomCache.size,
            cacheStats: this.getCacheStats(),
            hasCurrentRoom: this.hasCurrentRoom()
        };
    },

    /**
     * Réinitialiser complètement le gestionnaire
     */
    reset() {
        Utils.log.info('Réinitialisation complète RoomManager');
        
        this._currentRoom = null;
        this._roomCache.clear();
        this._isLoading = false;
        
        Utils.storage.remove('LAST_ROOM');
        Utils.storage.remove('ROOM_CACHE');
        
        this._triggerRoomChange(null, null);
        
        Utils.log.info('RoomManager réinitialisé');
    },

    /**
     * Exporter les données (pour debug)
     */
    exportData() {
        return {
            currentRoom: this._currentRoom,
            cache: Object.fromEntries(this._roomCache),
            stats: this.getCacheStats(),
            state: this.getState(),
            exportedAt: new Date().toISOString()
        };
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    RoomManager.init();
});

// Nettoyage périodique du cache (toutes les 30 minutes)
setInterval(() => {
    RoomManager.cleanupCache();
}, 30 * 60 * 1000);

// Log d'initialisation
Utils.log.info('RoomManager chargé');