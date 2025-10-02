<template>
  <div class="pokemon-app">
    <!-- Welcome Screen -->
    <div v-if="showWelcome" class="welcome-screen">
      <div class="pokemon-logo">
        <h1 class="logo-text">Pokémon</h1>
        <div class="logo-tm">TM</div>
      </div>
      
      <div class="split-layout">
        <!-- Left Side - Pokemon Character -->
        <div class="left-section">
          <div class="pokemon-container">
            <img :src="randomPokemonImage" :alt="randomPokemonName" class="main-pokemon" />
          </div>
        </div>
        
        <!-- Right Side - Navigation -->
        <div class="right-section">
          <div class="welcome-content">
            <h2 class="welcome-title">Welcome to the Pokémon World!</h2>
            <p class="welcome-subtitle">Choose your adventure</p>
          </div>
          
          <div class="navigation-buttons">
            <button @click="startGame('dashboard')" class="nav-btn primary">
              <span class="btn-icon">📊</span>
              <span class="btn-text">Pokédex Search</span>
            </button>
            <button @click="startGame('guess')" class="nav-btn secondary">
              <span class="btn-icon">🎯</span>
              <span class="btn-text">Guess that Pokémon</span>
            </button>
            <button @click="startGame('memory')" class="nav-btn tertiary">
              <span class="btn-icon">🧠</span>
              <span class="btn-text">Memory Game</span>
            </button>
            
          </div>
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
        <h1 class="app-title">Pokémon</h1>
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
      randomPokemonImage: "",
      randomPokemonName: "",
    };
  },
  async mounted() {
    await this.loadRandomPokemon();
  },
  methods: {
    startGame(tab) {
      this.currentTab = tab;
      this.showWelcome = false;
    },
    async loadRandomPokemon() {
      try {
        const randomId = Math.floor(Math.random() * 151) + 1; // First generation Pokémon
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const data = await response.json();
        
        this.randomPokemonName = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        this.randomPokemonImage = data.sprites.other['official-artwork'].front_default;
      } catch (error) {
        console.error('Error loading random Pokémon:', error);
        // Fallback to a default Pokémon
        this.randomPokemonName = "Pikachu";
        this.randomPokemonImage = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png";
      }
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
  position: relative;
}

/* Global tiled Pokémon background */
.pokemon-app::before {
  content: '';
  position: fixed;
  inset: 0;

 
  background-size: 320px auto, 280px auto, 320px auto, 260px auto;
  background-position: 0 0, 140px 180px, 280px 360px, 220px 80px;
  opacity: 0.05;
  z-index: 0;
  pointer-events: none;
}

/* Welcome Screen Styles */
.welcome-screen {
  height: 100vh;
  background-image: url('https://images7.alphacoders.com/662/thumb-1920-662102.png');
  background-size: cover;       /* cover the whole screen */
  background-position: center;  /* center the image */
  background-repeat: no-repeat; /* don't repeat */
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: hidden;
}

/* Animated Background Elements */
.welcome-screen::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('https://images7.alphacoders.com/662/thumb-1920-662102.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /* Blur and brighten only the background */
  filter: blur(4px) brightness(1.3);

  z-index: 0;
  pointer-events: none;
}

/* Ensure logo, text, and buttons are on top */
.pokemon-logo,
.welcome-content,
.navigation-buttons {
  position: relative;
  z-index: 10;
}



/* Big Pokémon background */
.welcome-screen::after {
 
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(1deg); }
}

/* Pokémon Logo */
.pokemon-logo {
  position: relative;
  z-index: 10;
  margin: 0.5rem 0;
  text-align: center;
}

.logo-text {
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(2rem, 8vw, 4rem); /* bigger size */
  color: #FFD700;
  text-shadow: 
    4px 4px 0px #0066CC,
    8px 8px 0px #003366,
    12px 12px 20px rgba(0, 0, 0, 0.3);
  transform: perspective(500px) rotateX(15deg);
  animation: logoGlow 3s ease-in-out infinite alternate;
  margin-bottom: 0.5rem; /* adjust spacing */
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

/* Split Layout */
.split-layout {
  display: flex;
  flex: 1;
  width: 100%;
  max-width: 1400px;
  align-items: center;
  gap: 1rem;
  min-height: 0;
}

/* Left Section - Pokemon Character */
.left-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
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

@keyframes pokemonPop {
  0%, 100% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.05); 
  }
}

