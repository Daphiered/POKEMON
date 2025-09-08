<template>
  <div class="memory-game-container">
    <div class="memory-game-card">
      <div class="game-header">
        <h2 class="game-title">🧠 Pokémon Memory Game</h2>
        <div class="game-stats">
          <div class="stat-item">
            <span class="stat-label">Matches</span>
            <span class="stat-value">{{ matches }}/{{ cards.length / 2 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Moves</span>
            <span class="stat-value">{{ moves }}</span>
          </div>
        </div>
      </div>

      <div v-if="cards.length === 0" class="loading-container">
        <div class="pokeball-loader"></div>
        <p class="loading-text">Loading Pokémon cards...</p>
      </div>


      <div v-if="cards.length > 0" class="game-board">
        <div 
          v-for="(card, index) in cards" 
          :key="index"
          :class="['memory-card', { 
            'flipped': card.flipped, 
            'matched': card.matched,
            'disabled': isDisabled
          }]"
          @click="flipCard(index)"
        >
          <!-- Simple approach: show image directly when flipped -->
          <div v-if="!card.flipped" class="card-front">
            <span class="question-mark">❓</span>
          </div>
          <div v-else class="card-back">
            <img 
              :src="card.img" 
              :alt="`Pokémon ${card.id}`" 
              class="pokemon-image"
              @error="handleImageError"
              @load="handleImageLoad"
            />
            <div class="pokemon-id">#{{ card.id.toString().padStart(3, '0') }}</div>
          </div>
        </div>
      </div>

      <div class="game-controls">
        <button @click="setupGame" class="restart-btn">
          <span class="btn-icon">🔄</span>
          New Game
        </button>
        <button @click="showHint" class="hint-btn" :disabled="hintsUsed >= 3">
          <span class="btn-icon">💡</span>
          Hint ({{ 3 - hintsUsed }} left)
        </button>
        <button @click="useFallbackData" class="fallback-btn">
          <span class="btn-icon">⚡</span>
          Quick Start
        </button>
      </div>

      <div v-if="gameComplete" class="victory-message">
        <div class="victory-icon">🎉</div>
        <h3 class="victory-title">Congratulations!</h3>
        <p class="victory-text">You completed the memory game in {{ moves }} moves!</p>
        <button @click="setupGame" class="play-again-btn">Play Again</button>
      </div>
    </div>
  </div>
</template>

<script>
import pokeapiService from '../services/pokeapi.js';

