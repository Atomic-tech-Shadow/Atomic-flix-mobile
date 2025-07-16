/**
 * Test du système de notifications automatiques - ATOMIC FLIX
 * Simule l'ajout de nouveaux épisodes pour tester les notifications
 */

const NotificationService = require('./src/utils/notificationService.ts');

async function testNotificationSystem() {
  console.log('🔔 TEST DU SYSTÈME DE NOTIFICATIONS AUTOMATIQUES');
  console.log('================================================');
  
  const notificationService = NotificationService.default.getInstance();
  
  // Activer les notifications pour le test
  await notificationService.saveSettings({
    enabled: true,
    newEpisodes: true,
    newMangas: true
  });
  
  console.log('✅ Notifications activées pour le test');
  
  // Simuler un contenu initial
  const initialContent = [
    {
      id: 'anime-1',
      title: 'Attack on Titan',
      type: 'anime',
      status: 'En cours',
      image: 'test.jpg',
      url: 'test-url'
    },
    {
      id: 'manga-1', 
      title: 'One Piece',
      type: 'manga',
      status: 'En cours',
      image: 'test.jpg',
      url: 'test-url'
    }
  ];
  
  console.log('📊 Contenu initial détecté:', initialContent.length, 'éléments');
  await notificationService.detectNewEpisodes(initialContent);
  
  // Simuler l'ajout de nouveaux épisodes
  setTimeout(async () => {
    const newContent = [
      ...initialContent,
      {
        id: 'anime-2',
        title: 'Demon Slayer - Nouveau Episode !',
        type: 'anime',
        status: 'Nouveau',
        image: 'test2.jpg',
        url: 'test-url-2'
      },
      {
        id: 'manga-2',
        title: 'Naruto - Chapitre inédit',
        type: 'manga', 
        status: 'Nouveau',
        image: 'test3.jpg',
        url: 'test-url-3'
      }
    ];
    
    console.log('🆕 Nouveau contenu détecté:', newContent.length, 'éléments');
    await notificationService.detectNewEpisodes(newContent);
    
    // Vérifier les notifications créées
    const notifications = await notificationService.getNotifications();
    const unreadCount = await notificationService.getUnreadCount();
    
    console.log('📋 Notifications créées:', notifications.length);
    console.log('🔴 Notifications non lues:', unreadCount);
    
    if (notifications.length > 0) {
      console.log('✅ SYSTÈME DE NOTIFICATIONS FONCTIONNEL !');
      notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.message}`);
      });
    } else {
      console.log('❌ Aucune notification créée');
    }
    
  }, 2000);
}

if (require.main === module) {
  testNotificationSystem().catch(console.error);
}

module.exports = { testNotificationSystem };