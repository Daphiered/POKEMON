<template>
  <div class="dashboard-container">
    <div class="dashboard-card">
      <div class="card-header">
        <h2 class="card-title">🔍 Pokédex Search</h2>
        <div class="search-icon">⚡</div>
      </div>

      <div class="search-section">
        <div class="input-container">
          <input 
            v-model="pokemonName" 
            @keyup.enter="fetchPokemon" 
            placeholder="Enter Pokémon name or number..." 
            class="pokemon-input"
          />
          <button @click="fetchPokemon" class="search-btn">
            <span class="btn-text">Search</span>
            <span class="btn-icon">🔍</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="pokeball-loader"></div>
        <p class="loading-text">Searching for Pokémon...</p>
      </div>

      <div v-if="error" class="error-container">
        <div class="error-icon">❌</div>
        <p class="error-text">{{ error }}</p>
        <button @click="clearError" class="retry-btn">Try Again</button>
      </div>

      <div v-if="pokemon" class="pokemon-display">
        <div class="pokemon-card">
          <div class="pokemon-image-container">
            <img :src="pokemon.sprites.front_default" class="pokemon-image" alt="Pokémon"/>
            <div class="pokemon-id">#{{ pokemon.id.toString().padStart(3, '0') }}</div>
          </div>
          
          <div class="pokemon-info">
            <h3 class="pokemon-name">{{ pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) }}</h3>
            
            <div class="types-container">
              <span 
                v-for="type in pokemon.types" 
                :key="type.slot"
                :class="['type-badge', `type-${type.type.name}`]"
              >
                {{ type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1) }}
              </span>
            </div>

            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Height</span>
                <span class="stat-value">{{ pokemon.height / 10 }}m</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Weight</span>
                <span class="stat-value">{{ pokemon.weight / 10 }}kg</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Base XP</span>
                <span class="stat-value">{{ pokemon.base_experience }}</span>
              </div>
            </div>

            <div class="abilities-section">
              <h4 class="abilities-title">Abilities</h4>
              <div class="abilities-list">
                <span 
                  v-for="ability in pokemon.abilities" 
                  :key="ability.slot"
                  class="ability-badge"
                >
                  {{ ability.ability.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!pokemon && !loading && !error" class="welcome-message">
        <div class="welcome-icon">🎮</div>
        <h3 class="welcome-title">Welcome to the Pokédex!</h3>
        <p class="welcome-text">Search for any Pokémon to see their details, stats, and abilities.</p>
        <div class="suggestions">
          <p class="suggestions-title">Try searching for:</p>
          <div class="suggestion-tags">
            <span @click="searchSuggestion('pikachu')" class="suggestion-tag">Pikachu</span>
            <span @click="searchSuggestion('charizard')" class="suggestion-tag">Charizard</span>
            <span @click="searchSuggestion('blastoise')" class="suggestion-tag">Blastoise</span>
            <span @click="searchSuggestion('venusaur')" class="suggestion-tag">Venusaur</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import pokeapiService from '../services/pokeapi.js';

export default {
  data() {
    return {
      pokemonName: "",
      pokemon: null,
      loading: false,
      error: null,
    };
  },
  methods: {
    async fetchPokemon() {
      if (!this.pokemonName.trim()) {
        this.error = "Please enter a Pokémon name or number";
        return;
      }

      this.loading = true;
      this.error = null;
      this.pokemon = null;

      try {
        const searchTerm = this.pokemonName.toLowerCase().trim();
        
        // Check if it's a number (ID) or name
        if (/^\d+$/.test(searchTerm)) {
          this.pokemon = await pokeapiService.getPokemonById(parseInt(searchTerm));
        } else {
          this.pokemon = await pokeapiService.getPokemonByName(searchTerm);
        }
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    searchSuggestion(name) {
      this.pokemonName = name;
      this.fetchPokemon();
    },
    clearError() {
      this.error = null;
    },
  },
};
</script>

<style scoped>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&display=swap');

.dashboard-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7);
  background-size: 200% 100%;
  animation: gradientShift 3s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}

.card-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.2rem;
  color: #2F4F4F;
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.8);
}

.search-icon {
  font-size: 1.5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Search Section */
.search-section {
  margin-bottom: 2rem;
}

.input-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.pokemon-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: 3px solid #E0E0E0;
  border-radius: 15px;
  font-family: 'Orbitron', monospace;
  font-size: 1rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  outline: none;
}

.pokemon-input:focus {
  border-color: #4ECDC4;
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
  transform: translateY(-2px);
}

.search-btn {
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #4ECDC4, #44A08D);
  border: none;
  border-radius: 15px;
  color: white;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 8px 15px rgba(78, 205, 196, 0.3);
}

.search-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(78, 205, 196, 0.4);
}

.search-btn:active {
  transform: translateY(-1px);
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 3rem;
}

