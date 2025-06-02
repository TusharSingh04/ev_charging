<template>
  <nav class="navbar" :class="{ 'mobile': isMobile }">
    <div class="navbar-container">
      <!-- Left side - Brand -->
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-text">EV Charging</span>
        </router-link>
      </div>

      <!-- Mobile menu button -->
      <button v-if="isMobile" class="menu-toggle" @click="toggleMobileMenu" :class="{ 'active': showMobileMenu }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Right side - Navigation -->
      <div class="navbar-menu" :class="{ 'show': showMobileMenu }">
        <!-- Auth Buttons -->
        <div class="auth-buttons">
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="auth-btn login-btn" @click="closeMobileMenu">
              Log in
            </router-link>
            <router-link to="/register" class="auth-btn register-btn" @click="closeMobileMenu">
              Sign up
            </router-link>
          </template>
          <template v-else>
            <button @click="logout" class="auth-btn logout-btn">
              Log out
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      isMobile: false,
      showMobileMenu: false
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
      this.closeMobileMenu();
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.showMobileMenu = false;
      }
    },
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu;
    },
    closeMobileMenu() {
      this.showMobileMenu = false;
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  }
}
</script>

<style scoped>
.navbar {
  background-color: #7F8C8D; /* Steel grey background */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 30px; /* Reduced height */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Brand Styles */
.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  text-decoration: none;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

/* Navigation Menu */
.navbar-menu {
  display: flex;
  align-items: center;
}

/* Auth Buttons */
.auth-buttons {
  display: flex;
  gap: 1rem;
}

.auth-btn {
  padding: 0.5rem 1.25rem;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.login-btn {
  color: white;
  background-color: transparent;
  border: 1px solid white;
}

.login-btn:hover {
  background-color: #3273dc;
  color: white;
  border-color: #3273dc;
}

.register-btn {
  color: white;
  background-color: transparent;
  border: 1px solid white;
}

.register-btn:hover {
  background-color: #3273dc;
  border-color: #3273dc;
}

.logout-btn {
  color: white;
  background-color: transparent;
  border: 1px solid white;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #dc3545;
  color: white;
}

/* Mobile Menu Button */
.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.menu-toggle span {
  width: 100%;
  height: 2px;
  background-color: #ffffff;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.menu-toggle.active span:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.menu-toggle.active span:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

/* Mobile Styles */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
    height: 50px;
  }

  .menu-toggle {
    display: flex;
  }

  .navbar-menu {
    display: none;
    position: fixed;
    top: 50px;
    left: 0;
    right: 0;
    background-color: white;
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .navbar-menu.show {
    display: flex;
  }

  .auth-buttons {
    flex-direction: column;
    width: 100%;
  }

  .auth-btn {
    width: 100%;
    text-align: center;
  }

  .brand-text {
    font-size: 1.25rem;
  }
}
</style> 