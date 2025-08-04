/**
 * ========================================
 * VITRINE - CLIENT API CENTRALISÉ
 * ========================================
 */

window.ApiClient = {
    /**
     * Configuration de base
     */
    _baseUrl: getConfig('API.BASE_URL'),
    _defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    _defaultTimeout: getConfig('TIMEOUTS.API_REQUEST'),

    /**
     * Méthode HTTP générique
     */
    async _request(method, endpoint, data = null, options = {}) {
        const url = `${this._baseUrl}${endpoint}`;
        const config = {
            method: method.toUpperCase(),
            headers: { ...this._defaultHeaders, ...options.headers },
            ...options
        };

        // Ajouter le body pour POST/PUT
        if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
            config.body = JSON.stringify(data);
        }

        Utils.log.debug(`API ${method.toUpperCase()} ${endpoint}`, data);

        try {
            // Utiliser le timeout configuré
            const response = await Utils.async.withTimeout(
                fetch(url, config),
                options.timeout || this._defaultTimeout,
                'Timeout de la requête API'
            );

            // Log de la réponse
            Utils.log.debug(`API Response ${response.status}`, {
                url,
                status: response.status,
                statusText: response.statusText
            });

            // Gérer les erreurs HTTP
            if (!response.ok) {
                const errorData = await this._parseResponse(response);
                throw new Error(`Erreur API ${response.status}: ${errorData.message || response.statusText}`);
            }

            return await this._parseResponse(response);

        } catch (error) {
            Utils.log.error(`Erreur API ${method.toUpperCase()} ${endpoint}:`, error);
            throw this._normalizeError(error);
        }
    },

    /**
     * Parser la réponse selon le Content-Type
     */
    async _parseResponse(response) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else if (contentType && contentType.includes('text/')) {
            return await response.text();
        } else {
            return await response.blob();
        }
    },

    /**
     * Normaliser les erreurs
     */
    _normalizeError(error) {
        if (error.name === 'AbortError') {
            return new Error('Requête annulée');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return new Error('Erreur de connexion réseau');
        } else if (error.message.includes('Timeout')) {
            return new Error('Délai d\'attente dépassé');
        } else {
            return error;
        }
    },

    /**
     * Méthodes HTTP
     */
    async get(endpoint, options = {}) {
        return this._request('GET', endpoint, null, options);
    },

    async post(endpoint, data, options = {}) {
        return this._request('POST', endpoint, data, options);
    },

    async put(endpoint, data, options = {}) {
        return this._request('PUT', endpoint, data, options);
    },

    async patch(endpoint, data, options = {}) {
        return this._request('PATCH', endpoint, data, options);
    },

    async delete(endpoint, options = {}) {
        return this._request('DELETE', endpoint, null, options);
    },

    /**
     * === ENDPOINTS SPÉCIFIQUES ===
     */

    /**
     * Chat avec le Copilot
     */
    async sendCopilotMessage(room, message, options = {}) {
        Utils.log.info('Envoi message Copilot', { room, message: Utils.format.truncate(message, 50) });
        
        return this.post(getConfig('API.ENDPOINTS.COPILOT_CHAT'), {
            room: room,
            message: message,
            timestamp: new Date().toISOString(),
            ...options
        });
    },

    /**
     * Création de ticket SEA
     */
    async createTicket(ticketData) {
        Utils.log.info('Création ticket SEA', { 
            room: ticketData.room, 
            title: Utils.format.truncate(ticketData.title, 50) 
        });

        return this.post(getConfig('API.ENDPOINTS.CREATE_TICKET'), {
            priority: 'medium',
            timestamp: new Date().toISOString(),
            ...ticketData
        });
    },

    /**
     * Informations de salle via Podio
     */
    async getRoomInfo(roomName) {
        Utils.log.info('Récupération infos salle Podio', { room: roomName });
        
        try {
            const response = await this.get(`${getConfig('API.ENDPOINTS.ROOM_INFO')}?room=${encodeURIComponent(roomName)}`);
            
            // Vérifier si la réponse indique une erreur
            if (response && response.error) {
                throw new Error(response.error);
            }
            
            return response;
        } catch (error) {
            Utils.log.warn('Erreur info salle Podio:', error.message);
            throw error;
        }
    },

    /**
     * Équipements de salle via NeonDB (fallback)
     */
    async getRoomEquipment(roomName) {
        Utils.log.info('Récupération équipements salle NeonDB', { room: roomName });
        
        try {
            const response = await this.get(`${getConfig('API.ENDPOINTS.ROOM_EQUIPMENT')}?room=${encodeURIComponent(roomName)}`);
            
            if (!response || !response.success) {
                throw new Error(response?.message || 'Erreur récupération équipements');
            }
            
            return response;
        } catch (error) {
            Utils.log.warn('Erreur équipements salle:', error.message);
            throw error;
        }
    },

    /**
     * Appareils publics (autre fallback)
     */
    async getPublicDevices() {
        Utils.log.info('Récupération appareils publics');
        
        try {
            return await this.get(getConfig('API.ENDPOINTS.DEVICES_PUBLIC'));
        } catch (error) {
            Utils.log.warn('Erreur appareils publics:', error.message);
            throw error;
        }
    },

    /**
     * === GESTION DES SALLES (Stratégie Podio + NeonDB) ===
     */

    /**
     * Récupération complète des informations de salle avec fallback
     */
    async getCompleteRoomInfo(roomName) {
        Utils.log.info('Récupération complète infos salle', { room: roomName });
        
        let roomInfo = {
            room: roomName,
            source: null,
            data: null,
            equipment: null,
            error: null
        };

        try {
            // Tentative 1: Podio (source principale)
            try {
                const podioData = await this.getRoomInfo(roomName);
                if (podioData && !podioData.error) {
                    roomInfo.source = 'podio';
                    roomInfo.data = podioData;
                    Utils.log.info('✅ Infos salle récupérées via Podio');
                    return roomInfo;
                }
            } catch (podioError) {
                Utils.log.info('❌ Podio échec, tentative NeonDB...');
                roomInfo.error = podioError.message;
            }

            // Tentative 2: NeonDB (fallback)
            try {
                const neonData = await this.getRoomEquipment(roomName);
                if (neonData && neonData.success) {
                    roomInfo.source = 'neondb';
                    roomInfo.equipment = neonData.devices || [];
                    roomInfo.data = {
                        room: roomName,
                        devices_count: neonData.count || 0
                    };
                    Utils.log.info('✅ Infos salle récupérées via NeonDB');
                    return roomInfo;
                }
            } catch (neonError) {
                Utils.log.warn('❌ NeonDB également en échec');
            }

            // Aucune source disponible
            throw new Error('Aucune information disponible pour cette salle');

        } catch (error) {
            roomInfo.error = error.message;
            Utils.log.error('❌ Échec récupération complète infos salle:', error);
            return roomInfo;
        }
    },

    /**
     * === GESTION DES ERREURS RÉSEAU ===
     */

    /**
     * Test de connectivité
     */
    async checkConnectivity() {
        try {
            await this.get('/api/health', { timeout: 5000 });
            return true;
        } catch (error) {
            Utils.log.warn('Connectivité indisponible:', error.message);
            return false;
        }
    },

    /**
     * Retry automatique avec backoff
     */
    async withRetry(apiCall, maxRetries = 3) {
        return Utils.async.retry(async () => {
            return await apiCall();
        }, maxRetries, 1000);
    },

    /**
     * === MÉTHODES DE BATCH ===
     */

    /**
     * Exécuter plusieurs requêtes en parallèle
     */
    async batch(requests) {
        Utils.log.info(`Exécution batch de ${requests.length} requêtes`);
        
        try {
            const results = await Promise.allSettled(
                requests.map(req => this._request(req.method, req.endpoint, req.data, req.options))
            );
            
            return results.map((result, index) => ({
                success: result.status === 'fulfilled',
                data: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason.message : null,
                request: requests[index]
            }));
        } catch (error) {
            Utils.log.error('Erreur batch:', error);
            throw error;
        }
    }
};

// Log d'initialisation
Utils.log.info('Client API initialisé', { baseUrl: ApiClient._baseUrl });