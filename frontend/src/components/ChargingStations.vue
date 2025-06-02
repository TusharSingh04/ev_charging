<template>
  <div class="charging-stations">
    <div id="map" class="map-container"></div>
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import config from '../config';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'ChargingStations',
  data() {
    return {
      map: null,
      markers: [],
      loading: false,
      error: null,
      stations: []
    };
  },
  async mounted() {
    try {
      // Initialize map
      this.map = L.map('map').setView([20.5937, 78.9629], 5); // Center on India
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Fetch charging stations
      await this.fetchChargingStations();
    } catch (error) {
      console.error('Map initialization error:', error);
      this.error = 'Failed to initialize map';
    }
  },
  methods: {
    async fetchChargingStations() {
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
        this.addMarkersToMap();
      } catch (error) {
        console.error('Error fetching charging stations:', error);
        this.error = error.response?.data?.error || 'Failed to load charging stations';
      } finally {
        this.loading = false;
      }
    },
    addMarkersToMap() {
      // Clear existing markers
      this.markers.forEach(marker => marker.remove());
      this.markers = [];

      // Add new markers
      this.stations.forEach(station => {
        const marker = L.marker([station.latitude, station.longitude])
          .bindPopup(`
            <strong>${station.name}</strong><br>
            Status: ${station.status}<br>
            Available Ports: ${station.availablePorts}/${station.totalPorts}
          `);
        
        marker.addTo(this.map);
        this.markers.push(marker);
      });

      // Fit map bounds to show all markers
      if (this.markers.length > 0) {
        const group = new L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  }
};
</script>

<style scoped>
.charging-stations {
  position: relative;
  width: 100%;
  height: calc(100vh - 64px); /* Adjust based on your navbar height */
}

.map-container {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
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
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff5252;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 1000;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 