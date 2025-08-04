/**
 * ========================================
 * VITRINE - UTILITAIRES COMMUNS
 * ========================================
 */

window.VitrineUtils = {
    /**
     * Logging unifié
     */
    log: {
        error: function(message, data = null) {
            if (getConfig('LOGGING.CURRENT_LEVEL') >= getConfig('LOGGING.LEVELS.ERROR')) {
                console.error(`❌ [VITRINE] ${message}`, data || '');
            }
        },
        warn: function(message, data = null) {
            if (getConfig('LOGGING.CURRENT_LEVEL') >= getConfig('LOGGING.LEVELS.WARN')) {
                console.warn(`⚠️ [VITRINE] ${message}`, data || '');
            }
        },
        info: function(message, data = null) {
            if (getConfig('LOGGING.CURRENT_LEVEL') >= getConfig('LOGGING.LEVELS.INFO')) {
                console.log(`ℹ️ [VITRINE] ${message}`, data || '');
            }
        },
        debug: function(message, data = null) {
            if (getConfig('LOGGING.CURRENT_LEVEL') >= getConfig('LOGGING.LEVELS.DEBUG')) {
                console.debug(`🔍 [VITRINE] ${message}`, data || '');
            }
        }
    },

    /**
     * Gestion du localStorage
     */
    storage: {
        get: function(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(getConfig(`STORAGE_KEYS.${key.toUpperCase()}`));
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                VitrineUtils.log.error(`Erreur lecture localStorage pour ${key}:`, error);
                return defaultValue;
            }
        },
        set: function(key, value) {
            try {
                localStorage.setItem(getConfig(`STORAGE_KEYS.${key.toUpperCase()}`), JSON.stringify(value));
                return true;
            } catch (error) {
                VitrineUtils.log.error(`Erreur écriture localStorage pour ${key}:`, error);
                return false;
            }
        },
        remove: function(key) {
            try {
                localStorage.removeItem(getConfig(`STORAGE_KEYS.${key.toUpperCase()}`));
                return true;
            } catch (error) {
                VitrineUtils.log.error(`Erreur suppression localStorage pour ${key}:`, error);
                return false;
            }
        },
        clear: function() {
            try {
                const keys = Object.values(getConfig('STORAGE_KEYS'));
                keys.forEach(key => localStorage.removeItem(key));
                return true;
            } catch (error) {
                VitrineUtils.log.error('Erreur nettoyage localStorage:', error);
                return false;
            }
        }
    },

    /**
     * Validation de données
     */
    validation: {
        isValidRoom: function(room) {
            if (!room || typeof room !== 'string') return false;
            return getConfig('VALIDATION.ROOM_PATTERN').test(room.trim().toUpperCase());
        },
        isValidProblem: function(problem) {
            if (!problem || typeof problem !== 'string') return false;
            const trimmed = problem.trim();
            const minLength = getConfig('VALIDATION.MIN_PROBLEM_LENGTH');
            const maxLength = getConfig('VALIDATION.MAX_PROBLEM_LENGTH');
            return trimmed.length >= minLength && trimmed.length <= maxLength;
        },
        sanitizeInput: function(input) {
            if (!input || typeof input !== 'string') return '';
            return input.trim().replace(/[<>\"']/g, '');
        },
        validateRequired: function(data, requiredFields = null) {
            const fields = requiredFields || getConfig('VALIDATION.REQUIRED_FIELDS');
            const missing = [];
            fields.forEach(field => {
                if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
                    missing.push(field);
                }
            });
            return {
                isValid: missing.length === 0,
                missing: missing
            };
        }
    },

    /**
     * Manipulation DOM
     */
    dom: {
        createElement: function(tag, attributes = {}, textContent = '') {
            const element = document.createElement(tag);
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'style' && typeof value === 'object') {
                    Object.assign(element.style, value);
                } else {
                    element.setAttribute(key, value);
                }
            });
            if (textContent) element.textContent = textContent;
            return element;
        },
        removeAllChildren: function(element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        },
        addClasses: function(element, ...classes) {
            element.classList.add(...classes);
        },
        removeClasses: function(element, ...classes) {
            element.classList.remove(...classes);
        },
        toggleClass: function(element, className, force = null) {
            return element.classList.toggle(className, force);
        },
        show: function(element) {
            element.classList.remove(getConfig('CSS_CLASSES.HIDDEN'));
            element.classList.add(getConfig('CSS_CLASSES.VISIBLE'));
        },
        hide: function(element) {
            element.classList.add(getConfig('CSS_CLASSES.HIDDEN'));
            element.classList.remove(getConfig('CSS_CLASSES.VISIBLE'));
        },
        setLoading: function(element, isLoading = true) {
            VitrineUtils.dom.toggleClass(element, getConfig('CSS_CLASSES.LOADING'), isLoading);
        },
        setDisabled: function(element, isDisabled = true) {
            VitrineUtils.dom.toggleClass(element, getConfig('CSS_CLASSES.DISABLED'), isDisabled);
            if (element.tagName === 'BUTTON' || element.tagName === 'INPUT') {
                element.disabled = isDisabled;
            }
        }
    },

    /**
     * Gestion des événements
     */
    events: {
        debounce: function(func, wait, immediate = false) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func.apply(this, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(this, args);
            };
        },
        throttle: function(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        once: function(element, event, callback) {
            const handler = function(e) {
                callback.call(this, e);
                element.removeEventListener(event, handler);
            };
            element.addEventListener(event, handler);
        }
    },

    /**
     * Utilitaires de formatage
     */
    format: {
        date: function(date, options = {}) {
            const defaultOptions = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(date).toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
        },
        time: function(date) {
            return new Date(date).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        truncate: function(text, maxLength = 100, suffix = '...') {
            if (!text || text.length <= maxLength) return text;
            return text.substring(0, maxLength - suffix.length) + suffix;
        },
        capitalize: function(text) {
            if (!text) return '';
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        },
        phoneFormat: function(phone) {
            // Format simple pour les numéros courts (6135 -> 6135)
            if (!phone) return '';
            return phone.toString().replace(/\D/g, '');
        }
    },

    /**
     * Utilitaires asynchrones
     */
    async: {
        wait: function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        withTimeout: function(promise, timeoutMs, errorMessage = 'Timeout') {
            return Promise.race([
                promise,
                new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
                })
            ]);
        },
        retry: async function(fn, maxAttempts = 3, delay = 1000) {
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    return await fn();
                } catch (error) {
                    VitrineUtils.log.warn(`Tentative ${attempt}/${maxAttempts} échouée:`, error.message);
                    if (attempt === maxAttempts) throw error;
                    await VitrineUtils.async.wait(delay * attempt);
                }
            }
        }
    },

    /**
     * Détection de problèmes
     */
    problemDetection: {
        isVideoProblem: function(message) {
            const videoKeywords = ['projecteur', 'écran', 'vidéo', 'affichage', 'image', 'visual'];
            return this._containsKeywords(message, videoKeywords);
        },
        isAudioProblem: function(message) {
            const audioKeywords = ['micro', 'son', 'audio', 'haut-parleur', 'volume', 'sound'];
            return this._containsKeywords(message, audioKeywords);
        },
        isNetworkProblem: function(message) {
            const networkKeywords = ['réseau', 'wifi', 'internet', 'connexion', 'network'];
            return this._containsKeywords(message, networkKeywords);
        },
        isSystemProblem: function(message) {
            const systemKeywords = ['système', 'ordinateur', 'bloqué', 'planté', 'lent', 'computer'];
            return this._containsKeywords(message, systemKeywords);
        },
        _containsKeywords: function(message, keywords) {
            if (!message) return false;
            const lowerMessage = message.toLowerCase();
            return keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
        },
        getProblemType: function(message) {
            if (this.isVideoProblem(message)) return getConfig('PROBLEM_TYPES.VIDEO');
            if (this.isAudioProblem(message)) return getConfig('PROBLEM_TYPES.AUDIO');
            if (this.isNetworkProblem(message)) return getConfig('PROBLEM_TYPES.NETWORK');
            if (this.isSystemProblem(message)) return getConfig('PROBLEM_TYPES.SYSTEM');
            return null;
        }
    },

    /**
     * Utilitaires de génération
     */
    generate: {
        id: function(prefix = '') {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 8);
            return `${prefix}${prefix ? '_' : ''}${timestamp}_${random}`;
        },
        ticketNumber: function() {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
            return `SEA-${year}${month}${day}-${random}`;
        }
    },

    /**
     * Copie vers le presse-papiers
     */
    clipboard: {
        copy: async function(text) {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    return true;
                } else {
                    // Fallback pour les navigateurs non sécurisés
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    const success = document.execCommand('copy');
                    textArea.remove();
                    return success;
                }
            } catch (error) {
                VitrineUtils.log.error('Erreur copie presse-papiers:', error);
                return false;
            }
        }
    }
};

// Export global
window.Utils = window.VitrineUtils;

// Log d'initialisation
VitrineUtils.log.info('Utilitaires chargés et prêts');