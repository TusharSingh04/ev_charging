<template>
  <div class="user-dashboard">
    <UserNavbar />
    
    <div class="dashboard-content">
      
       <div class="view-toggle">
        <button 
          :class="{ active: currentView === 'map' }" 
          @click="currentView = 'map'"
        >
          Map View
        </button>
        <button 
          :class="{ active: currentView === 'list' }" 
          @click="currentView = 'list'"
        >
          List View
        </button>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else>
        <!-- Map View -->
        <div v-if="currentView === 'map'" class="map-container">
          <div id="map" ref="mapContainer"></div>
        </div>

        <!-- List View -->
        <div v-else class="stations-list">
          <div class="stations-grid">
            <div v-for="station in stations" :key="station._id" class="station-card">
              <div class="station-header">
                <h3>{{ station.name }}</h3>
                <span :class="['status-badge', station.status]">{{ station.status }}</span>
              </div>
              
              <div class="station-details">
                <p><strong>Address:</strong> {{ station.address }}</p>
                <p><strong>Available Ports:</strong> {{ station.availablePorts }}/{{ station.totalPorts }}</p>
                <p><strong>Charging Rate:</strong> {{ station.chargingRate }} kW</p>
              </div>

              <div class="station-actions">
                <button 
                  @click="bookStation(station)"
                  :disabled="station.availablePorts === 0"
                  class="action-btn book"
                >
                  {{ station.availablePorts === 0 ? 'No Ports Available' : 'Book Now' }}
                </button>
                <button 
                  @click="showStationDetails(station)"
                  class="action-btn details"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Station Details Modal -->
    <div v-if="selectedStation" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedStation.name }}</h2>
          <button @click="selectedStation = null" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p><strong>Address:</strong> {{ selectedStation.address }}</p>
          <p><strong>Status:</strong> {{ selectedStation.status }}</p>
          <p><strong>Total Ports:</strong> {{ selectedStation.totalPorts }}</p>
          <p><strong>Available Ports:</strong> {{ selectedStation.availablePorts }}</p>
          <p><strong>Charging Rate:</strong> {{ selectedStation.chargingRate }} kW</p>
          <p><strong>Location:</strong> {{ selectedStation.latitude }}, {{ selectedStation.longitude }}</p>
        </div>
        <div class="modal-footer">
          <button 
            @click="bookStation(selectedStation)"
            :disabled="selectedStation.availablePorts === 0"
            class="action-btn book"
          >
            {{ selectedStation.availablePorts === 0 ? 'No Ports Available' : 'Book Now' }}
          </button>
          <button @click="selectedStation = null" class="action-btn cancel">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import config from '../config';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import UserNavbar from './UserNavbar.vue';
import markerIcon from '../assets/marker-icon.svg';

export default {
  name: 'UserDashboard',
  components: {
    UserNavbar
  },
  data() {
    return {
      stations: [],
      loading: false,
      error: null,
      currentView: 'map',
      map: null,
      markers: [],
      selectedStation: null
    };
  },
  async mounted() {
    await this.fetchStations();
    if (this.currentView === 'map') {
      this.$nextTick(() => {
        this.initMap();
      });
    }
  },
  watch: {
    currentView(newView) {
      if (newView === 'map') {
        this.$nextTick(() => {
          this.initMap();
        });
      } else if (this.map) {
        this.map.remove();
        this.map = null;
      }
    }
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
        console.log('Fetched stations:', this.stations);
      } catch (error) {
        console.error('Error fetching stations:', error);
        this.error = error.response?.data?.error || 'Failed to load stations';
      } finally {
        this.loading = false;
      }
    },
    initMap() {
      if (this.map) {
        this.map.remove();
      }

      // Initialize map
      this.map = L.map('map').setView([20.5937, 78.9629], 5);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Set custom marker icon
      const customIcon = L.icon({
        iconUrl: markerIcon,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      });

      // Add markers
      this.markers = this.stations
        .map(station => {
           // Check if location and coordinates are valid
          if (station.location && station.location.coordinates && station.location.coordinates.length >= 2) {
            const latitude = station.location.coordinates[1];
            const longitude = station.location.coordinates[0];

            const marker = L.marker([latitude, longitude], { icon: customIcon })
              .bindPopup(`
                <div class="marker-popup">
                  <h3>${station.name}</h3>
                  <p>${station.address}</p>
                  <p>Available Ports: ${station.availablePorts}/${station.totalPorts}</p>
                  <button onclick="window.dispatchEvent(new CustomEvent('book-station', { detail: '${station._id}' }))">
                    Book Now
                  </button>
                </div>
              `);
            
            marker.addTo(this.map);
            return marker;
          } else {
            console.warn('Station with missing or invalid location data:', station);
            return null;
          }
        })
        .filter(marker => marker !== null);

      // Fit map to show all markers
      if (this.markers.length > 0) {
        const group = new L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.1));
      }

      // Invalidate map size to ensure tiles render correctly
      this.map.invalidateSize();

      // Listen for booking events from popup
      window.addEventListener('book-station', (event) => {
        const station = this.stations.find(s => s._id === event.detail);
        if (station) {
          this.bookStation(station);
        }
      });
    },
    showStationDetails(station) {
      this.selectedStation = station;
    },
    async bookStation(station) {
      if (station.availablePorts === 0) return;

      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${config.apiUrl}/bookings`,
          { stationId: station._id },
          {
            headers: {
              ...config.headers,
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Update station data
        await this.fetchStations();
        if (this.currentView === 'map') {
          this.initMap();
        }

        // Show success message
        alert('Booking successful!');
      } catch (error) {
        console.error('Error booking station:', error);
        alert(error.response?.data?.error || 'Failed to book station');
      }
    }
  }
};
</script>

<style scoped>
.user-dashboard {
  min-height: 100vh;
  background-color: #f5f5f5;
  height:100%;
  padding-top: 70px;
}

.dashboard-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

}

.view-toggle {
  display: flex;
  gap: 1rem;
  margin-bottom: 20px;
}

.view-toggle button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s;
}

.view-toggle button.active {
  background-color: #4CAF50;
  color: white;
}

.map-container {
  height: calc(100vh - 200px);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

#map {
  height: 100%;
  width: 100%;
}

.stations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.station-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  border: none;
  cursor: pointer;
}

.action-btn.book {
  background-color: #4CAF50;
  color: white;
}

.action-btn.book:hover:not(:disabled) {
  background-color: #45a049;
}

.action-btn.details {
  background-color: #2196f3;
  color: white;
}

.action-btn.details:hover {
  background-color: #1976d2;
}

.action-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 10px 0;
  color: #666;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.action-btn.cancel {
  background-color: #9e9e9e;
  color: white;
}

.action-btn.cancel:hover {
  background-color: #757575;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

:deep(.marker-popup) {
  text-align: center;
}

:deep(.marker-popup h3) {
  margin: 0 0 10px;
  color: #2c3e50;
}

:deep(.marker-popup p) {
  margin: 5px 0;
  color: #666;
}

:deep(.marker-popup button) {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

:deep(.marker-popup button:hover) {
  background-color: #45a049;
}
</style> 