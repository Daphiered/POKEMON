<template>
  <div class="pokemon-app">
    <!-- Welcome Screen -->
    <div v-if="showWelcome" class="welcome-screen">
      <div class="pokemon-logo">
        <h1 class="logo-text">Pokémon</h1>
        <div class="logo-tm">TM</div>
      </div>
      
      <div class="pokemon-characters">
        <div class="pokemon-container">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" alt="Bulbasaur" class="pokemon-character" />
        </div>
        <div class="pokemon-container">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png" alt="Charmander" class="pokemon-character" />
        </div>
        <div class="pokemon-container">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png" alt="Squirtle" class="pokemon-character" />
        </div>
      </div>
      
      <div class="welcome-content">
        <h2 class="welcome-title">Welcome to the Pokémon World!</h2>
        <p class="welcome-subtitle">Choose your adventure below</p>
        
        <div class="game-buttons">
          <button @click="startGame('dashboard')" class="game-btn primary">
            <span class="btn-icon">📊</span>
            Pokédex Search
          </button>
          <button @click="startGame('guess')" class="game-btn secondary">
            <span class="btn-icon">🎯</span>
            Guess that Pokémon
          </button>
          <button @click="startGame('memory')" class="game-btn tertiary">
            <span class="btn-icon">🧠</span>
            Memory Game
          </button>
        </div>
      </div>
    </div>

    <!-- Main App Content -->
    <div v-else class="main-app">
      <header class="app-header">
        <button @click="showWelcome = true" class="back-btn">
          <span class="btn-icon">🏠</span>
          Home
        </button>
        <h1 class="app-title">Pokémon Dashboard</h1>
        <div class="header-spacer"></div>
      </header>

      <div class="content-area">
    <Dashboard v-if="currentTab === 'dashboard'" />
    <GuessPokemon v-if="currentTab === 'guess'" />
    <MemoryGame v-if="currentTab === 'memory'" />
      </div>
    </div>
  </div>
</template>

<script>
import Dashboard from "./components/Dashboard.vue";
import GuessPokemon from "./components/GuessPokemon.vue";
import MemoryGame from "./components/MemoryGame.vue";

export default {
  components: { Dashboard, GuessPokemon, MemoryGame },
  data() {
    return {
      currentTab: "dashboard",
      showWelcome: true,
    };
  },
  methods: {
    startGame(tab) {
      this.currentTab = tab;
      this.showWelcome = false;
    },
  },
};
</script>

<style>
/* Import Google Fonts for retro gaming feel */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.pokemon-app {
  min-height: 100vh;
  font-family: 'Orbitron', monospace;
  overflow-x: hidden;
}

/* Welcome Screen Styles */
.welcome-screen {
  min-height: 100vh;
  background: linear-gradient(180deg, #87CEEB 0%, #98FB98 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: hidden;
}

/* Animated Background Elements */
.welcome-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3) 2px, transparent 2px),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
    radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.25) 1.5px, transparent 1.5px);
  background-size: 50px 50px, 30px 30px, 40px 40px;
  animation: float 20s ease-in-out infinite;
  z-index: 1;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(1deg); }
}

/* Pokémon Logo */
.pokemon-logo {
  position: relative;
  z-index: 10;
  margin-bottom: 2rem;
  text-align: center;
}

.logo-text {
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(2rem, 8vw, 4rem);
  color: #FFD700;
  text-shadow: 
    4px 4px 0px #0066CC,
    8px 8px 0px #003366,
    12px 12px 20px rgba(0, 0, 0, 0.3);
  transform: perspective(500px) rotateX(15deg);
  animation: logoGlow 3s ease-in-out infinite alternate;
  margin-bottom: 0.5rem;
}

.logo-tm {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  color: #FFD700;
  text-shadow: 2px 2px 0px #0066CC;
  display: inline-block;
  margin-left: 1rem;
}

@keyframes logoGlow {
  0% { 
    text-shadow: 
      4px 4px 0px #0066CC,
      8px 8px 0px #003366,
      12px 12px 20px rgba(0, 0, 0, 0.3);
  }
  100% { 
    text-shadow: 
      4px 4px 0px #0066CC,
      8px 8px 0px #003366,
      12px 12px 30px rgba(255, 215, 0, 0.5);
  }
}

/* Pokémon Characters */
.pokemon-characters {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  margin-bottom: 3rem;
  z-index: 10;
  position: relative;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.pokemon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: bounce 2s ease-in-out infinite;
}

.pokemon-container:nth-child(1) { animation-delay: 0s; }
.pokemon-container:nth-child(2) { animation-delay: 0.3s; }
.pokemon-container:nth-child(3) { animation-delay: 0.6s; }

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

.pokemon-character {
  width: 120px;
  height: 120px;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
  animation: pokemonIdle 3s ease-in-out infinite;
}

.pokemon-character:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4));
}

@keyframes pokemonIdle {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Welcome Content */
.welcome-content {
  text-align: center;
  z-index: 10;
  position: relative;
  max-width: 600px;
}

.welcome-title {
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(1rem, 4vw, 1.5rem);
  color: #2F4F4F;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 0px #FFFFFF;
}

.welcome-subtitle {
  font-size: 1.2rem;
  color: #4682B4;
  margin-bottom: 2rem;
  font-weight: 700;
}

/* Game Buttons */
.game-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.game-btn {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.game-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.game-btn:hover::before {
  left: 100%;
}

.game-btn.primary {
  background: linear-gradient(45deg, #FF6B6B, #FF8E53);
  color: white;
  box-shadow: 0 8px 15px rgba(255, 107, 107, 0.3);
}

.game-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(255, 107, 107, 0.4);
}

.game-btn.secondary {
  background: linear-gradient(45deg, #4ECDC4, #44A08D);
  color: white;
  box-shadow: 0 8px 15px rgba(78, 205, 196, 0.3);
}

.game-btn.secondary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(78, 205, 196, 0.4);
}

.game-btn.tertiary {
  background: linear-gradient(45deg, #A8E6CF, #7FCDCD);
  color: #2F4F4F;
  box-shadow: 0 8px 15px rgba(168, 230, 207, 0.3);
}

.game-btn.tertiary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(168, 230, 207, 0.4);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Main App Styles */
.main-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.back-btn {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.app-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.2rem;
  color: white;
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);
}

.header-spacer {
  width: 100px;
}

.content-area {
  padding: 2rem;
  min-height: calc(100vh - 80px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .pokemon-characters {
    gap: 2rem;
  }
  
  .pokemon-character {
    width: 100px;
    height: 100px;
  }
  
  .game-buttons {
    width: 100%;
  }
  
  .game-btn {
    min-width: 200px;
    font-size: 1rem;
  }
  
  .welcome-screen {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .pokemon-characters {
    gap: 1rem;
  }
  
  .pokemon-character {
    width: 80px;
    height: 80px;
  }
  
  .logo-text {
    font-size: 2rem;
  }
  
  .game-btn {
    min-width: 180px;
    padding: 0.8rem 1.5rem;
  }
}
</style>
