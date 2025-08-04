/**
 * ========================================
 * VITRINE - CONFIGURATION CENTRALISÉE
 * ========================================
 */

window.VITRINE_CONFIG = {
    // URLs API
    API: {
        BASE_URL: window.location.origin.includes('localhost') 
            ? 'http://localhost:7070' 
            : window.location.origin,
        ENDPOINTS: {
            COPILOT_CHAT: '/api/copilot/vitrine-chat',
            CREATE_TICKET: '/api/copilot/vitrine-create-ticket',
            ROOM_INFO: '/api/podio/public-room-info',
            ROOM_EQUIPMENT: '/api/room/equipment',
            DEVICES_PUBLIC: '/api/devices/public'
        }
    },

    // Délais et timeouts
    TIMEOUTS: {
        ESCALATION_AUTO: 2000,    // 2 secondes pour escalade automatique
        BANNER_AUTO_CLOSE: 5000,  // 5 secondes pour fermeture auto des bannières
        API_REQUEST: 30000,       // 30 secondes pour requêtes API
        BANNER_ANIMATION: 300     // 300ms pour animations bannières
    },

    // Types de bannières
    BANNER_TYPES: {
        SEA: 'sea',
        EXISTING_TICKET: 'existing_ticket',
        AUTO_RESULT: 'auto_result',
        SIM: 'sim',
        SI: 'si',
        CONFIRMATION: 'confirmation'
    },

    // Types de problèmes
    PROBLEM_TYPES: {
        VIDEO: 'video',
        AUDIO: 'audio',
        NETWORK: 'network', 
        SYSTEM: 'system'
    },

    // Messages par défaut
    MESSAGES: {
        LOADING: '🔄 Traitement en cours...',
        CONNECTION_ERROR: '⚠️ Erreur de connexion. Veuillez réessayer.',
        GENERIC_ERROR: '❌ Une erreur est survenue. Contactez le support.',
        ROOM_REQUIRED: '📍 Veuillez d\'abord confirmer votre salle.',
        PROBLEM_REQUIRED: '📝 Veuillez décrire votre problème.',
        ESCALATION_SUCCESS: '🎫 Ticket créé avec succès.',
        AUTO_CORRECTION: '✅ Problème détecté et corrigé automatiquement.'
    },

    // Palette de problèmes
    PROBLEM_PALETTES: [
        {
            id: 'video',
            title: 'Problème Vidéo',
            icon: '📽️',
            description: 'Projecteur, écran, affichage',
            keywords: ['projecteur', 'écran', 'vidéo', 'affichage', 'image']
        },
        {
            id: 'audio',
            title: 'Problème Audio',
            icon: '🔊',
            description: 'Microphones, haut-parleurs, son',
            keywords: ['micro', 'son', 'audio', 'haut-parleur', 'volume']
        },
        {
            id: 'network',
            title: 'Problème Réseau',
            icon: '🌐',
            description: 'Connexion, Wi-Fi, internet',
            keywords: ['réseau', 'wifi', 'internet', 'connexion', 'access']
        },
        {
            id: 'system',
            title: 'Système qui ne répond plus',
            icon: '💻',
            description: 'Ordinateur, système bloqué',
            keywords: ['système', 'ordinateur', 'bloqué', 'planté', 'lent']
        }
    ],

    // Configuration des bannières
    BANNERS: {
        SEA: {
            type: 'sea',
            title: 'Intervention technique requise',
            subtitle: 'Création d\'un ticket SEA',
            icon: '🔧',
            actions: [
                { id: 'close', text: 'Fermer', type: 'secondary' },
                { id: 'create', text: 'Créer un ticket', type: 'primary' }
            ]
        },
        EXISTING_TICKET: {
            type: 'existing_ticket',
            title: 'Ticket déjà créé pour cette salle',
            icon: '🎫',
            actions: [
                { id: 'close', text: 'Fermer', type: 'secondary' },
                { id: 'call', text: 'Appeler SEA', type: 'primary' },
                { id: 'copy', text: 'Copier numéro', type: 'secondary' }
            ]
        },
        AUTO_RESULT: {
            type: 'auto_result',
            title: 'Action Automatique Réussie',
            icon: '✅',
            actions: [
                { id: 'close', text: 'Fermer', type: 'primary' }
            ]
        },
        SIM: {
            type: 'sim',
            title: 'Service des Immeubles',
            subtitle: 'Ce problème relève du Service des Immeubles',
            icon: '🏢',
            actions: [
                { id: 'close', text: 'Fermer', type: 'secondary' },
                { id: 'call', text: 'Appeler SIM', type: 'primary' },
                { id: 'website', text: 'Site web', type: 'secondary' }
            ]
        },
        SI: {
            type: 'si',
            title: 'Services Informatiques',
            subtitle: 'Ce problème relève des Services Informatiques',
            icon: '💻',
            actions: [
                { id: 'close', text: 'Fermer', type: 'secondary' },
                { id: 'call', text: 'Appeler SI', type: 'primary' },
                { id: 'website', text: 'Site web', type: 'secondary' }
            ]
        },
        CONFIRMATION: {
            type: 'confirmation',
            title: 'Ticket créé avec succès',
            icon: '🎉',
            actions: [
                { id: 'close', text: 'Fermer', type: 'primary' }
            ]
        }
    },

    // Contacts
    CONTACTS: {
        SEA: {
            phone: '6135',
            name: 'Service Expert Audiovisuel'
        },
        SIM: {
            phone: '6100',
            name: 'Service des Immeubles',
            website: 'https://sim.uqam.ca/'
        },
        SI: {
            phone: '6200', 
            name: 'Services Informatiques',
            website: 'https://servicesinformatiques.uqam.ca/'
        }
    },

    // Validation
    VALIDATION: {
        ROOM_PATTERN: /^[A-Z]-\d{4}$/,
        MIN_PROBLEM_LENGTH: 10,
        MAX_PROBLEM_LENGTH: 1000,
        REQUIRED_FIELDS: ['room', 'problem']
    },

    // Analytics et logging
    LOGGING: {
        ENABLED: true,
        LEVELS: {
            ERROR: 0,
            WARN: 1, 
            INFO: 2,
            DEBUG: 3
        },
        CURRENT_LEVEL: 2 // INFO par défaut
    },

    // Préfixes pour le localStorage
    STORAGE_KEYS: {
        ROOM_CACHE: 'vitrine_room_cache',
        SESSION_TICKETS: 'vitrine_session_tickets',
        USER_PREFERENCES: 'vitrine_user_prefs',
        LAST_ROOM: 'vitrine_last_room'
    },

    // Classes CSS utilitaires
    CSS_CLASSES: {
        HIDDEN: 'hidden',
        VISIBLE: 'visible',
        FADE_IN: 'fade-in',
        LOADING: 'loading',
        DISABLED: 'disabled',
        PROCESSING: 'processing'
    }
};

// Fonction utilitaire pour récupérer la config
window.getConfig = function(path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], window.VITRINE_CONFIG);
};

// Log de configuration chargée
console.log('🔧 [VITRINE] Configuration chargée:', window.VITRINE_CONFIG);