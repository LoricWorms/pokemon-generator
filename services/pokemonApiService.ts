// services/pokemonApiService.ts
import { Pokemon, PokemonRarity, PokemonApiResponse } from '../types';

const POKEMON_NAMES_API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=100'; // Fetching first 100 Pokémon names

interface RarityDetails {
  rarity: PokemonRarity;
  minScore: number;
  maxScore: number;
}

export const RARITY_PROBABILITIES: { rarity: PokemonRarity; probability: number }[] = [
  { rarity: PokemonRarity.COMMON, probability: 0.50 },
  { rarity: PokemonRarity.UNCOMMON, probability: 0.25 },
  { rarity: PokemonRarity.RARE, probability: 0.15 },
  { rarity: PokemonRarity.EPIC, probability: 0.07 },
  { rarity: PokemonRarity.LEGENDARY, probability: 0.03 },
];

export const POKEMON_RARITY_DETAILS: Record<PokemonRarity, RarityDetails> = {
  [PokemonRarity.COMMON]: { rarity: PokemonRarity.COMMON, minScore: 10, maxScore: 50 },
  [PokemonRarity.UNCOMMON]: { rarity: PokemonRarity.UNCOMMON, minScore: 51, maxScore: 100 },
  [PokemonRarity.RARE]: { rarity: PokemonRarity.RARE, minScore: 101, maxScore: 200 },
  [PokemonRarity.EPIC]: { rarity: PokemonRarity.EPIC, minScore: 201, maxScore: 400 },
  [PokemonRarity.LEGENDARY]: { rarity: PokemonRarity.LEGENDARY, minScore: 401, maxScore: 800 },
};

// Define sale values based on rarity
export const RARITY_SALE_VALUES: Record<PokemonRarity, number> = {
  [PokemonRarity.COMMON]: 5,
  [PokemonRarity.UNCOMMON]: 15,
  [PokemonRarity.RARE]: 30,
  [PokemonRarity.EPIC]: 60,
  [PokemonRarity.LEGENDARY]: 100,
};

let pokemonNameCache: PokemonApiResponse[] = [];

/**
 * Fetches Pokémon names from the PokeAPI and caches them.
 */
const fetchPokemonNames = async () => {
  if (pokemonNameCache.length === 0) {
    try {
      const response = await fetch(POKEMON_NAMES_API_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch Pokémon names: ${response.statusText}`);
      }
      const data = await response.json();
      pokemonNameCache = data.results;
      console.log('Pokémon names fetched and cached.');
    } catch (error) {
      console.error('Error fetching Pokémon names:', error);
      // Fallback to a default name if API fails
      pokemonNameCache = [{ name: 'Missingno', url: 'https://pokeapi.co/api/v2/pokemon/0/' }];
    }
  }
};

/**
 * Generates a random rarity based on predefined probabilities.
 */
export const getRandomRarity = (): PokemonRarity => {
  const rand = Math.random();
  let cumulativeProbability = 0;
  for (const { rarity, probability } of RARITY_PROBABILITIES) {
    cumulativeProbability += probability;
    if (rand < cumulativeProbability) {
      return rarity;
    }
  }
  return PokemonRarity.COMMON; // Fallback
};

/**
 * Calculates a random score within the given rarity's range.
 * @param rarity - The rarity of the Pokémon.
 * @returns The calculated score.
 */
export const calculatePokemonScore = (rarity: PokemonRarity): number => {
  const { minScore, maxScore } = POKEMON_RARITY_DETAILS[rarity];
  return Math.floor(Math.random() * (maxScore - minScore + 1)) + minScore;
};

/**
 * Retrieves rarity details for a given rarity.
 * @param rarity - The rarity to get details for.
 * @returns The RarityDetails object.
 */
export const getPokemonRarityDetails = (rarity: PokemonRarity): RarityDetails => {
  return POKEMON_RARITY_DETAILS[rarity];
};

/**
 * Simulates generating a new Pokémon.
 * @returns A Promise that resolves with a new Pokemon object (without an ID).
 */
export const generatePokemon = async (): Promise<Omit<Pokemon, 'id'>> => {
  await fetchPokemonNames(); // Ensure names are cached

  const randomNameIndex = Math.floor(Math.random() * pokemonNameCache.length);
  const randomPokemon = pokemonNameCache[randomNameIndex];

  // Extract ID from URL to get sprite URL
  const pokemonIdMatch = randomPokemon.url.match(/\/(\d+)\/$/);
  const pokemonId = pokemonIdMatch ? pokemonIdMatch[1] : '0'; // Default to 0 if ID not found

  const rarity = getRandomRarity();
  const score = calculatePokemonScore(rarity);

  return {
    name: randomPokemon.name.charAt(0).toUpperCase() + randomPokemon.name.slice(1),
    rarity: rarity,
    image_url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
    score: score,
    created_at: new Date().toISOString(),
  };
};