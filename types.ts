export interface Pokemon {
  id: number; // IndexedDB key, autoIncrement
  name: string;
  rarity: PokemonRarity;
  image_url: string;
  score: number; // Value for Pokedex score / sale value
  created_at: string; // ISO 8601 string
}

export enum PokemonRarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
}

export interface PokemonApiResponse {
  name: string;
  url: string;
}

export enum SortOrder {
  DATE_ASC = 'Date (oldest first)',
  DATE_DESC = 'Date (newest first)',
  SCORE_ASC = 'Score (low to high)',
  SCORE_DESC = 'Score (high to low)',
}

export interface UserSetting {
  key: string;
  value: any;
}

export enum DBStatus {
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  ERROR = 'ERROR',
}

export enum AlertType {
  INFO = 'INFO',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
}

export interface AppAlert {
  type: AlertType;
  message: string;
  isOpen: boolean;
  title: string;
}

export interface SessionScore {
  id?: number; // IndexedDB key, autoIncrement
  score: number;
  date: string; // ISO 8601 string
  nickname?: string; // Added optional nickname field
}

export enum View {
  HOME = 'HOME',
  COLLECTION = 'COLLECTION',
  RANKING = 'RANKING',
}

export const PIKACHU_IMAGE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';

export const ACCUMULATED_SALE_PROFIT_KEY = 'accumulatedSaleProfit';
export const SESSION_SCORES_STORE_NAME = 'sessionScores';
// Add constants for IndexedDB store names
export const POKEMON_STORE_NAME = 'pokemons';
export const USER_SETTINGS_STORE_NAME = 'userSettings';