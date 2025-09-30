<template>
  <div class="dashboard">
    <!-- Search Section -->
    <div class="search-section">
      <div class="search-container">
        <h2 class="section-title">Pokédex Search</h2>
        <div class="search-input-group">
          <input
            v-model="searchQuery"
            @keyup.enter="searchPokemon"
            type="text"
            placeholder="Enter Pokémon name..."
            class="search-input"
            :disabled="loading"
          />
          <button @click="searchPokemon" class="search-btn" :disabled="loading || !searchQuery.trim()">
            <span v-if="loading">🔍</span>
            <span v-else>Search</span>
          </button>
        </div>
        
        <div v-if="searchResult" class="search-result">
          <div class="pokemon-detail-card">
            <div class="pokemon-image-container">
              <img :src="searchResult.image" :alt="searchResult.name" class="pokemon-image" />
            </div>
            <div class="pokemon-info">
              <h3 class="pokemon-name">#{{ searchResult.id }} {{ searchResult.name }}</h3>
              <div class="pokemon-types">
                <span v-for="type in searchResult.types" :key="type" class="type-badge" :class="getTypeClass(type)">
                  {{ type }}
                </span>
              </div>
              <div class="pokemon-stats">
                <div class="stat-item">
                  <span class="stat-label">Height:</span>
                  <span class="stat-value">{{ searchResult.height }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Weight:</span>
                  <span class="stat-value">{{ searchResult.weight }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Base Exp:</span>
                  <span class="stat-value">{{ searchResult.base_experience }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>

    <!-- Collection Section -->
    <div class="collection-section">
      <div class="collection-header">
        <h2 class="section-title">Pokémon Collection</h2>
        <button @click="loadRandomPokemon" class="load-more-btn" :disabled="loading">
          Load Random Pokémon
        </button>
      </div>
      
      <div v-if="loading && pokemonCollection.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading Pokémon...</p>
      </div>
      
      <div v-else class="pokemon-grid">
        <div 
          v-for="pokemon in pokemonCollection" 
          :key="pokemon.id" 
          class="pokemon-card"
          @click="selectPokemon(pokemon)"
        >
          <img :src="pokemon.image" :alt="pokemon.name" class="card-image" />
          <div class="card-info">
            <h4 class="card-name">#{{ pokemon.id }} {{ pokemon.name }}</h4>
            <div class="card-types">
              <span v-for="type in pokemon.types" :key="type" class="type-badge small" :class="getTypeClass(type)">
                {{ type }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedPokemon" class="modal-overlay" @click="selectedPokemon = null">
      <div class="modal-content" @click.stop>
        <button @click="selectedPokemon = null" class="close-btn">&times;</button>
        <div class="modal-pokemon-detail">
          <div class="modal-image-container">
            <img :src="selectedPokemon.image" :alt="selectedPokemon.name" class="modal-image" />
          </div>
          <div class="modal-info">
            <h2 class="modal-name">#{{ selectedPokemon.id }} {{ selectedPokemon.name }}</h2>
            <div class="modal-types">
              <span v-for="type in selectedPokemon.types" :key="type" class="type-badge" :class="getTypeClass(type)">
                {{ type }}
              </span>
            </div>
            <div class="modal-abilities" v-if="selectedPokemon.abilities">
              <h4>Abilities:</h4>
              <div class="abilities-list">
                <span v-for="ability in selectedPokemon.abilities" :key="ability" class="ability-badge">
                  {{ ability }}
                </span>
              </div>
            </div>
            <div class="modal-stats">
              <div class="stat-item">
                <span class="stat-label">Height:</span>
                <span class="stat-value">{{ selectedPokemon.height }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Weight:</span>
                <span class="stat-value">{{ selectedPokemon.weight }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Base Exp:</span>
                <span class="stat-value">{{ selectedPokemon.base_experience }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from '@apollo/client/core'
import apolloClient from '../apollo.js'

// GraphQL queries for graphql‐pokeapi
const QUERY_POKEMON_BY_NAME = gql`
  query PokemonByName($name: String!) {
    pokemon_v2_pokemon(where: {name: {_eq: $name}}) {
      id
      name
      height
      weight
      base_experience
      pokemon_v2_pokemontypes {
        type: pokemon_v2_type {
          name
        }
      }
      pokemon_v2_pokemonabilities {
        ability: pokemon_v2_ability {
          name
        }
      }
    }
  }
`;

const QUERY_POKEMONS = gql`
  query Pokemons($limit: Int!, $offset: Int!) {
    pokemon_v2_pokemon(limit: $limit, offset: $offset) {
      id
      name
      pokemon_v2_pokemontypes {
        type: pokemon_v2_type {
          name
        }
      }
    }
  }
`;

export default {
  name: 'Dashboard',
  data() {
    return {
      searchQuery: '',
      searchResult: null,
      pokemonCollection: [],
      selectedPokemon: null,
      loading: false,
      error: null,
    }
  },
  async mounted() {
    await this.loadRandomPokemon()
  },
  methods: {
    async searchPokemon() {
      if (!this.searchQuery.trim()) return
      this.loading = true
      this.error = null
      this.searchResult = null

      try {
        const { data } = await apolloClient.query({
          query: QUERY_POKEMON_BY_NAME,
          variables: { name: this.searchQuery.toLowerCase() }
        })

        if (data && data.pokemon_v2_pokemon.length > 0) {
          this.searchResult = this.transformPokemon(data.pokemon_v2_pokemon[0])
        } else {
          this.error = 'Pokémon not found'
        }
      } catch (err) {
        console.error('Search error:', err)
        this.error = 'Error searching Pokémon'
      } finally {
        this.loading = false
      }
    },

    async loadRandomPokemon() {
      this.loading = true
      this.error = null
      try {
        const limit = 12
        const offset = Math.floor(Math.random() * (151 - limit)) // Gen 1 only
        const { data } = await apolloClient.query({
          query: QUERY_POKEMONS,
          variables: { limit, offset }
        })

        if (data && data.pokemon_v2_pokemon) {
          this.pokemonCollection = data.pokemon_v2_pokemon.map(p => this.transformPokemon(p))
        }
      } catch (err) {
        console.error('Load random error:', err)
        this.error = 'Error loading collection'
      } finally {
        this.loading = false
      }
    },

    selectPokemon(poke) {
      this.selectedPokemon = poke
    },

    transformPokemon(p) {
      return {
        id: p.id,
        name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`,
        types: p.pokemon_v2_pokemontypes ? p.pokemon_v2_pokemontypes.map(t => t.type.name) : [],
        abilities: p.pokemon_v2_pokemonabilities ? p.pokemon_v2_pokemonabilities.map(a => a.ability.name) : [],
        height: p.height ?? '—',
        weight: p.weight ?? '—',
        base_experience: p.base_experience ?? '—',
      }
    },

    getTypeClass(type) {
      const typeClasses = {
        normal: 'type-normal',
        fire: 'type-fire',
        water: 'type-water',
        electric: 'type-electric',
        grass: 'type-grass',
        ice: 'type-ice',
        fighting: 'type-fighting',
        poison: 'type-poison',
        ground: 'type-ground',
        flying: 'type-flying',
        psychic: 'type-psychic',
        bug: 'type-bug',
        rock: 'type-rock',
        ghost: 'type-ghost',
        dragon: 'type-dragon',
        dark: 'type-dark',
        steel: 'type-steel',
        fairy: 'type-fairy',
      }
      return typeClasses[type] || 'type-normal'
    }
  }
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
  background: #f6f8fc;
  min-height: 100vh;
}

/* --- Search Section --- */
.search-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.search-input-group {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #ddd;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: border 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #ff5757;
}

.search-btn {
  background: #ff5757;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.search-btn:hover {
  background: #e04a4a;
}

.error-message {
  margin-top: 1rem;
  color: #e63946;
  font-weight: 500;
}

/* --- Pokémon Detail --- */
.search-result {
  margin-top: 1.5rem;
}

.pokemon-detail-card {
  display: flex;
  gap: 1.5rem;
  background: #fafafa;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.pokemon-image-container {
  flex: 0 0 120px;
}

.pokemon-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.pokemon-info {
  flex: 1;
}

.pokemon-name {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
}

.pokemon-types {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  text-transform: capitalize;
}

.type-badge.small {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
}

.type-normal { background: #a8a77a; }
.type-fire { background: #ee8130; }
.type-water { background: #6390f0; }
.type-electric { background: #f7d02c; color: #000; }
.type-grass { background: #7ac74c; }
.type-ice { background: #96d9d6; }
.type-fighting { background: #c22e28; }
.type-poison { background: #a33ea1; }
.type-ground { background: #e2bf65; }
.type-flying { background: #a98ff3; }
.type-psychic { background: #f95587; }
.type-bug { background: #a6b91a; }
.type-rock { background: #b6a136; }
.type-ghost { background: #735797; }
.type-dragon { background: #6f35fc; }
.type-dark { background: #705746; }
.type-steel { background: #b7b7ce; }
.type-fairy { background: #d685ad; }

.pokemon-stats, .modal-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.stat-label {
  font-weight: 600;
  color: #555;
}

/* --- Collection --- */
.collection-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.load-more-btn {
  background: #48cae4;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.load-more-btn:hover {
  background: #0096c7;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.pokemon-card {
  background: #fafafa;
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pokemon-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.card-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 0.5rem;
}

.card-name {
  font-weight: 600;
  text-transform: capitalize;
}

.card-types {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

/* --- Modal --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-content {
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  position: relative;
}

.close-btn {
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-pokemon-detail {
  display: flex;
  gap: 1.5rem;
}

.modal-image-container {
  flex: 0 0 150px;
}

.modal-image {
  width: 150px;
  height: 150px;
  object-fit: contain;
}

.modal-info {
  flex: 1;
}

.modal-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
}

.modal-types {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.abilities-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.ability-badge {
  background: #eee;
  padding: 0.3rem 0.7rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
}

/* --- Congratulations Overlay --- */
.congrats-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: fadeIn 0.4s ease;
}

.congrats-box {
  background: white;
  padding: 2rem 3rem;
  border-radius: 1rem;
  text-align: center;
  animation: popIn 0.4s ease;
}

.congrats-title {
  font-size: 2rem;
  font-weight: bold;
  color: #38b000;
  margin-bottom: 1rem;
}

.play-again-btn {
  background: #ffb703;
  color: #000;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.play-again-btn:hover {
  background: #faa307;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes popIn {
  from { transform: scale(0.7); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
