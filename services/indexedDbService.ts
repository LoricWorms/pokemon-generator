// services/indexedDbService.ts
import { Pokemon, UserSetting, SessionScore, POKEMON_STORE_NAME, USER_SETTINGS_STORE_NAME, SESSION_SCORES_STORE_NAME } from '../types';

const DB_NAME = 'PokemonGeneratorDB';
const DB_VERSION = 4; // Incremented for adding indexes

let db: IDBDatabase | null = null;

/**
 * Initializes and opens the IndexedDB database.
 * Creates object stores and indexes if they don't exist.
 */
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const dbTarget = event.target as IDBOpenDBRequest;
      const dbInstance = dbTarget.result;

      if (!dbInstance.objectStoreNames.contains(POKEMON_STORE_NAME)) {
        const store = dbInstance.createObjectStore(POKEMON_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        // Optimization: Add indexes for faster filtering and sorting
        store.createIndex('rarity', 'rarity', { unique: false });
        store.createIndex('score', 'score', { unique: false });
        store.createIndex('created_at', 'created_at', { unique: false });
        console.log(`Object store '${POKEMON_STORE_NAME}' created with indexes.`);
      } else {
        // Migration: If store exists but indexes don't (for older versions)
        const transaction = dbTarget.transaction!;
        const store = transaction.objectStore(POKEMON_STORE_NAME);
        if (!store.indexNames.contains('rarity')) store.createIndex('rarity', 'rarity', { unique: false });
        if (!store.indexNames.contains('score')) store.createIndex('score', 'score', { unique: false });
        if (!store.indexNames.contains('created_at')) store.createIndex('created_at', 'created_at', { unique: false });
      }

      if (!dbInstance.objectStoreNames.contains(USER_SETTINGS_STORE_NAME)) {
        dbInstance.createObjectStore(USER_SETTINGS_STORE_NAME, { keyPath: 'key' });
        console.log(`Object store '${USER_SETTINGS_STORE_NAME}' created.`);
      }

      if (!dbInstance.objectStoreNames.contains(SESSION_SCORES_STORE_NAME)) {
        dbInstance.createObjectStore(SESSION_SCORES_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        console.log(`Object store '${SESSION_SCORES_STORE_NAME}' created.`);
      }
    };

    request.onsuccess = (event: Event) => {
      const dbTarget = event.target as IDBOpenDBRequest;
      db = dbTarget.result;
      console.log(`IndexedDB '${DB_NAME}' opened successfully.`);
      resolve(db);
    };

    request.onerror = (event: Event) => {
      const requestTarget = event.target as IDBRequest;
      console.error(`Error opening IndexedDB: ${requestTarget.error?.message}`);
      reject(new Error(`Failed to open IndexedDB: ${requestTarget.error?.message}`));
    };
  });
};

export const addPokemon = (pokemonData: Omit<Pokemon, 'id'>): Promise<Pokemon> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDB();
      const transaction = database.transaction([POKEMON_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(POKEMON_STORE_NAME);
      const request = store.add(pokemonData);
      request.onsuccess = () => resolve({ ...pokemonData, id: request.result as number });
      request.onerror = () => reject(new Error('Failed to add pokemon'));
    } catch (error) { reject(error); }
  });
};

export const getAllPokemon = (): Promise<Pokemon[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDB();
      const transaction = database.transaction([POKEMON_STORE_NAME], 'readonly');
      const store = transaction.objectStore(POKEMON_STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as Pokemon[]);
      request.onerror = () => reject(new Error('Failed to get all pokemon'));
    } catch (error) { reject(error); }
  });
};

export const deletePokemon = (id: number): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDB();
      const transaction = database.transaction([POKEMON_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(POKEMON_STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete pokemon'));
    } catch (error) { reject(error); }
  });
};

export const getUserSetting = (key: string): Promise<UserSetting | undefined> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDB();
      const transaction = database.transaction([USER_SETTINGS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(USER_SETTINGS_STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result as UserSetting | undefined);
      request.onerror = () => reject(new Error(`Failed to get setting ${key}`));
    } catch (error) { reject(error); }
  });
};

export const putUserSetting = (setting: UserSetting): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDB();
      const transaction = database.transaction([USER_SETTINGS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(USER_SETTINGS_STORE_NAME);
      const request = store.put(setting);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to put setting ${setting.key}`));
    } catch (error) { reject(error); }
  });
};

export const addSessionScore = (sessionScoreData: Omit<SessionScore, 'id'>): Promise<SessionScore> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDB();
      const transaction = database.transaction([SESSION_SCORES_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(SESSION_SCORES_STORE_NAME);
      const request = store.add(sessionScoreData);
      request.onsuccess = () => resolve({ ...sessionScoreData, id: request.result as number });
      request.onerror = () => reject(new Error('Failed to add session score'));
    } catch (error) { reject(error); }
  });
};

export const getTopSessionScores = (limit: number = 5): Promise<SessionScore[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDB();
      const transaction = database.transaction([SESSION_SCORES_STORE_NAME], 'readonly');
      const store = transaction.objectStore(SESSION_SCORES_STORE_NAME);
      const request = store.getAll(); // Using getAll for top N is fine for small leaderboards
      request.onsuccess = () => {
        const sorted = (request.result as SessionScore[]).sort((a, b) => b.score - a.score).slice(0, limit);
        resolve(sorted);
      };
      request.onerror = () => reject(new Error('Failed to get scores'));
    } catch (error) { reject(error); }
  });
};