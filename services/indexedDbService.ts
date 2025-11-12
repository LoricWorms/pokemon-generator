// services/indexedDbService.ts
import { Pokemon, UserSetting } from '../types';

const DB_NAME = 'PokemonGeneratorDB';
const DB_VERSION = 1; // Increment this to trigger onupgradeneeded
const POKEMON_STORE_NAME = 'pokemon';
const USER_SETTINGS_STORE_NAME = 'userSettings';

let db: IDBDatabase | null = null;

/**
 * Initializes and opens the IndexedDB database.
 * Creates object stores if they don't exist or if the version changes.
 * @returns A Promise that resolves with the IDBDatabase instance.
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
        dbInstance.createObjectStore(POKEMON_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        console.log(`Object store '${POKEMON_STORE_NAME}' created.`);
      }

      if (!dbInstance.objectStoreNames.contains(USER_SETTINGS_STORE_NAME)) {
        dbInstance.createObjectStore(USER_SETTINGS_STORE_NAME, { keyPath: 'key' });
        console.log(`Object store '${USER_SETTINGS_STORE_NAME}' created.`);
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

/**
 * Adds a new Pokémon to the object store.
 * @param pokemonData - The Pokémon data to add (excluding the ID).
 * @returns A Promise that resolves with the newly created Pokemon, including its ID.
 */
export const addPokemon = (pokemonData: Omit<Pokemon, 'id'>): Promise<Pokemon> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDB();
      const transaction = database.transaction([POKEMON_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(POKEMON_STORE_NAME);

      const request = store.add(pokemonData);

      request.onsuccess = () => {
        const addedPokemon: Pokemon = { ...pokemonData, id: request.result as number };
        console.log(`Pokemon added with ID: ${addedPokemon.id}`);
        resolve(addedPokemon);
      };

      request.onerror = (event: Event) => {
        const requestTarget = event.target as IDBRequest;
        console.error(`Error adding Pokémon: ${requestTarget.error?.message}`);
        reject(new Error(`Failed to add Pokémon: ${requestTarget.error?.message}`));
      };

      transaction.onerror = (event: Event) => {
        const transactionTarget = event.target as IDBTransaction;
        console.error(`Transaction error adding Pokémon: ${transactionTarget.error?.message}`);
        reject(new Error(`Transaction failed to add Pokémon: ${transactionTarget.error?.message}`));
      };

    } catch (error: any) {
      reject(error);
    }
  });
};

/**
 * Retrieves all Pokémon from the object store.
 * @returns A Promise that resolves with an array of Pokemon.
 */
export const getAllPokemon = (): Promise<Pokemon[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDB();
      const transaction = database.transaction([POKEMON_STORE_NAME], 'readonly');
      const store = transaction.objectStore(POKEMON_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        console.log('All Pokémon retrieved successfully.');
        resolve(request.result as Pokemon[]);
      };

      request.onerror = (event: Event) => {
        const requestTarget = event.target as IDBRequest;
        console.error(`Error getting all Pokémon: ${requestTarget.error?.message}`);
        reject(new Error(`Failed to get all Pokémon: ${requestTarget.error?.message}`));
      };

      transaction.onerror = (event: Event) => {
        const transactionTarget = event.target as IDBTransaction;
        console.error(`Transaction error getting all Pokémon: ${transactionTarget.error?.message}`);
        reject(new Error(`Transaction failed to get all Pokémon: ${transactionTarget.error?.message}`));
      };

    } catch (error: any) {
      reject(error);
    }
  });
};

/**
 * Deletes a Pokémon from the object store by its ID.
 * @param id - The ID of the Pokémon to delete.
 * @returns A Promise that resolves when the Pokémon is successfully deleted.
 */
export const deletePokemon = (id: number): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDB();
      const transaction = database.transaction([POKEMON_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(POKEMON_STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`Pokémon with ID ${id} deleted successfully.`);
        resolve();
      };

      request.onerror = (event: Event) => {
        const requestTarget = event.target as IDBRequest;
        console.error(`Error deleting Pokémon ${id}: ${requestTarget.error?.message}`);
        reject(new Error(`Failed to delete Pokémon ${id}: ${requestTarget.error?.message}`));
      };

      transaction.onerror = (event: Event) => {
        const transactionTarget = event.target as IDBTransaction;
        console.error(`Transaction error deleting Pokémon ${id}: ${transactionTarget.error?.message}`);
        reject(new Error(`Transaction failed to delete Pokémon ${id}: ${transactionTarget.error?.message}`));
      };

    } catch (error: any) {
      reject(error);
    }
  });
};

/**
 * Retrieves a user setting by its key.
 * @param key - The key of the setting to retrieve (e.g., 'tokens').
 * @returns A Promise that resolves with the UserSetting object or undefined if not found.
 */
export const getUserSetting = (key: string): Promise<UserSetting | undefined> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDB();
      const transaction = database.transaction([USER_SETTINGS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(USER_SETTINGS_STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result as UserSetting | undefined);
      };

      request.onerror = (event: Event) => {
        const requestTarget = event.target as IDBRequest;
        console.error(`Error getting user setting '${key}': ${requestTarget.error?.message}`);
        reject(new Error(`Failed to get user setting '${key}': ${requestTarget.error?.message}`));
      };
    } catch (error: any) {
      reject(error);
    }
  });
};

/**
 * Updates or adds a user setting.
 * @param setting - The UserSetting object to store.
 * @returns A Promise that resolves when the setting is successfully stored.
 */
export const putUserSetting = (setting: UserSetting): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await openDB();
      const transaction = database.transaction([USER_SETTINGS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(USER_SETTINGS_STORE_NAME);
      const request = store.put(setting); // put() can add or update

      request.onsuccess = () => {
        console.log(`User setting '${setting.key}' updated to ${setting.value}.`);
        resolve();
      };

      request.onerror = (event: Event) => {
        const requestTarget = event.target as IDBRequest;
        console.error(`Error putting user setting '${setting.key}': ${requestTarget.error?.message}`);
        reject(new Error(`Failed to put user setting '${setting.key}': ${requestTarget.error?.message}`));
      };

      transaction.onerror = (event: Event) => {
        const transactionTarget = event.target as IDBTransaction;
        console.error(`Transaction error putting user setting '${setting.key}': ${transactionTarget.error?.message}`);
        reject(new Error(`Transaction failed to put user setting '${setting.key}': ${transactionTarget.error?.message}`));
      };
    } catch (error: any) {
      reject(error);
    }
  });
};