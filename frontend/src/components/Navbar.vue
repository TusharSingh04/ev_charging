<template>
  <nav class="navbar" :class="{ 'mobile': isMobile }">
    <div class="nav-brand">
      <router-link to="/">EV Charging</router-link>
    </div>
    <div class="nav-links" :class="{ 'mobile-menu': isMobile, 'show': showMobileMenu }">
      <template v-if="isAuthenticated">
        <router-link to="/chargers" @click="closeMobileMenu">Charging Stations</router-link>
        <a href="#" @click.prevent="handleLogout" class="logout-btn" @click="closeMobileMenu">Logout</a>
      </template>
      <template v-else>
        <router-link to="/login" @click="closeMobileMenu">Login</router-link>
      </template>
    </div>
    <button v-if="isMobile" class="menu-toggle" @click="toggleMobileMenu">
      <span></span>
      <span></span>
      <span></span>
    </button>
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
    isAuthenticated() {
      return !!localStorage.getItem('token')
    }
  },
  methods: {
    handleLogout() {
      localStorage.removeItem('token')
      this.$router.push('/login')
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768
      if (!this.isMobile) {
        this.showMobileMenu = false
      }
    },
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu
    },
    closeMobileMenu() {
      this.showMobileMenu = false
    }
  },
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
  }
}
</script>

<style scoped>
.navbar {
  background-color: rgba(44, 62, 80, 0.9);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  backdrop-filter: blur(10px);
}

.nav-brand a {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-links a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.logout-btn {
  background-color: #e74c3c;
}

.logout-btn:hover {
  background-color: #c0392b;
}

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
}

.menu-toggle span {
  width: 100%;
  height: 3px;
  background-color: white;
  border-radius: 3px;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }

  .menu-toggle {
    display: flex;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: rgba(44, 62, 80, 0.95);
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    backdrop-filter: blur(10px);
  }

  .nav-links.mobile-menu {
    display: flex;
  }

  .nav-links.show {
    display: flex;
  }

  .nav-links a {
    width: 100%;
    text-align: center;
    padding: 0.75rem;
  }

  .nav-brand a {
    font-size: 1.2rem;
  }
}
</style> 