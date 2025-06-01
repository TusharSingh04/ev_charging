<template>
  <div class="home">
    <h1>Welcome to EV Charging Station</h1>
    <p>Find and manage charging stations near you</p>
    <div class="cta-buttons">
      <router-link to="/login" class="login-btn">Login</router-link>
      <router-link to="/chargers" class="view-stations-btn">View Stations</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  padding: 20px;
  text-align: center;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(-45deg, #333333, #555555, #444444, #555555);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  color: white;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.login-btn, .view-stations-btn {
  padding: 0.75rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.login-btn {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
}

.view-stations-btn {
  background: linear-gradient(45deg, #2196F3, #1976D2);
  color: white;
}

.login-btn:hover, .view-stations-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .cta-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .login-btn, .view-stations-btn {
    width: 100%;
    text-align: center;
  }
}
</style> 