.pokeball-loader {
  width: 60px;
  height: 60px;
  border: 4px solid #E0E0E0;
  border-top: 4px solid #FF6B6B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  color: #666;
  font-size: 1.1rem;
}

/* Error State */
.error-container {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 15px;
  border: 2px solid rgba(255, 107, 107, 0.3);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-text {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  color: #D32F2F;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.retry-btn {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #FF6B6B, #FF8E53);
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(255, 107, 107, 0.3);
}

/* Pokemon Display */
.pokemon-display {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pokemon-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 248, 255, 0.9));
  border-radius: 20px;
  padding: 2rem;
  border: 3px solid rgba(78, 205, 196, 0.3);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.pokemon-image-container {
  text-align: center;
  position: relative;
  margin-bottom: 2rem;
}

.pokemon-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
  transition: transform 0.3s ease;
}

.pokemon-image:hover {
  transform: scale(1.05);
}

.pokemon-id {
  position: absolute;
  top: -10px;
  right: 50%;
  transform: translateX(50%);
  background: linear-gradient(45deg, #FFD700, #FFA500);
  color: #2F4F4F;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.pokemon-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.5rem;
  color: #2F4F4F;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.8);
}

/* Types */
.types-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.type-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.type-fire { background: linear-gradient(45deg, #FF6B6B, #FF8E53); color: white; }
.type-water { background: linear-gradient(45deg, #4ECDC4, #44A08D); color: white; }
.type-grass { background: linear-gradient(45deg, #96CEB4, #7FCDCD); color: #2F4F4F; }
.type-electric { background: linear-gradient(45deg, #FFD700, #FFA500); color: #2F4F4F; }
.type-psychic { background: linear-gradient(45deg, #DDA0DD, #DA70D6); color: white; }
.type-ice { background: linear-gradient(45deg, #B0E0E6, #87CEEB); color: #2F4F4F; }
.type-dragon { background: linear-gradient(45deg, #9370DB, #8A2BE2); color: white; }
.type-dark { background: linear-gradient(45deg, #2F4F4F, #1C1C1C); color: white; }
.type-fairy { background: linear-gradient(45deg, #FFB6C1, #FFC0CB); color: #2F4F4F; }
.type-fighting { background: linear-gradient(45deg, #CD853F, #A0522D); color: white; }
.type-poison { background: linear-gradient(45deg, #9370DB, #8A2BE2); color: white; }
.type-ground { background: linear-gradient(45deg, #DEB887, #D2B48C); color: #2F4F4F; }
.type-flying { background: linear-gradient(45deg, #87CEEB, #B0E0E6); color: #2F4F4F; }
.type-bug { background: linear-gradient(45deg, #9ACD32, #ADFF2F); color: #2F4F4F; }
.type-rock { background: linear-gradient(45deg, #A0522D, #8B4513); color: white; }
.type-ghost { background: linear-gradient(45deg, #9370DB, #8A2BE2); color: white; }
.type-steel { background: linear-gradient(45deg, #C0C0C0, #A9A9A9); color: #2F4F4F; }
.type-normal { background: linear-gradient(45deg, #D3D3D3, #A9A9A9); color: #2F4F4F; }

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.7);
  padding: 1rem;
  border-radius: 15px;
  text-align: center;
  border: 2px solid rgba(78, 205, 196, 0.2);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.stat-label {
  display: block;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  display: block;
  font-family: 'Press Start 2P', monospace;
  font-size: 1rem;
  color: #2F4F4F;
}

/* Abilities */
.abilities-section {
  text-align: center;
}

.abilities-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 1rem;
  color: #2F4F4F;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.8);
}

.abilities-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.ability-badge {
  background: linear-gradient(45deg, #A8E6CF, #7FCDCD);
  color: #2F4F4F;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 0.8rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.ability-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* Welcome Message */
.welcome-message {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(168, 230, 207, 0.2), rgba(127, 205, 205, 0.2));
  border-radius: 20px;
  border: 2px solid rgba(168, 230, 207, 0.3);
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s ease-in-out infinite;
}

.welcome-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.2rem;
  color: #2F4F4F;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.8);
}

.welcome-text {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.suggestions {
  margin-top: 2rem;
}

.suggestions-title {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  color: #2F4F4F;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.suggestion-tag {
  background: linear-gradient(45deg, #FF6B6B, #FF8E53);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
}

.suggestion-tag:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(255, 107, 107, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  .dashboard-card {
    padding: 1.5rem;
  }
  
  .input-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pokemon-image {
    width: 150px;
    height: 150px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .types-container {
    flex-direction: column;
    align-items: center;
  }
  
  .suggestion-tags {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .card-title {
    font-size: 1rem;
  }
  
  .pokemon-name {
    font-size: 1.2rem;
  }
  
  .pokemon-image {
    width: 120px;
    height: 120px;
  }
  
  .welcome-title {
    font-size: 1rem;
  }
}
</style>
