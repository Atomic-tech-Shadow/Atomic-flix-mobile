const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Commande /update pour diffuser une mise à jour
bot.onText(/\/update (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Vérifier si l'utilisateur est admin/créateur
  const isAdmin = await checkAdminPermissions(userId);
  if (!isAdmin) {
    await bot.sendMessage(chatId, '❌ Vous n\'avez pas les permissions pour cette commande.');
    return;
  }

  const downloadUrl = match[1];
  
  try {
    // Extraire infos de l'URL APKPure si possible
    const updateInfo = await extractUpdateInfo(downloadUrl);
    
    // Confirmer avec l'admin avant diffusion
    const confirmMessage = `🚀 DIFFUSION MISE À JOUR\n\n` +
                          `📱 Lien: ${downloadUrl}\n` +
                          `📊 Utilisateurs ciblés: ${await getVerifiedUsersCount()}\n\n` +
                          `Confirmer la diffusion ?`;
    
    await bot.sendMessage(chatId, confirmMessage, {
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Confirmer diffusion', callback_data: `confirm_update:${downloadUrl}` },
          { text: '❌ Annuler', callback_data: 'cancel_update' }
        ]]
      }
    });

  } catch (error) {
    console.error('Erreur commande /update:', error);
    await bot.sendMessage(chatId, '❌ Erreur lors de la préparation de la mise à jour.');
  }
});

// Gestion des callbacks de confirmation
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  if (data.startsWith('confirm_update:')) {
    const downloadUrl = data.replace('confirm_update:', '');
    
    try {
      // Diffuser à tous les utilisateurs vérifiés
      const result = await broadcastUpdateToAllUsers(downloadUrl);
      
      await bot.editMessageText(
        `✅ MISE À JOUR DIFFUSÉE\n\n` +
        `📤 Envoyé à: ${result.sent} utilisateurs\n` +
        `❌ Échecs: ${result.failed}\n` +
        `⏱️ Durée: ${result.duration}ms`,
        {
          chat_id: chatId,
          message_id: callbackQuery.message.message_id
        }
      );
      
    } catch (error) {
      console.error('Erreur diffusion:', error);
      await bot.editMessageText(
        '❌ Erreur lors de la diffusion de la mise à jour.',
        {
          chat_id: chatId,
          message_id: callbackQuery.message.message_id
        }
      );
    }
  }
  
  if (data === 'cancel_update') {
    await bot.editMessageText(
      '🚫 Diffusion annulée.',
      {
        chat_id: chatId,
        message_id: callbackQuery.message.message_id
      }
    );
  }
  
  await bot.answerCallbackQuery(callbackQuery.id);
});

// Diffuser la mise à jour à tous les utilisateurs vérifiés
async function broadcastUpdateToAllUsers(downloadUrl) {
  const startTime = Date.now();
  let sent = 0;
  let failed = 0;
  
  try {
    // Récupérer tous les utilisateurs vérifiés
    const { data: users, error } = await supabase
      .from('verified_users')
      .select('telegram_id, username');
    
    if (error) throw error;
    
    // Message de mise à jour
    const updateMessage = `🎉 NOUVELLE MISE À JOUR ATOMIC FLIX !\n\n` +
                         `✨ Une nouvelle version est disponible sur APKPure\n\n` +
                         `📱 Fonctionnalités améliorées:\n` +
                         `• Performance optimisée\n` +
                         `• Corrections de bugs\n` +
                         `• Nouvelles fonctionnalités\n\n` +
                         `⬇️ Téléchargez maintenant pour profiter des dernières améliorations !`;
    
    // Envoyer à tous les utilisateurs (par batch pour éviter rate limit)
    const batchSize = 30; // Telegram limite : 30 messages/seconde
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const promises = batch.map(async (user) => {
        try {
          await bot.sendMessage(user.telegram_id, updateMessage, {
            reply_markup: {
              inline_keyboard: [[
                { text: '📥 Télécharger APK', url: downloadUrl },
                { text: '📰 Voir sur APKPure', url: 'https://apkpure.com/fr/atomic-flix/com.atomicflix.mobile' }
              ]]
            }
          });
          sent++;
        } catch (error) {
          console.error(`Erreur envoi à ${user.telegram_id}:`, error.message);
          failed++;
        }
      });
      
      await Promise.all(promises);
      
      // Pause entre batches pour respecter rate limit
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const duration = Date.now() - startTime;
    
    return { sent, failed, duration };
    
  } catch (error) {
    console.error('Erreur diffusion globale:', error);
    throw error;
  }
}

// Extraire infos de mise à jour depuis URL APKPure
async function extractUpdateInfo(url) {
  // Version basique - peut être améliorée avec scraping
  return {
    version: 'Dernière version',
    source: 'APKPure',
    url: url
  };
}

// Vérifier permissions admin
async function checkAdminPermissions(userId) {
  // IDs des admins autorisés (à configurer)
  const adminIds = [
    123456789, // Votre ID Telegram
    // Ajouter d'autres admins si nécessaire
  ];
  
  return adminIds.includes(userId);
}

// Compter utilisateurs vérifiés
async function getVerifiedUsersCount() {
  try {
    const { count, error } = await supabase
      .from('verified_users')
      .select('*', { count: 'exact', head: true });
    
    return error ? 0 : count;
  } catch (error) {
    return 0;
  }
}

// Commande de statistiques pour admin
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  const isAdmin = await checkAdminPermissions(userId);
  if (!isAdmin) {
    await bot.sendMessage(chatId, '❌ Vous n\'avez pas les permissions pour cette commande.');
    return;
  }
  
  try {
    const totalUsers = await getVerifiedUsersCount();
    const { data: recentUsers } = await supabase
      .from('verified_users')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    const statsMessage = `📊 STATISTIQUES ATOMIC FLIX\n\n` +
                        `👥 Utilisateurs vérifiés: ${totalUsers}\n` +
                        `📈 Nouveaux (7 jours): ${recentUsers?.length || 0}\n` +
                        `🤖 Bot version: 2.0\n` +
                        `📱 App version: 3.7.0`;
    
    await bot.sendMessage(chatId, statsMessage);
    
  } catch (error) {
    await bot.sendMessage(chatId, '❌ Erreur lors de la récupération des statistiques.');
  }
});

console.log('🤖 Bot Telegram ATOMIC FLIX démarré avec système de diffusion /update');

module.exports = { bot };