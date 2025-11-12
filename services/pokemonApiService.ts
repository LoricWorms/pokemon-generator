// services/pokemonApiService.ts
import { PokemonApiResponse, PokemonRarity } from '../types'; // Import PokemonRarity

const API_BASE_URL = 'https://epsi.journeesdecouverte.fr:22222/v1'; // Changed to HTTPS
const AUTH_TOKEN = 'EPSI'; // Fixed Bearer token as per docs/authentification.md

/**
 * Generates a new Pokémon by calling the external API.
 * Includes necessary authentication and content type headers.
 * @returns A Promise that resolves with the generated PokemonApiResponse.
 */
export const generatePokemon = async (): Promise<PokemonApiResponse> => {
  try {
    const headers = {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      // 'Content-Type': 'application/json', // Not strictly required for GET with no body
    };

    console.log('Sending API GET request to', `${API_BASE_URL}/generate`, 'with headers:', headers); // Diagnostic log

    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'GET', // Changed from POST to GET
      headers: headers,
      // No body for GET request
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('API Error:', errorData);

      if (response.status === 401) {
        throw new Error(
          `Authentication failed. The API reported: "${errorData.message || 'Unauthorized'}". ` +
          `Please ensure the Authorization header is correctly set as 'Bearer EPSI' as per docs/authentification.md.`
        );
      }
      
      throw new Error(`Failed to generate Pokémon (HTTP ${response.status}): ${errorData.message || 'Unknown error'}`);
    }

    // New API response structure requires specific parsing
    interface RawPokemonApiResponse {
      imageBase64: string;
      metadata: {
        id: string; // Not used directly in our Pokemon type, but good to know
        name: string;
        rarity: string;
      };
      generatedAt: string;
    }

    const rawData: RawPokemonApiResponse = await response.json();
    
    const data: PokemonApiResponse = {
      image_base64: rawData.imageBase64,
      name: rawData.metadata.name,
      // Fix: Explicitly cast the rarity string to PokemonRarity enum type.
      // We assume the API provides a valid rarity string that matches one of the enum values.
      rarity: rawData.metadata.rarity as PokemonRarity,
      generated_at: rawData.generatedAt,
    };

    return data;
  } catch (error: any) {
    console.error('Network or API call error:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        `Could not connect to Pokémon generation service. This might be due to a network issue, ` +
        `the API server being down, or a Cross-Origin Resource Sharing (CORS) problem. ` +
        `Please ensure the API server at '${API_BASE_URL}' is running and accessible.`
      );
    }
    throw new Error(`Could not connect to Pokémon generation service: ${error.message}`);
  }
};