// Configuration API Telegram pour ATOMIC FLIX
const API_BASE_URL = 'https://your-backend-url.com'; // À remplacer par votre URL backend

/**
 * Vérifie l'abonnement Telegram d'un utilisateur
 * @param {string} userId - ID de l'utilisateur Telegram
 * @returns {Promise<Object>} Résultat de la vérification
 */
export const verifyTelegramSubscription = async (userId) => {
    try {
        console.log(`🔍 Vérification abonnement pour l'utilisateur: ${userId}`);
        
        const response = await fetch(`${API_BASE_URL}/api/verify-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
            timeout: 10000, // 10 secondes de timeout
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Résultat vérification:', data);
        
        return {
            isSubscribed: data.isSubscribed || false,
            status: data.status || 'unknown',
            userInfo: data.userInfo || null,
            timestamp: data.timestamp || new Date().toISOString(),
            error: data.error || null
        };
    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
        
        return {
            isSubscribed: false,
            status: 'network_error',
            error: error.message || 'Erreur réseau inconnue',
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Génère un lien d'authentification Telegram
 * @param {string} botUsername - Username du bot (sans @)
 * @returns {string} Lien d'authentification
 */
export const generateTelegramAuthLink = (botUsername = 'atomic_flix_verifier_bot') => {
    const startPayload = `auth_${Date.now()}`;
    return `https://t.me/${botUsername}?start=${startPayload}`;
};

/**
 * Ouvre l'application Telegram pour l'authentification
 * @param {string} botUsername - Username du bot
 */
export const openTelegramAuth = async (botUsername = 'atomic_flix_verifier_bot') => {
    const authLink = generateTelegramAuthLink(botUsername);
    
    try {
        const { Linking } = require('react-native');
        const supported = await Linking.canOpenURL(authLink);
        
        if (supported) {
            await Linking.openURL(authLink);
            return true;
        } else {
            console.warn('❌ Impossible d\'ouvrir Telegram');
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'ouverture de Telegram:', error);
        return false;
    }
};

/**
 * Vérifie si l'utilisateur est authentifié localement
 * @returns {Promise<boolean>} État d'authentification
 */
export const isUserAuthenticated = async () => {
    try {
        const { AsyncStorage } = require('@react-native-async-storage/async-storage');
        const verified = await AsyncStorage.getItem('telegram_verified');
        return verified === 'true';
    } catch (error) {
        console.error('❌ Erreur lecture AsyncStorage:', error);
        return false;
    }
};

/**
 * Marque l'utilisateur comme authentifié localement
 * @returns {Promise<void>}
 */
export const markUserAsAuthenticated = async () => {
    try {
        const { AsyncStorage } = require('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem('telegram_verified', 'true');
        console.log('✅ Utilisateur marqué comme authentifié');
    } catch (error) {
        console.error('❌ Erreur sauvegarde AsyncStorage:', error);
    }
};

/**
 * Réinitialise l'authentification locale
 * @returns {Promise<void>}
 */
export const resetAuthentication = async () => {
    try {
        const { AsyncStorage } = require('@react-native-async-storage/async-storage');
        await AsyncStorage.removeItem('telegram_verified');
        console.log('🔄 Authentification réinitialisée');
    } catch (error) {
        console.error('❌ Erreur reset AsyncStorage:', error);
    }
};

/**
 * Simule une vérification d'abonnement (pour développement)
 * @returns {Promise<Object>} Résultat simulé
 */
export const simulateSubscriptionCheck = async () => {
    console.log('🎭 Simulation vérification abonnement');
    
    // Simule un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
        isSubscribed: true,
        status: 'member',
        userInfo: {
            id: 'simulated_user',
            username: 'test_user',
            firstName: 'Test',
            lastName: 'User'
        },
        timestamp: new Date().toISOString(),
        simulation: true
    };
};

// Configuration par défaut
export const TELEGRAM_CONFIG = {
    botUsername: 'atomic_flix_verifier_bot',
    channelId: '@Atomic_flix_officiel',
    channelUrl: 'https://t.me/Atomic_flix_officiel',
    apiTimeout: 10000,
    retryAttempts: 3
};

export default {
    verifyTelegramSubscription,
    generateTelegramAuthLink,
    openTelegramAuth,
    isUserAuthenticated,
    markUserAsAuthenticated,
    resetAuthentication,
    simulateSubscriptionCheck,
    TELEGRAM_CONFIG
};