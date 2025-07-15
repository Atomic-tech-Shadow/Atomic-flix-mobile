// Types identiques au site web pour assurer la synchronisation
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  type: string;
  status: string;
  image: string;
}

export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
  streamingSources?: VideoSource[];
}

export interface VideoSource {
  url: string;
  server: string;
  quality: string;
  language: string;
  type: string;
  serverIndex: number;
}

export interface Season {
  number: number;
  name: string;
  value: string;
  languages: string[];
  episodeCount: number;
  url: string;
  available: boolean;
}

export interface AnimeData {
  id: string;
  title: string;
  synopsis: string;
  image: string;
  genres: string[];
  status: string;
  year: string;
  seasons: Season[];
  url: string;
}

export interface EpisodeDetails {
  id: string;
  title: string;
  animeTitle: string;
  episodeNumber: number;
  sources: VideoSource[];
  availableServers: string[];
  url: string;
}

export interface MangaChapter {
  id: string;
  title: string;
  number: number;
  url: string;
  pages: string[];
  available: boolean;
  language: string;
}

export interface MangaSeason {
  number: number;
  name: string;
  value: string;
  type: string;
  languages: string[];
  available: boolean;
  contentType: string;
  url: string;
  fullUrl: string;
}

export interface MangaData {
  id: string;
  title: string;
  synopsis: string;
  image: string;
  genres: string[];
  status: string;
  year: string;
  seasons: MangaSeason[];
  url: string;
}