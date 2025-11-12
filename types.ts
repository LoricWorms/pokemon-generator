
export interface Pokemon {
  id: number; // IndexedDB key, autoIncrement
  image_base64: string;
  name: string;
  rarity: PokemonRarity; // Use enum for rarity
  generated_at: string; // ISO 8601 string
}

// FIX: Make UserSetting more flexible to support different keys and value types
export interface UserSetting {
  key: string; // Changed from 'tokens' to 'string' to allow other setting keys
  value: any;    // Changed from 'number' to 'any' to allow different types of values
}

export enum PokemonRarity {
  F = 'F',
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S',
  S_PLUS = 'S+',
}

export interface PokemonApiResponse {
  image_base64: string;
  name: string;
  rarity: PokemonRarity; // Use enum for rarity
  generated_at: string;
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
}

export enum SortOrder {
  DATE_DESC = 'date-desc',
  DATE_ASC = 'date-asc',
  RARITY_DESC = 'rarity-desc',
  RARITY_ASC = 'rarity-asc',
}

// Example image link for Pikachu, used for general UI branding
export const PIKACHU_IMAGE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png";
