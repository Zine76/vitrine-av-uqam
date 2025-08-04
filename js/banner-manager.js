/**
 * ========================================
 * VITRINE - GESTIONNAIRE DE BANNIÈRES UNIFIÉ
 * ========================================
 */

window.BannerManager = {
    /**
     * État des bannières actives
     */
    _activeBanners: new Map(),
    _autoCloseTimers: new Map(),

    /**
     * === MÉTHODES PRINCIPALES ===
     */

    /**
     * Afficher une bannière (point d'entrée principal)
     */
    async show(type, data = {}, options = {}) {
        Utils.log.info(`Affichage bannière ${type}`, data);

        try {
            // 1. Nettoyer les bannières existantes du même type
            this._cleanup(type);

            // 2. Générer un ID unique
            const bannerId = Utils.generate.id(type);

            // 3. Créer la bannière
            const banner = await this._createBanner(type, bannerId, data, options);

            // 4. Afficher avec animation
            await this._displayBanner(banner, options);

            // 5. Enregistrer la bannière active
            this._activeBanners.set(bannerId, {
                type,
                element: banner.overlay,
                data,
                createdAt: Date.now()
            });

            // 6. Configurer auto-fermeture si demandée
            if (options.autoClose !== false) {
                this._setupAutoClose(bannerId, options.autoCloseDelay);
            }

            Utils.log.info(`✅ Bannière ${type} affichée avec ID ${bannerId}`);
            return bannerId;

        } catch (error) {
            Utils.log.error(`Erreur affichage bannière ${type}:`, error);
            throw error;
        }
    },

    /**
     * Fermer une bannière spécifique
     */
    async close(bannerId, options = {}) {
        Utils.log.info(`Fermeture bannière ${bannerId}`);

        const bannerInfo = this._activeBanners.get(bannerId);
        if (!bannerInfo) {
            Utils.log.warn(`Bannière ${bannerId} introuvable`);
            return false;
        }

        try {
            // 1. Annuler l'auto-fermeture
            this._clearAutoClose(bannerId);

            // 2. Animation de fermeture
            if (options.animated !== false) {
                await this._animateClose(bannerInfo.element);
            }

            // 3. Supprimer du DOM
            bannerInfo.element.remove();

            // 4. Nettoyer l'état
            this._activeBanners.delete(bannerId);

            // 5. Callback de fermeture
            if (options.onClose) {
                options.onClose(bannerId, bannerInfo);
            }

            Utils.log.info(`✅ Bannière ${bannerId} fermée`);
            return true;

        } catch (error) {
            Utils.log.error(`Erreur fermeture bannière ${bannerId}:`, error);
            return false;
        }
    },

    /**
     * Fermer toutes les bannières d'un type
     */
    closeAllOfType(type) {
        Utils.log.info(`Fermeture toutes bannières type ${type}`);
        
        const bannerIds = Array.from(this._activeBanners.entries())
            .filter(([_, info]) => info.type === type)
            .map(([id]) => id);

        return Promise.all(bannerIds.map(id => this.close(id)));
    },

    /**
     * Fermer toutes les bannières
     */
    closeAll() {
        Utils.log.info('Fermeture toutes bannières');
        
        const bannerIds = Array.from(this._activeBanners.keys());
        return Promise.all(bannerIds.map(id => this.close(id)));
    },

    /**
     * === CRÉATION DE BANNIÈRES ===
     */

    /**
     * Créer une bannière selon son type
     */
    async _createBanner(type, bannerId, data, options) {
        const config = getConfig(`BANNERS.${type.toUpperCase()}`);
        if (!config) {
            throw new Error(`Type de bannière inconnu: ${type}`);
        }

        // Créer l'overlay
        const overlay = this._createOverlay(bannerId);

        // Créer la bannière selon le type
        let bannerElement;
        switch (type) {
            case getConfig('BANNER_TYPES.SEA'):
                bannerElement = this._createSEABanner(bannerId, data, config);
                break;
            case getConfig('BANNER_TYPES.EXISTING_TICKET'):
                bannerElement = this._createExistingTicketBanner(bannerId, data, config);
                break;
            case getConfig('BANNER_TYPES.AUTO_RESULT'):
                bannerElement = this._createAutoResultBanner(bannerId, data, config);
                break;
            case getConfig('BANNER_TYPES.SIM'):
                bannerElement = this._createSIMBanner(bannerId, data, config);
                break;
            case getConfig('BANNER_TYPES.SI'):
                bannerElement = this._createSIBanner(bannerId, data, config);
                break;
            case getConfig('BANNER_TYPES.CONFIRMATION'):
                bannerElement = this._createConfirmationBanner(bannerId, data, config);
                break;
            default:
                throw new Error(`Type de bannière non implémenté: ${type}`);
        }

        // Assembler overlay + bannière
        overlay.appendChild(bannerElement);

        return {
            overlay,
            banner: bannerElement,
            id: bannerId,
            type
        };
    },

    /**
     * Créer l'overlay de base
     */
    _createOverlay(bannerId) {
        const overlay = Utils.dom.createElement('div', {
            id: `overlay_${bannerId}`,
            className: 'banner-overlay'
        });

        // Fermeture au clic sur l'overlay (pas sur le contenu)
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                this.close(bannerId);
            }
        });

        return overlay;
    },

    /**
     * Bannière SEA
     */
    _createSEABanner(bannerId, data, config) {
        const banner = Utils.dom.createElement('div', {
            id: bannerId,
            className: 'banner-base banner-sea'
        });

        banner.innerHTML = `
            <div class="banner-header">
                <div class="banner-icon">${config.icon}</div>
                <div class="banner-title">${config.title}</div>
                <div class="banner-subtitle">${config.subtitle}</div>
            </div>

            <div class="banner-content">
                <div class="banner-info-grid">
                    <div class="banner-info-item">
                        <span class="banner-info-label">🏢 Salle :</span>
                        <span class="banner-info-value">${data.room || 'Non spécifiée'}</span>
                    </div>
                    <div class="banner-info-item">
                        <span class="banner-info-label">⏰ Heure :</span>
                        <span class="banner-info-value">${Utils.format.time(new Date())}</span>
                    </div>
                </div>

                <div class="banner-form">
                    <div class="banner-form-group">
                        <label class="banner-form-label" for="description_${bannerId}">
                            📝 Description détaillée (facultative)
                        </label>
                        <textarea 
                            id="description_${bannerId}"
                            class="banner-form-input"
                            placeholder="Décrivez votre problème en détail..."
                            maxlength="500"
                        ></textarea>
                        <div class="banner-help-text">
                            💡 Si vous ne saisissez rien, un message générique sera utilisé selon le type de problème.
                        </div>
                    </div>
                </div>
            </div>

            <div class="banner-actions">
                <button type="button" class="banner-btn banner-btn-secondary" onclick="BannerManager.close('${bannerId}')">
                    <i class="fas fa-times"></i> Fermer
                </button>
                <button type="button" class="banner-btn banner-btn-primary" onclick="BannerManager._handleSEATicketCreation('${bannerId}')">
                    <i class="fas fa-paper-plane"></i> Créer un ticket
                </button>
            </div>
        `;

        // Empêcher la propagation des clics
        banner.addEventListener('click', (e) => e.stopPropagation());

        return banner;
    },

    /**
     * Bannière ticket existant
     */
    _createExistingTicketBanner(bannerId, data, config) {
        const banner = Utils.dom.createElement('div', {
            id: bannerId,
            className: 'banner-base banner-existing-ticket'
        });

        banner.innerHTML = `
            <div class="banner-header">
                <div class="banner-icon">${config.icon}</div>
                <div class="banner-title">${config.title}</div>
            </div>

            <div class="banner-content">
                <div class="banner-info-grid">
                    <div class="banner-info-item">
                        <span class="banner-info-label">📄 Numéro :</span>
                        <span class="banner-info-value">${data.number || 'N/A'}</span>
                    </div>
                    <div class="banner-info-item">
                        <span class="banner-info-label">🏢 Salle :</span>
                        <span class="banner-info-value">${data.room || 'N/A'}</span>
                    </div>
                    <div class="banner-info-item">
                        <span class="banner-info-label">⏰ Créé :</span>
                        <span class="banner-info-value">${data.timestamp ? Utils.format.time(data.timestamp) : 'N/A'}</span>
                    </div>
                </div>

                <p style="margin: 1.5rem 0; opacity: 0.95; line-height: 1.4;">
                    Un ticket SEA a déjà été escaladé vers l'équipe technique dans la même session.
                </p>
                <p style="margin: 1rem 0; opacity: 0.9; font-size: 0.9rem;">
                    📞 <strong>Vous pouvez toujours appeler directement le SEA au ${getConfig('CONTACTS.SEA.phone')}</strong> pour un suivi ou une urgence.
                </p>
            </div>

            <div class="banner-actions">
                <button type="button" class="banner-btn banner-btn-secondary" onclick="BannerManager.close('${bannerId}')">
                    ✕ Fermer
                </button>
                <button type="button" class="banner-btn banner-btn-primary" onclick="BannerManager._handlePhoneCall('${getConfig('CONTACTS.SEA.phone')}')">
                    📞 Appeler SEA
                </button>
                <button type="button" class="banner-btn banner-btn-secondary" onclick="BannerManager._handleCopyTicket('${data.number || ''}')">
                    📋 Copier numéro
                </button>
            </div>
        `;

        banner.addEventListener('click', (e) => e.stopPropagation());
        return banner;
    },

    /**
     * Bannière résultat automatique
     */
    _createAutoResultBanner(bannerId, data, config) {
        const banner = Utils.dom.createElement('div', {
            id: bannerId,
            className: 'banner-base banner-auto-result'
        });

        banner.innerHTML = `
            <div class="banner-header">
                <div class="banner-icon">${config.icon}</div>
                <div class="banner-title">${config.title}</div>
            </div>

            <div class="banner-content">
                <div style="font-size: 1.1rem; font-weight: 500; margin: 1rem 0;">
                    ${data.message || 'Action automatique réussie'}
                </div>
            </div>

            <div class="banner-actions">
                <button type="button" class="banner-btn banner-btn-primary" onclick="BannerManager.close('${bannerId}')">
                    Fermer
                </button>
            </div>
        `;

        banner.addEventListener('click', (e) => e.stopPropagation());
        return banner;
    },

    /**
     * Bannière SIM (Service des Immeubles)
     */
    _createSIMBanner(bannerId, data, config) {
        return this._createServiceBanner(bannerId, data, config, 'SIM', getConfig('CONTACTS.SIM'));
    },

    /**
     * Bannière SI (Services Informatiques)
     */
    _createSIBanner(bannerId, data, config) {
        return this._createServiceBanner(bannerId, data, config, 'SI', getConfig('CONTACTS.SI'));
    },

    /**
     * Template commun pour bannières de service
     */
    _createServiceBanner(bannerId, data, config, serviceType, contact) {
        const banner = Utils.dom.createElement('div', {
            id: bannerId,
            className: `banner-base banner-${serviceType.toLowerCase()}`
        });

        banner.innerHTML = `
            <div class="banner-header">
                <div class="banner-icon">${config.icon}</div>
                <div class="banner-title">${config.title}</div>
                <div class="banner-subtitle">${config.subtitle}</div>
            </div>

            <div class="banner-content">
                <p style="margin: 1.5rem 0; font-size: 1.1rem; line-height: 1.4;">
                    ${data.message || `Ce type de problème relève du ${contact.name}.`}
                </p>
                <p style="margin: 1rem 0; font-weight: 600;">
                    📞 Contactez-les directement au <strong>${contact.phone}</strong>
                </p>
            </div>

            <div class="banner-actions">
                <button type="button" class="banner-btn banner-btn-secondary" onclick="BannerManager.close('${bannerId}')">
                    ✕ Fermer
                </button>
                <button type="button" class="banner-btn banner-btn-primary" onclick="BannerManager._handlePhoneCall('${contact.phone}')">
                    📞 Appeler ${serviceType}
                </button>
                ${contact.website ? `
                <button type="button" class="banner-btn banner-btn-secondary" onclick="window.open('${contact.website}', '_blank')">
                    🌐 Site web
                </button>
                ` : ''}
            </div>
        `;

        banner.addEventListener('click', (e) => e.stopPropagation());
        return banner;
    },

    /**
     * Bannière de confirmation
     */
    _createConfirmationBanner(bannerId, data, config) {
        const banner = Utils.dom.createElement('div', {
            id: bannerId,
            className: 'banner-base banner-confirmation'
        });

        banner.innerHTML = `
            <div class="banner-header">
                <div class="banner-icon">${config.icon}</div>
                <div class="banner-title">${config.title}</div>
            </div>

            <div class="banner-content">
                <div class="banner-info-grid">
                    <div class="banner-info-item">
                        <span class="banner-info-label">🎫 Numéro :</span>
                        <span class="banner-info-value">${data.ticketNumber || 'N/A'}</span>
                    </div>
                    <div class="banner-info-item">
                        <span class="banner-info-label">🏢 Salle :</span>
                        <span class="banner-info-value">${data.room || 'N/A'}</span>
                    </div>
                    <div class="banner-info-item">
                        <span class="banner-info-label">⏰ Créé :</span>
                        <span class="banner-info-value">${Utils.format.time(new Date())}</span>
                    </div>
                </div>

                <p style="margin: 1.5rem 0; font-size: 1.1rem; line-height: 1.4;">
                    Votre ticket a été transmis à l'équipe technique. Vous recevrez une assistance prochainement.
                </p>
                <p style="margin: 1rem 0; font-weight: 600;">
                    📞 Pour un suivi immédiat, appelez le SEA au <strong>${getConfig('CONTACTS.SEA.phone')}</strong>
                </p>
            </div>

            <div class="banner-actions">
                <button type="button" class="banner-btn banner-btn-primary" onclick="BannerManager.close('${bannerId}')">
                    ✅ Fermer
                </button>
            </div>
        `;

        banner.addEventListener('click', (e) => e.stopPropagation());
        return banner;
    },

    /**
     * === GESTION DES ACTIONS ===
     */

    /**
     * Gérer la création de ticket SEA
     */
    async _handleSEATicketCreation(bannerId) {
        const description = document.getElementById(`description_${bannerId}`)?.value?.trim() || '';
        
        try {
            Utils.log.info('Création ticket SEA depuis bannière', { bannerId, description });
            
            // Fermer la bannière SEA
            await this.close(bannerId);
            
            // Créer le ticket via TicketManager
            if (window.TicketManager) {
                await window.TicketManager.createTicket({
                    description: description,
                    source: 'banner'
                });
            } else {
                throw new Error('TicketManager non disponible');
            }

        } catch (error) {
            Utils.log.error('Erreur création ticket:', error);
            // Réafficher une bannière d'erreur
            this.show(getConfig('BANNER_TYPES.SEA'), {
                error: error.message,
                room: window.RoomManager?.getCurrentRoom() || ''
            });
        }
    },

    /**
     * Gérer les appels téléphoniques
     */
    _handlePhoneCall(phoneNumber) {
        Utils.log.info('Tentative appel téléphonique', { phone: phoneNumber });
        
        try {
            // Tenter l'appel direct (fonctionne sur mobile)
            window.open(`tel:${phoneNumber}`, '_self');
        } catch (error) {
            // Fallback: copier le numéro
            Utils.clipboard.copy(phoneNumber).then(success => {
                if (success) {
                    alert(`Numéro ${phoneNumber} copié dans le presse-papiers`);
                } else {
                    alert(`Appelez le ${phoneNumber}`);
                }
            });
        }
    },

    /**
     * Gérer la copie de numéro de ticket
     */
    async _handleCopyTicket(ticketNumber) {
        if (!ticketNumber) {
            alert('Aucun numéro de ticket à copier');
            return;
        }

        const success = await Utils.clipboard.copy(ticketNumber);
        if (success) {
            alert(`Numéro de ticket ${ticketNumber} copié !`);
        } else {
            alert(`Numéro de ticket : ${ticketNumber}`);
        }
    },

    /**
     * === GESTION INTERNE ===
     */

    /**
     * Nettoyer les bannières existantes d'un type
     */
    _cleanup(type) {
        // Nettoyer via l'état interne
        const toRemove = Array.from(this._activeBanners.entries())
            .filter(([_, info]) => info.type === type)
            .map(([id]) => id);

        toRemove.forEach(id => {
            const info = this._activeBanners.get(id);
            if (info && info.element) {
                info.element.remove();
            }
            this._activeBanners.delete(id);
            this._clearAutoClose(id);
        });

        // Nettoyage DOM pour sécurité (éléments orphelins)
        const selectors = [
            `[id^="overlay_${type}_"]`,
            `[id^="${type}_"]`
        ];
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                Utils.log.debug(`Nettoyage DOM orphelin: ${el.id}`);
                el.remove();
            });
        });
    },

    /**
     * Afficher la bannière avec animation
     */
    async _displayBanner(banner, options) {
        // Ajouter au DOM
        document.body.appendChild(banner.overlay);
        
        // Animation d'apparition
        if (options.animated !== false) {
            banner.overlay.style.opacity = '0';
            banner.banner.style.transform = 'scale(0.9) translateY(-20px)';
            
            await Utils.async.wait(10); // Laisser le navigateur traiter
            
            banner.overlay.style.transition = 'opacity 0.3s ease-out';
            banner.banner.style.transition = 'all 0.3s ease-out';
            
            banner.overlay.style.opacity = '1';
            banner.banner.style.transform = 'scale(1) translateY(0)';
        }
    },

    /**
     * Animation de fermeture
     */
    async _animateClose(element) {
        if (!element || !element.parentNode) return;
        
        element.style.transition = 'opacity 0.2s ease-in';
        element.style.opacity = '0';
        
        await Utils.async.wait(200);
    },

    /**
     * Configurer auto-fermeture
     */
    _setupAutoClose(bannerId, delay = null) {
        const autoCloseDelay = delay || getConfig('TIMEOUTS.BANNER_AUTO_CLOSE');
        
        const timer = setTimeout(() => {
            Utils.log.debug(`Auto-fermeture bannière ${bannerId}`);
            this.close(bannerId);
        }, autoCloseDelay);
        
        this._autoCloseTimers.set(bannerId, timer);
    },

    /**
     * Annuler auto-fermeture
     */
    _clearAutoClose(bannerId) {
        const timer = this._autoCloseTimers.get(bannerId);
        if (timer) {
            clearTimeout(timer);
            this._autoCloseTimers.delete(bannerId);
        }
    },

    /**
     * === MÉTHODES UTILITAIRES ===
     */

    /**
     * Obtenir les bannières actives
     */
    getActiveBanners() {
        return Array.from(this._activeBanners.entries()).map(([id, info]) => ({
            id,
            type: info.type,
            createdAt: info.createdAt,
            age: Date.now() - info.createdAt
        }));
    },

    /**
     * Vérifier si une bannière d'un type est active
     */
    hasActiveType(type) {
        return Array.from(this._activeBanners.values()).some(info => info.type === type);
    },

    /**
     * Nettoyer toutes les bannières expirées
     */
    cleanupExpired(maxAge = 300000) { // 5 minutes par défaut
        const now = Date.now();
        const expired = Array.from(this._activeBanners.entries())
            .filter(([_, info]) => (now - info.createdAt) > maxAge)
            .map(([id]) => id);

        expired.forEach(id => this.close(id));
        
        Utils.log.info(`Nettoyage: ${expired.length} bannières expirées supprimées`);
    }
};

// Log d'initialisation
Utils.log.info('Gestionnaire de bannières initialisé');