.main-pokemon {
  width: 500px;  /* larger than before */
  height: 500px;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4));
  transition: all 0.3s ease;
  animation: pokemonFloat 4s ease-in-out infinite;
}

.main-pokemon:hover {
  transform: scale(1.15);
  filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.5));
}




@keyframes pokemonFloat {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  25% { 
    transform: translateY(-10px) rotate(1deg); 
  }
  50% { 
    transform: translateY(-5px) rotate(0deg); 
  }
  75% { 
    transform: translateY(-15px) rotate(-1deg); 
  }
}

/* Right Section - Navigation */
.right-section {
  flex: 0 0 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
}

/* Welcome Content */
.welcome-content {
  text-align: center;
  z-index: 10;
  position: relative;
  max-width: 350px;
  margin-bottom: 1rem;
}

.welcome-title {
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(1rem, 4vw, 1.5rem); /* bigger title */
  color: #2F4F4F;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 0px #FFFFFF;
  text-align: center;
}

.welcome-subtitle {
  font-size: clamp(0.9rem, 3vw, 1.2rem); /* bigger subtitle */
  color: #b246b4;
  margin-bottom: 2rem;
  font-weight: 700;
  text-align: center;
}



/* Navigation Buttons */
.navigation-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;

  position: relative;  /* needed for z-index to work */
  z-index: 10;         /* ensures it sits above ::before/::after */
}


.nav-btn {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 1rem;
  padding: 1rem 1.8rem;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 200px;
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.nav-btn:hover::before {
  left: 100%;
}

.nav-btn.primary {
  background: linear-gradient(45deg, #FF6B6B, #FF8E53);
  color: white;
  box-shadow: 0 8px 15px rgba(255, 107, 107, 0.3);
}

.nav-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(255, 107, 107, 0.4);
}

.nav-btn.secondary {
  background: linear-gradient(45deg, #4ECDC4, #44A08D);
  color: white;
  box-shadow: 0 8px 15px rgba(78, 205, 196, 0.3);
}

.nav-btn.secondary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(78, 205, 196, 0.4);
}

.nav-btn.tertiary {
  background: linear-gradient(45deg, #A8E6CF, #7FCDCD);
  color: #2F4F4F;
  box-shadow: 0 8px 15px rgba(168, 230, 207, 0.3);
}

.nav-btn.tertiary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(168, 230, 207, 0.4);
}

.btn-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.btn-text {
  font-size: 0.9rem;
}

/* Main App Styles */
.main-app {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%);
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
  .split-layout {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .left-section {
    min-height: 35vh;
  }
  
  .main-pokemon {
    width: 250px;
    height: 250px;
  }
  
  .right-section {
    flex: none;
    padding: 0.5rem;
  }
  
  .nav-btn {
    min-width: 180px;
    width: 180px;
    font-size: 0.9rem;
    padding: 0.8rem 1.5rem;
  }
  
  .btn-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .main-pokemon {
    width: 180px;
    height: 180px;
  }
  
  .logo-text {
    font-size: 1.5rem;
  }
  
  .right-section {
    padding: 0.5rem;
  }
  
  .nav-btn {
    min-width: 160px;
    width: 160px;
    padding: 0.7rem 1.2rem;
  }
  
  .btn-text {
    font-size: 0.7rem;
  }
  
  .welcome-title {
    font-size: 0.6rem;
  }
  
  .welcome-subtitle {
    font-size: 0.8rem;
  }
  /* Make sure navigation buttons are always clickable */
.navigation-buttons {
  position: relative;
  z-index: 100; /* stronger than ::before / ::after */
}

.welcome-screen::before,
.welcome-screen::after {
  pointer-events: none; /* prevent them from blocking clicks */
}

}
</style>


