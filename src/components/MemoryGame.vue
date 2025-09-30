<template>
  <div class="memory-game">
    <h2 class="game-title">🧠 Pokémon Memory Game</h2>
    <div class="score-board">
      <p>Moves: {{ moves }}</p>
      <p>Matches: {{ matches }}</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="pokeball-loader"></div>
      <p>Loading Pokémon...</p>
    </div>

    <div v-else class="game-grid">
      <div 
        v-for="(card, index) in cards" 
        :key="index" 
        class="card" 
        :class="{ flipped: card.flipped || card.matched }" 
        @click="flipCard(index)"
      >
        <div class="card-inner">
          <div class="card-front">❓</div>
          <div class="card-back">
            <img :src="card.img" :alt="card.name" />
          </div>
        </div>
      </div>
    </div>

    <div class="controls">
      <button @click="setupGame">🔄 Restart Game</button>
    </div>

    <!-- 🎉 Congratulations Overlay -->
    <div v-if="gameFinished" class="overlay">
      <div class="overlay-content">
        <h2>🎉 Congratulations! 🎉</h2>
        <p>You matched all Pokémon in {{ moves }} moves!</p>
        <button @click="setupGame">Play Again</button>
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
      cards: [],
      flippedCards: [],
      moves: 0,
      matches: 0,
      loading: false,
      gameFinished: false,
    };
  },
  methods: {
    async setupGame() {
      this.loading = true;
      this.cards = [];
      this.flippedCards = [];
      this.moves = 0;
      this.matches = 0;
      this.gameFinished = false;

      try {
        const offset = Math.floor(Math.random() * 150);
        const { data } = await client.query({
          query: gql`
            query list($limit: Int, $offset: Int) {
              pokemon_v2_pokemon(limit: $limit, offset: $offset) {
                id
                name
              }
            }
          `,
          variables: { limit: 6, offset },
          fetchPolicy: "no-cache"
        });

        const base = data.pokemon_v2_pokemon.map(p => {
          const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
          return { id: p.id, name: p.name, img, flipped: false, matched: false };
        });

        base.forEach(card => {
          this.cards.push({ ...card });
          this.cards.push({ ...card });
        });

        this.cards = this.cards.sort(() => Math.random() - 0.5);

      } catch (err) {
        console.error("Error loading Pokémon:", err);
        alert("Failed to load Pokémon. Please try again.");
      } finally {
        this.loading = false;
      }
    },

    flipCard(index) {
      const card = this.cards[index];
      if (card.flipped || card.matched || this.flippedCards.length === 2) return;

      card.flipped = true;
      this.flippedCards.push({ ...card, index });

      if (this.flippedCards.length === 2) {
        this.moves++;
        setTimeout(this.checkMatch, 800);
      }
    },

    checkMatch() {
      const [first, second] = this.flippedCards;
      if (first.id === second.id) {
        this.cards[first.index].matched = true;
        this.cards[second.index].matched = true;
        this.matches++;

        // ✅ check if all pairs are matched
        if (this.matches === this.cards.length / 2) {
          this.gameFinished = true;
        }
      } else {
        this.cards[first.index].flipped = false;
        this.cards[second.index].flipped = false;
      }
      this.flippedCards = [];
    },
  },

  mounted() {
    this.setupGame();
  }
};
</script>

<style scoped>
.memory-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.game-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.score-board {
  display: flex;
  justify-content: space-between;
  width: 220px;
  margin-bottom: 1rem;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(4, 100px);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card {
  width: 100px;
  height: 100px;
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card.flipped .card-inner,
.card.matched .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.card-front {
  background: #4a90e2;
  color: white;
}

.card-back {
  background: white;
  transform: rotateY(180deg);
  border: 2px solid #ddd;
}

.card-back img {
  width: 80px;
  height: 80px;
}

.controls button {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  background: #77dd77;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.3s;
}

.controls button:hover {
  background: #66c266;
  transform: scale(1.05);
}

.loading {
  text-align: center;
  margin-top: 2rem;
}

/* 🎉 Overlay */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.overlay-content {
  background: white;
  padding: 2rem 3rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

.overlay-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.overlay-content p {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.overlay-content button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  background: #4a90e2;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.overlay-content button:hover {
  background: #357abd;
}
</style>
