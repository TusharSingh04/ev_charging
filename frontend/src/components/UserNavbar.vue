<template>
  <nav class="user-navbar">
    <div class="nav-brand">
      <h1>EV Charging</h1>
    </div>
    <div class="nav-links">
      <!-- Removed Map View link as per user request -->
      <!-- <router-link 
        to="/user/dashboard" 
        class="nav-link"
        :class="{ active: $route.path === '/user/dashboard' }"
      >
        Map View
      </router-link> -->
      <!-- Removed Charging Stations link as per user request -->
      <!-- <router-link 
        to="/user/stations" 
        class="nav-link"
        :class="{ active: $route.path === '/user/stations' }"
      >
        Charging Stations
      </router-link> -->
    </div>
    <div class="nav-actions">
      <button @click="handleLogout" class="logout-btn">Logout</button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'UserNavbar',
  methods: {
    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.user-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-brand h1 {
  margin: 0;
  color: #4CAF50;
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #4CAF50;
  background-color: #f5f5f5;
}

.nav-link.active {
  color: #4CAF50;
  background-color: #e8f5e9;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #d32f2f;
}
</style> 