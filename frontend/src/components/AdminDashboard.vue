<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>Admin Dashboard</h1>
      <router-link to="/admin/stations/create" class="create-btn">
        Create New Station
      </router-link>
    </div>

    <div class="stats-container">
      <div class="stat-card">
        <h3>Total Stations</h3>
        <p>{{ stats.totalStations }}</p>
      </div>
      <div class="stat-card">
        <h3>Active Stations</h3>
        <p>{{ stats.activeStations }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Users</h3>
        <p>{{ stats.totalUsers }}</p>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else class="stations-container">
      <div class="stations-header">
        <h2>All Stations ({{ stations.length }})</h2>
      </div>

      <div class="stations-grid">
        <div v-for="station in stations" :key="station._id" class="station-card">
          <div class="station-header">
            <h3>{{ station.name }}</h3>
            <span :class="['status-badge', station.status]">{{ station.status }}</span>
          </div>
          
          <div class="station-details">
            <p><strong>Address:</strong> {{ station.address }}</p>
            <p><strong>Total Ports:</strong> {{ station.totalPorts }}</p>
            <p><strong>Available Ports:</strong> {{ station.availablePorts }}</p>
            <p><strong>Charging Rate:</strong> {{ station.chargingRate }} kW</p>
            <p><strong>Location:</strong> {{ station.latitude }}, {{ station.longitude }}</p>
          </div>

          <div class="station-actions">
            <router-link 
              :to="`/admin/stations/update?id=${station._id}`" 
              class="action-btn edit"
            >
              Edit
            </router-link>
            <router-link 
              :to="`/admin/stations/delete?id=${station._id}`" 
              class="action-btn delete"
            >
              Delete
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import config from '../config';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      stations: [],
      loading: false,
      error: null,
      stats: {
        totalStations: 0,
        activeStations: 0,
        totalUsers: 0
      }
    };
  },
  async mounted() {
    await Promise.all([
      this.fetchStations(),
      this.fetchStats()
    ]);
  },
  methods: {
    async fetchStations() {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${config.apiUrl}/charging-stations`, {
          headers: {
            ...config.headers,
            Authorization: `Bearer ${token}`
          }
        });

        this.stations = response.data;
      } catch (error) {
        console.error('Error fetching stations:', error);
        this.error = error.response?.data?.error || 'Failed to load stations';
      } finally {
        this.loading = false;
      }
    },
    async fetchStats() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${config.apiUrl}/admin/stats`, {
          headers: {
            ...config.headers,
            Authorization: `Bearer ${token}`
          }
        });

        this.stats = response.data;
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.stat-card p {
  margin: 10px 0 0;
  font-size: 2rem;
  font-weight: bold;
  color: #4CAF50;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  color: #ff5252;
  text-align: center;
  padding: 20px;
  background: #ffebee;
  border-radius: 8px;
  margin: 20px 0;
}

.stations-header {
  margin-bottom: 20px;
}

.create-btn {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.create-btn:hover {
  background-color: #45a049;
}

.stations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.station-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.station-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background-color: #ffebee;
  color: #c62828;
}

.status-badge.maintenance {
  background-color: #fff3e0;
  color: #ef6c00;
}

.station-details {
  margin-bottom: 15px;
}

.station-details p {
  margin: 5px 0;
  color: #666;
}

.station-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 8px;
  text-align: center;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.action-btn.edit {
  background-color: #2196f3;
  color: white;
}

.action-btn.edit:hover {
  background-color: #1976d2;
}

.action-btn.delete {
  background-color: #f44336;
  color: white;
}

.action-btn.delete:hover {
  background-color: #d32f2f;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 