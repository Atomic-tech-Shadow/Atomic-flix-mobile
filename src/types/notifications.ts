// Types pour le système de notifications moderne ATOMIC FLIX 2025
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  type: 'episode' | 'manga' | 'film' | 'planning';
  timestamp: number;
  read: boolean;
  image: string;
  data: {
    animeId?: string;
    animeTitle?: string;
    episodeNumber?: number;
    seasonNumber?: number;
    chapterNumber?: number;
    language?: string;
    releaseTime?: string;
    screen?: string;
    params?: any;
  };
}

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'low' | 'default' | 'high' | 'max';
  sound: boolean;
  vibration: boolean;
  lights: boolean;
  color: string;
}