export default {
  data() {
    return {
      cards: [],
      flippedCards: [],
      matches: 0,
      moves: 0,
      isDisabled: false,
      hintsUsed: 0,
      gameComplete: false,
    };
  },
  methods: {
    async setupGame() {
      this.matches = 0;
      this.moves = 0;
      this.cards = [];
      this.flippedCards = [];
      this.isDisabled = false;
      this.hintsUsed = 0;
      this.gameComplete = false;

      try {
        // Get 6 random Pokémon using GraphQL
        const pokemonList = await pokeapiService.getRandomPokemons(6);
        console.log('Loaded Pokémon list:', pokemonList);

        // Create cards from the Pokémon data
        pokemonList.forEach(pokemon => {
          const imageUrl = pokemon.sprites?.front_default || pokemon.sprites?.other?.['official-artwork']?.front_default;
          
          const cardData = { 
            id: pokemon.id, 
            img: imageUrl || 'https://via.placeholder.com/96x96/cccccc/666666?text=?', 
            flipped: false, 
            matched: false 
          };
          
          console.log(`Creating cards for Pokémon ${pokemon.id}:`, cardData);
          
          // Add two copies of each card
          this.cards.push({ ...cardData });
          this.cards.push({ ...cardData });
        });

        // Shuffle the cards
        this.cards = this.cards.sort(() => 0.5 - Math.random());
        console.log('Game setup complete with cards:', this.cards);
      } catch (error) {
        console.error('Error loading Pokémon data:', error);
        alert('Failed to load Pokémon data. Please try again.');
      }
    },
    
    flipCard(index) {
      if (this.cards[index].flipped || this.cards[index].matched || this.isDisabled) {
        return;
      }

      this.cards[index].flipped = true;
      this.flippedCards.push(index);

      if (this.flippedCards.length === 2) {
        this.moves++;
        this.isDisabled = true;
        
        const [first, second] = this.flippedCards;
        
        if (this.cards[first].id === this.cards[second].id) {
          // Match found
          this.cards[first].matched = true;
          this.cards[second].matched = true;
          this.matches++;
          
          // Check if game is complete
          if (this.matches === this.cards.length / 2) {
            setTimeout(() => {
              this.gameComplete = true;
            }, 500);
          }
          
          this.flippedCards = [];
          this.isDisabled = false;
        } else {
          // No match, flip cards back after delay
          setTimeout(() => {
            this.cards[first].flipped = false;
            this.cards[second].flipped = false;
            this.flippedCards = [];
            this.isDisabled = false;
          }, 1000);
        }
      }
    },
    
    showHint() {
      if (this.hintsUsed >= 3) return;
      
      // Find two unmatched cards and briefly show them
      const unmatchedCards = this.cards
        .map((card, index) => ({ card, index }))
        .filter(({ card }) => !card.matched && !card.flipped);
      
      if (unmatchedCards.length >= 2) {
        this.hintsUsed++;
        const [card1, card2] = unmatchedCards.slice(0, 2);
        
        // Temporarily flip the cards
        this.cards[card1.index].flipped = true;
        this.cards[card2.index].flipped = true;
        
        // Flip them back after 2 seconds
        setTimeout(() => {
          this.cards[card1.index].flipped = false;
          this.cards[card2.index].flipped = false;
        }, 2000);
      }
    },
    
    handleImageError(event) {
      console.warn('Image failed to load:', event.target.src);
      // Set a fallback image
      event.target.src = 'https://via.placeholder.com/96x96/cccccc/666666?text=?';
      event.target.style.border = '2px solid red';
    },
    
    handleImageLoad(event) {
      console.log('Image loaded successfully:', event.target.src);
      event.target.style.border = '2px solid green';
    },
    
    
    useFallbackData() {
      // Use hardcoded Pokémon data
      const fallbackPokemon = [
        { id: 1, img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
        { id: 4, img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
        { id: 7, img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
        { id: 25, img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
        { id: 39, img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png' },
        { id: 150, img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png' }
      ];
      
      this.cards = [];
      fallbackPokemon.forEach(pokemon => {
        const cardData = { 
          id: pokemon.id, 
          img: pokemon.img, 
          flipped: false, 
          matched: false 
        };
        // Add two copies of each card
        this.cards.push({ ...cardData });
        this.cards.push({ ...cardData });
      });
      
      // Shuffle the cards
      this.cards = this.cards.sort(() => 0.5 - Math.random());
      
      console.log('Using fallback data:', this.cards);
    },
  },
  
  mounted() {
    this.setupGame();
  },
};
</script>

<style scoped>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&display=swap');

.memory-game-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.memory-game-card {
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

.memory-game-card::before {
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

.game-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  color: #666;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  display: block;
  font-family: 'Press Start 2P', monospace;
  font-size: 1rem;
  color: #2F4F4F;
  margin-top: 0.25rem;
}

/* Game Board */
.game-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  perspective: 1000px;
}

.memory-card {
  aspect-ratio: 1;
  cursor: pointer;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.memory-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.memory-card.matched {
  opacity: 0.7;
}

.memory-card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.card-front, .card-back {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  position: relative;
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-back {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.question-mark {
  font-size: 3rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.pokemon-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  transition: transform 0.3s ease;
  display: block;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px;
}

.pokemon-image:hover {
  transform: scale(1.05);
}

.pokemon-id {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
}


/* Game Controls */
.game-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.restart-btn, .hint-btn, .fallback-btn {
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

.restart-btn {
  background: linear-gradient(45deg, #4ECDC4, #44A08D);
  color: white;
  box-shadow: 0 8px 15px rgba(78, 205, 196, 0.3);
}

.restart-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(78, 205, 196, 0.4);
}

.hint-btn {
  background: linear-gradient(45deg, #FFD700, #FFA500);
  color: #2F4F4F;
  box-shadow: 0 8px 15px rgba(255, 215, 0, 0.3);
}

.hint-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(255, 215, 0, 0.4);
}

.hint-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.fallback-btn {
  background: linear-gradient(45deg, #FF6B6B, #FF8E53);
  color: white;
  box-shadow: 0 8px 15px rgba(255, 107, 107, 0.3);
}

.fallback-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(255, 107, 107, 0.4);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Victory Message */
.victory-message {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2));
  border-radius: 20px;
  border: 2px solid rgba(255, 215, 0, 0.3);
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

.victory-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

.victory-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.5rem;
  color: #2F4F4F;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.8);
}

.victory-text {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.play-again-btn {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #FF6B6B, #FF8E53);
  border: none;
  border-radius: 15px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 8px 15px rgba(255, 107, 107, 0.3);
}

.play-again-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(255, 107, 107, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .memory-game-container {
    padding: 1rem;
  }
  
  .memory-game-card {
    padding: 1.5rem;
  }
  
  .game-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .game-stats {
    gap: 1rem;
  }
  
  .game-board {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .game-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .restart-btn, .hint-btn {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 1rem;
  }
  
  .game-board {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .victory-title {
    font-size: 1.2rem;
  }
}
</style>