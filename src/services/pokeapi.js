import { GraphQLClient, gql } from 'graphql-request';

// GraphQL PokeAPI endpoint
const endpoint = 'https://graphql-pokeapi.vercel.app/api/graphql';
const client = new GraphQLClient(endpoint);

// GraphQL queries based on official documentation
const GET_POKEMON_BY_NAME = gql`
  query getPokemon($name: String!) {
    pokemon(name: $name) {
      id
      name
      types {
        type {
          name
        }
      }
      abilities {
        ability {
          name
        }
      }
      message
      status
    }
  }
`;

const GET_POKEMONS = gql`
  query getPokemons($limit: Int, $offset: Int) {
    pokemons(limit: $limit, offset: $offset) {
      count
      next
      previous
      status
      message
      results {
        url
        name
        image
      }
    }
  }
`;

// Service functions
export const pokeapiService = {
  // Get a single Pokémon by name
  async getPokemonByName(name) {
    try {
      const data = await client.request(GET_POKEMON_BY_NAME, { name: name.toLowerCase() });
      return this.transformPokemonData(data.pokemon);
    } catch (error) {
      console.error('Error fetching Pokémon by name:', error);
      throw new Error(`Pokémon "${name}" not found!`);
    }
  },

  // Get a single Pokémon by ID (using name lookup with known Pokémon names)
  async getPokemonById(id) {
    try {
      // Since GraphQL API doesn't support ID queries, we'll use a fallback approach
      // For now, we'll use the REST API for ID-based queries
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!res.ok) {
        throw new Error(`Pokémon with ID ${id} not found!`);
      }
      const data = await res.json();
      return this.transformPokemonData(data);
    } catch (error) {
      console.error('Error fetching Pokémon by ID:', error);
      throw new Error(`Pokémon with ID ${id} not found!`);
    }
  },

  // Get multiple Pokémon for memory game
  async getPokemons(limit = 6, offset = 0) {
    try {
      const data = await client.request(GET_POKEMONS, { limit, offset });
      // Transform the results to match our expected format
      return data.pokemons.results.map(pokemon => ({
        id: this.extractIdFromUrl(pokemon.url),
        name: pokemon.name,
        sprites: {
          front_default: pokemon.image
        }
      }));
    } catch (error) {
      console.error('Error fetching Pokémon list:', error);
      throw new Error('Failed to load Pokémon data');
    }
  },

  // Get random Pokémon for games
  async getRandomPokemon() {
    try {
      const randomId = Math.floor(Math.random() * 151) + 1; // Gen 1 only
      return await this.getPokemonById(randomId);
    } catch (error) {
      console.error('Error fetching random Pokémon:', error);
      throw error;
    }
  },

  // Get multiple random Pokémon for memory game
  async getRandomPokemons(count = 6) {
    try {
      // Use GraphQL to get a list of Pokémon and pick random ones
      const offset = Math.floor(Math.random() * 100); // Random offset for variety
      const pokemonList = await this.getPokemons(count * 2, offset); // Get more than needed
      
      // Shuffle and pick the first 'count' Pokémon
      const shuffled = pokemonList.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      console.error('Error fetching random Pokémon list:', error);
      throw error;
    }
  },

  // Helper method to extract ID from URL
  extractIdFromUrl(url) {
    const match = url.match(/\/(\d+)\/$/);
    return match ? parseInt(match[1]) : null;
  },

  // Transform GraphQL data to match REST API format for compatibility
  transformPokemonData(pokemon) {
    if (!pokemon) return null;

    // For GraphQL API, we need to construct the image URL from the ID
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
    const officialArtworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

    return {
      id: pokemon.id,
      name: pokemon.name,
      height: pokemon.height || 0, // Default values for missing fields
      weight: pokemon.weight || 0,
      base_experience: pokemon.base_experience || 0,
      sprites: {
        front_default: imageUrl,
        other: {
          'official-artwork': {
            front_default: officialArtworkUrl
          }
        }
      },
      types: pokemon.types || [],
      abilities: pokemon.abilities || []
    };
  }
};

export default pokeapiService;
