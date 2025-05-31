<template>
  <div id="app" :class="{ 'mobile-view': isMobile }">
    <div class="background-layer background-layer-1"></div>
    <div class="background-layer background-layer-2"></div>
    <Navbar />
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar
  },
  data() {
    return {
      isMobile: false,
      colors: [
        'linear-gradient(135deg, #787775 0%, #ebebeb 100%)',
        'linear-gradient(135deg, #232220 0%, #ffddba 100%)',
        'linear-gradient(135deg, #152c43 0%, #f5f0ec 100%)',
        // You can add more subtle gradient palettes here if you like
      ],
      currentColorIndex: 0,
      currentBackground: 1 // 1 or 2, indicates which layer is currently visible
    }
  },
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
    this.startColorTransition()
    // Set initial background
    document.querySelector('.background-layer-1').style.backgroundImage = this.colors[this.currentColorIndex];
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768
    },
    startColorTransition() {
      setInterval(() => {
        const nextColorIndex = (this.currentColorIndex + 1) % this.colors.length;
        const currentLayer = document.querySelector(`.background-layer-${this.currentBackground}`);
        const nextLayer = document.querySelector(`.background-layer-${this.currentBackground === 1 ? 2 : 1}`);

        // Set the next background image and bring it to the front
        nextLayer.style.backgroundImage = this.colors[nextColorIndex];
        nextLayer.style.opacity = 1;
        currentLayer.style.opacity = 0;

        // Update state for the next cycle
        this.currentColorIndex = nextColorIndex;
        this.currentBackground = this.currentBackground === 1 ? 2 : 1;

      }, 10000); // Change color every 10 seconds
    }
  }
}
</script>

<style>
:root {
  --dynamic-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative; /* Needed for absolute positioning of background layers */
  overflow: hidden; /* Hide any overflow from background layers */
}

/* Add a dark overlay */
#app::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); /* Dark overlay with 40% opacity */
  z-index: -1;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2; /* Position behind the overlay and content */
  transition: opacity 2s ease-in-out; /* Smooth transition for opacity */
  background-size: cover; /* Cover the entire area */
}

.background-layer-1 {
  opacity: 1; /* Initially visible */
}

.background-layer-2 {
  opacity: 0; /* Initially hidden */
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative; /* Ensure content is above background layers */
  z-index: 0;
}

/* Reset some default styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #ffffff;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Responsive styles */
@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
}

/* Mobile-specific styles */
.mobile-view .main-content {
  padding: 10px;
}

/* Global responsive typography */
html {
  font-size: 16px;
}

@media (max-width: 768px) {
  html {
    font-size: 14px;
  }
}

/* Smooth transitions */
* {
  /* transition: all 0.3s ease; Remove this to prevent unintended transitions on all elements */
}

/* Add text shadow to all text elements */
h1, h2, h3, h4, h5, h6, p, span, a, button {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style> 