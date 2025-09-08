<template>
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
            <div class="pokemon-id">#{{ pokemon.id.toString().padStart(3, '0') }}</div>
            <div class="types-container">
              <span 
                v-for="type in pokemon.types" 
                :key="type.slot"
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
import pokeapiService from '../services/pokeapi.js';

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
        this.pokemon = await pokeapiService.getRandomPokemon();
      } catch (error) {
        console.error('Error loading Pokémon:', error);
        alert('Failed to load Pokémon. Please try again.');
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
        
        // Hide wrong message after 2 seconds
        setTimeout(() => {
          this.wrongAnswer = false;
        }, 2000);
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
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&display=swap');

.guess-game-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.guess-game-card {
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

.guess-game-card::before {
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

/* Game Header */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}

.game-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.2rem;
  color: #2F4F4F;
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.8);
}

.score-display {
  display: flex;
  gap: 2rem;
}

.score-item {
  text-align: center;
}

.score-label {
  display: block;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  color: #666;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-value {
  display: block;
  font-family: 'Press Start 2P', monospace;
  font-size: 1rem;
  color: #2F4F4F;
  margin-top: 0.25rem;
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

/* Game Content */
.game-content {
  text-align: center;
}

/* Pokemon Display */
.pokemon-display {
  margin-bottom: 2rem;
}

.pokemon-silhouette {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.pokemon-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
  transition: all 0.5s ease;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
}

.pokemon-image.revealed {
  filter: brightness(1) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
}

.silhouette-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2F4F4F, #1C1C1C);
  border-radius: 50%;
  opacity: 0.8;
  transition: opacity 0.5s ease;
}

.pokemon-info {
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

.pokemon-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.5rem;
  color: #2F4F4F;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.8);
}

.pokemon-id {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 1rem;
}

.types-container {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.type-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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

/* Guess Section */
.guess-section {
  margin-bottom: 2rem;
}

.input-container {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.guess-input {
  flex: 1;
  max-width: 300px;
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

.guess-input:focus {
  border-color: #4ECDC4;
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
  transform: translateY(-2px);
}

.guess-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn {
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

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(78, 205, 196, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Result Messages */
.result-message, .wrong-message {
  padding: 1rem;
  border-radius: 15px;
  margin-top: 1rem;
  animation: slideIn 0.3s ease-out;
}

.result-message {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(139, 195, 74, 0.2));
  border: 2px solid rgba(76, 175, 80, 0.3);
}

.wrong-message {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.2), rgba(255, 87, 34, 0.2));
  border: 2px solid rgba(244, 67, 54, 0.3);
}

.result-icon, .wrong-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.result-text {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  color: #2E7D32;
  font-size: 1.1rem;
}

.wrong-text {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  color: #C62828;
  font-size: 1.1rem;
}

/* Game Controls */
.game-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.next-btn, .reset-btn {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 1rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.next-btn {
  background: linear-gradient(45deg, #FF6B6B, #FF8E53);
  color: white;
  box-shadow: 0 8px 15px rgba(255, 107, 107, 0.3);
}

.next-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(255, 107, 107, 0.4);
}

.reset-btn {
  background: linear-gradient(45deg, #A8E6CF, #7FCDCD);
  color: #2F4F4F;
  box-shadow: 0 8px 15px rgba(168, 230, 207, 0.3);
}

.reset-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(168, 230, 207, 0.4);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .guess-game-container {
    padding: 1rem;
  }
  
  .guess-game-card {
    padding: 1.5rem;
  }
  
  .game-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .score-display {
    gap: 1rem;
  }
  
  .input-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pokemon-image {
    width: 150px;
    height: 150px;
  }
  
  .game-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .next-btn, .reset-btn {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 1rem;
  }
  
  .pokemon-name {
    font-size: 1.2rem;
  }
  
  .pokemon-image {
    width: 120px;
    height: 120px;
  }
}
</style>
