<template>
  <div class="guess"></div>
  <div class="guess-game-container">
    <div class="guess-game-card">
      <div class="game-header">
        <h2 class="game-title">🎯 Who's That Pokémon?</h2>
        <div class="score-display">
          <div class="score-item">
            <span class="score-label">Score</span>
            <span class="score-value">{{ score }}</span>
          </div>
          <div class="score-item">
            <span class="score-label">High Score</span>
            <span class="score-value">{{ highScore }}</span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="pokeball-loader"></div>
        <p class="loading-text">Loading Pokémon...</p>
      </div>

      <div v-if="pokemon && !loading" class="game-content">
        <div class="pokemon-display">
          <div class="pokemon-silhouette">
            <img 
              :src="pokemon.sprites.front_default"
              :class="['pokemon-image', { 'revealed': showAnswer }]"
              :alt="showAnswer ? pokemon.name : 'Mystery Pokémon'"
            />
            <div v-if="!showAnswer" class="silhouette-overlay"></div>
          </div>
          
          <div v-if="showAnswer" class="pokemon-info">
            <h3 class="pokemon-name">{{ pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) }}</h3>
           
            <div class="types-container">
              <span 
                v-for="type in pokemon.types" 
                :key="type.type.name"
                :class="['type-badge', `type-${type.type.name}`]"
              >
                {{ type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1) }}
              </span>
            </div>
          </div>
        </div>

        <div class="guess-section">
          <div class="input-container">
            <input 
              v-model="guess" 
              @keyup.enter="checkAnswer"
              placeholder="Who's that Pokémon?" 
              class="guess-input"
              :disabled="showAnswer"
            />
            <button 
              @click="checkAnswer" 
              class="submit-btn"
              :disabled="!guess.trim() || showAnswer"
            >
              <span class="btn-text">Submit</span>
              <span class="btn-icon">🎯</span>
            </button>
          </div>

          <div v-if="showAnswer" class="result-message">
            <div class="result-icon">🎉</div>
            <p class="result-text">Correct! It's {{ pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) }}!</p>
          </div>

          <div v-if="wrongAnswer" class="wrong-message">
            <div class="wrong-icon">❌</div>
            <p class="wrong-text">Wrong! Score reset.</p>
          </div>
        </div>

        <div class="game-controls">
          <button @click="loadRandomPokemon" class="next-btn">
            <span class="btn-icon">➡️</span>
            Next Pokémon
          </button>
          <button @click="resetGame" class="reset-btn">
            <span class="btn-icon">🔄</span>
            Reset Score
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import client from '../apollo.js';
import { gql } from '@apollo/client/core';

export default {
  data() {
    return {
      pokemon: null,
      guess: "",
      showAnswer: false,
      wrongAnswer: false,
      score: 0,
      highScore: 0,
      loading: false,
    };
  },
  methods: {
    async loadRandomPokemon() {
      this.loading = true;
      this.showAnswer = false;
      this.wrongAnswer = false;
      this.guess = "";
      
      try {
        // Random Pokémon from Gen 1 (IDs 1–151)
        const randomId = Math.floor(Math.random() * 151) + 1;

        // Fetch Pokémon details
        const detail = await client.query({
          query: gql`
            query getPokemon($id: Int!) {
              pokemon_v2_pokemon_by_pk(id: $id) {
                id
                name
                pokemon_v2_pokemontypes {
                  pokemon_v2_type {
                    name
                  }
                }
              }
            }
          `,
          variables: { id: randomId },
          fetchPolicy: "no-cache"
        });

        const poke = detail.data.pokemon_v2_pokemon_by_pk;

        if (poke) {
          const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`;
          this.pokemon = {
            id: poke.id,
            name: poke.name,
            sprites: { front_default: img },
            types: poke.pokemon_v2_pokemontypes.map(t => ({
              type: { name: t.pokemon_v2_type.name }
            }))
          };
        }
      } catch (error) {
        console.error("Error loading Pokémon:", error);
        alert("Failed to load Pokémon. Please try again.");
      } finally {
        this.loading = false;
      }
    },
    
    checkAnswer() {
      if (!this.guess.trim()) return;
      
      if (this.guess.toLowerCase().trim() === this.pokemon.name.toLowerCase()) {
        this.showAnswer = true;
        this.wrongAnswer = false;
        this.score++;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem("guessHighScore", this.highScore);
        }
      } else {
        this.wrongAnswer = true;
        this.showAnswer = false;
        this.score = 0;
        setTimeout(() => { this.wrongAnswer = false; }, 2000);
      }
    },
    
    resetGame() {
      this.score = 0;
      this.highScore = 0;
      localStorage.removeItem("guessHighScore");
    },
  },
  
  mounted() {
    this.loadRandomPokemon();
    const savedHigh = localStorage.getItem("guessHighScore");
    if (savedHigh) {
      this.highScore = parseInt(savedHigh);
    }
  },
};
</script>

<style scoped>
.guess-game-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #87ceeb 0%, #98fb98 100%);
  font-family: 'Orbitron', sans-serif;
  padding: 1rem;
}

.guess-game-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 10;
}

.game-header {
  margin-bottom: 2rem;
}

.game-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.score-display {
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
}

.score-item {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 0.8rem 1.2rem;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.score-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
}

.score-value {
  font-size: 1.4rem;
  color: #222;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* Pokémon Display */
.pokemon-display {
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pokemon-silhouette {
  position: relative;
  width: 250px;
  height: 250px;
}

.pokemon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: brightness(0) saturate(100%); /* silhouette mode */
  transition: filter 0.6s ease;
}

.pokemon-image.revealed {
  filter: none; /* show real Pokémon */
}

.silhouette-overlay {
  position: absolute;
  inset: 0;
  background: black;
  mix-blend-mode: color;
  border-radius: 12px;
}

/* Pokémon info revealed */
.pokemon-info {
  margin-top: 1rem;
}

.pokemon-name {
  font-size: 1.6rem;
  margin-bottom: 0.8rem;
}

.types-container {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
}

.type-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: capitalize;
}

/* Example type colors */
.type-fire { background: #ff6f61; }
.type-water { background: #4a90e2; }
.type-grass { background: #77dd77; }
.type-electric { background: #fdd835; color: #333; }

/* Guess Section */
.guess-section {
  margin-top: 1.5rem;
}

.input-container {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}

.guess-input {
  flex: 1;
  max-width: 280px;
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid #ddd;
  border-radius: 10px;
  outline: none;
}

.guess-input:focus {
  border-color: #4a90e2;
}

.submit-btn {
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  background: #4a90e2;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover {
  background: #357abd;
}

.result-message,
.wrong-message {
  margin-top: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
}

.result-icon,
.wrong-icon {
  font-size: 1.8rem;
}

/* Controls */
.game-controls {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.next-btn,
.reset-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.3s;
}

.next-btn {
  background: #77dd77;
  color: #222;
}

.next-btn:hover {
  background: #66c266;
  transform: scale(1.05);
}

.reset-btn {
  background: #f44336;
  color: #fff;
}

.reset-btn:hover {
  background: #d32f2f;
  transform: scale(1.05);
}
</style>
