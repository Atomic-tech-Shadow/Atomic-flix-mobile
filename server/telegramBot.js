const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
require('dotenv').config();

// Configuration
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = '@Atomic_flix_officiel';
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN manquant dans les variables d\'environnement');
    process.exit(1);
}

// Initialisation du bot
const bot = new TelegramBot(BOT_TOKEN);
const app = express();

app.use(express.json());

// Fonction principale de vérification d'abonnement
async function checkSubscription(userId) {
    try {
        console.log(`🔍 Vérification abonnement pour l'utilisateur ${userId}`);
        
        const member = await bot.getChatMember(CHANNEL_ID, userId);
        const validStatuses = ['member', 'administrator', 'creator'];
        const isSubscribed = validStatuses.includes(member.status);
        
        console.log(`📊 Statut utilisateur ${userId}: ${member.status}`);
        
        return {
            isSubscribed,
            status: member.status,
            userInfo: {
                id: member.user.id,
                username: member.user.username || 'N/A',
                firstName: member.user.first_name || 'N/A',
                lastName: member.user.last_name || 'N/A'
            },
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error.message);
        
        // Gestion des erreurs spécifiques
        if (error.message.includes('user not found')) {
            return {
                isSubscribed: false,
                status: 'user_not_found',
                error: 'Utilisateur non trouvé. L\'utilisateur doit d\'abord interagir avec le bot.'
            };
        }
        
        if (error.message.includes('chat not found')) {
            return {
                isSubscribed: false,
                status: 'channel_not_found',
                error: 'Canal non trouvé. Vérifiez la configuration du canal.'
            };
        }
        
        if (error.message.includes('Unauthorized')) {
            return {
                isSubscribed: false,
                status: 'unauthorized',
                error: 'Token du bot invalide ou bot non autorisé.'
            };
        }
        
        return {
            isSubscribed: false,
            status: 'error',
            error: error.message
        };
    }
}

// Route API pour vérifier l'abonnement
app.post('/api/verify-subscription', async (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ 
            error: 'ID utilisateur requis',
            isSubscribed: false
        });
    }
    
    try {
        const result = await checkSubscription(userId);
        
        // Log pour le débogage
        console.log(`✅ Résultat vérification:`, result);
        
        res.json(result);
    } catch (error) {
        console.error('❌ Erreur serveur:', error);
        res.status(500).json({ 
            error: 'Erreur serveur lors de la vérification',
            isSubscribed: false
        });
    }
});

// Route de santé pour vérifier que le serveur fonctionne
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        botToken: BOT_TOKEN ? 'Configuré' : 'Manquant',
        channelId: CHANNEL_ID
    });
});

// Gestion des commandes du bot Telegram
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;
    
    console.log(`📨 Message reçu de ${userId}: ${text}`);
    
    if (text === '/start') {
        await bot.sendMessage(chatId, 
            `🎬 Bienvenue dans ATOMIC FLIX!\n\n` +
            `Pour vérifier votre abonnement, utilisez la commande /verify\n\n` +
            `Canal officiel: ${CHANNEL_ID}`
        );
    }
    
    if (text === '/verify') {
        const result = await checkSubscription(userId);
        
        if (result.isSubscribed) {
            await bot.sendMessage(chatId,
                `✅ Parfait! Vous êtes bien abonné à ATOMIC FLIX.\n\n` +
                `Statut: ${result.status}\n` +
                `Vous pouvez maintenant utiliser l'application.`
            );
        } else {
            await bot.sendMessage(chatId,
                `❌ Vous n'êtes pas abonné au canal ${CHANNEL_ID}\n\n` +
                `Veuillez d'abord vous abonner, puis réessayez /verify`
            );
        }
    }
    
    if (text === '/info') {
        await bot.sendMessage(chatId,
            `ℹ️ Information ATOMIC FLIX:\n\n` +
            `Canal: ${CHANNEL_ID}\n` +
            `Votre ID: ${userId}\n` +
            `Commandes disponibles:\n` +
            `/start - Démarrer le bot\n` +
            `/verify - Vérifier votre abonnement\n` +
            `/info - Afficher ces informations`
        );
    }
});

// Gestion des erreurs du bot
bot.on('error', (error) => {
    console.error('❌ Erreur bot Telegram:', error);
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`🤖 Bot Telegram actif`);
    console.log(`📱 Canal surveillé: ${CHANNEL_ID}`);
    console.log(`🔗 Endpoint de vérification: http://localhost:${PORT}/api/verify-subscription`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
    console.log('🛑 Arrêt du serveur...');
    bot.stopPolling();
    process.exit(0);
});

module.exports = { bot, checkSubscription };