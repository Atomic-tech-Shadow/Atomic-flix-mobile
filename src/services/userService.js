import AsyncStorage from '@react-native-async-storage/async-storage';

class UserService {
  static USER_ID_KEY = '@atomic_flix_user_id';

  // Générer un ID utilisateur unique
  static generateUserId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `user_${timestamp}_${random}`;
  }

  // Obtenir l'ID utilisateur (créer si n'existe pas)
  static async getUserId() {
    try {
      let userId = await AsyncStorage.getItem(this.USER_ID_KEY);
      
      if (!userId) {
        userId = this.generateUserId();
        await AsyncStorage.setItem(this.USER_ID_KEY, userId);
        console.log('✅ New user ID generated:', userId);
      }
      
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      // Fallback pour les erreurs de stockage
      return this.generateUserId();
    }
  }

  // Réinitialiser l'ID utilisateur (pour tests ou déconnexion)
  static async resetUserId() {
    try {
      await AsyncStorage.removeItem(this.USER_ID_KEY);
      return this.getUserId(); // Générer un nouvel ID
    } catch (error) {
      console.error('Error resetting user ID:', error);
      return this.generateUserId();
    }
  }

  // Obtenir les informations utilisateur stockées
  static async getUserInfo() {
    try {
      const userId = await this.getUserId();
      const isFirstLaunch = !(await AsyncStorage.getItem('@atomic_flix_first_launch_done'));
      
      return {
        userId,
        isFirstLaunch,
        hasShownVerificationModal: await AsyncStorage.getItem('@atomic_flix_verification_shown') === 'true'
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      return {
        userId: this.generateUserId(),
        isFirstLaunch: true,
        hasShownVerificationModal: false
      };
    }
  }

  // Marquer la première ouverture comme terminée
  static async markFirstLaunchDone() {
    try {
      await AsyncStorage.setItem('@atomic_flix_first_launch_done', 'true');
    } catch (error) {
      console.error('Error marking first launch done:', error);
    }
  }

  // Marquer la modal de vérification comme affichée
  static async markVerificationShown() {
    try {
      await AsyncStorage.setItem('@atomic_flix_verification_shown', 'true');
    } catch (error) {
      console.error('Error marking verification shown:', error);
    }
  }
}

export default UserService;