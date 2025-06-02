<template>
  <nav class="navbar">
    <div class="nav-brand">EV Charging Admin</div>
    <div class="nav-links">
      <router-link to="/admin/stations/create" class="nav-link">Create Station</router-link>
      <router-link to="/admin/stations" class="nav-link">All Stations</router-link>
      <router-link to="/admin/stations/update" class="nav-link">Update Station</router-link>
      <router-link to="/admin/stations/delete" class="nav-link">Delete Station</router-link>
      <button @click="handleLogout" class="logout-btn">Logout</button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AdminNavbar',
  methods: {
    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height:170px;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.logout-btn {
  background: none;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: white;
  color: #2c3e50;
}
</style> 