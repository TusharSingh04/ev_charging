<template>
  <div class="charger-list-container">
    <div class="header">
      <h2>Charging Stations</h2>
      <div class="header-controls">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search stations..."
            @input="filterStations"
          >
        </div>
        <div class="filters">
          <select v-model="statusFilter" @change="filterStations">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="in-use">In Use</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
          <select v-model="connectorFilter" @change="filterStations">
            <option value="">All Connectors</option>
            <option value="Type 1">Type 1</option>
            <option value="Type 2">Type 2</option>
            <option value="CCS">CCS</option>
            <option value="CHAdeMO">CHAdeMO</option>
          </select>
          <select v-model="powerFilter" @change="filterStations">
            <option value="">All Power Outputs</option>
            <option value="7">7 kW</option>
            <option value="22">22 kW</option>
            <option value="50">50 kW</option>
            <option value="150">150 kW</option>
          </select>
        </div>
        <button @click="refreshList" class="refresh-btn" :disabled="loading">
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <p v-if="error === 'Network Error'" class="error-hint">
        Please check your internet connection
      </p>
      <p v-if="error === 'Please authenticate.'" class="error-hint">
        Your session has expired. Please login again.
      </p>
      <button v-if="error === 'Please authenticate.'" @click="handleReLogin" class="retry-btn">
        Go to Login
      </button>
    </div>

    <div v-else-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading charging stations...</p>
    </div>

    <div v-else-if="filteredStations.length === 0" class="empty-state">
      <p>No charging stations found.</p>
      <p class="empty-hint">Try adjusting your search or filters.</p>
    </div>
    
    <div v-else>
      <!-- Map View -->
      <ChargerMap 
        :stations="filteredStations"
        :center="mapCenter"
        :zoom="mapZoom"
      />

      <!-- Desktop Table View -->
      <table v-if="!isMobile" class="charger-table">
        <thead>
          <tr>
            <th @click="sortBy('name')" class="sortable">
              Name
              <span v-if="sortKey === 'name'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('status')" class="sortable">
              Status
              <span v-if="sortKey === 'status'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('powerOutput')" class="sortable">
              Power Output
              <span v-if="sortKey === 'powerOutput'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('connectorType')" class="sortable">
              Connector Type
              <span v-if="sortKey === 'connectorType'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('latitude')" class="sortable">
              Location
              <span v-if="sortKey === 'latitude'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('updatedAt')" class="sortable">
              Last Updated
              <span v-if="sortKey === 'updatedAt'" class="sort-icon">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="station in sortedStations" :key="station._id">
            <td>{{ station.name }}</td>
            <td>
              <span :class="['status', station.status]">
                {{ station.status }}
              </span>
            </td>
            <td>{{ station.powerOutput }}kW</td>
            <td>{{ station.connectorType }}</td>
            <td>{{ station.latitude }}, {{ station.longitude }}</td>
            <td>{{ formatDate(station.updatedAt) }}</td>
            <td class="actions">
              <button @click="viewDetails(station)" class="action-btn view-btn">
                View Details
              </button>
              <button 
                v-if="station.status === 'available'" 
                @click="bookStation(station)"
                class="action-btn book-btn"
              >
                Book
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile Card View -->
      <div v-else class="charger-cards">
        <div v-for="station in sortedStations" :key="station._id" class="charger-card">
          <h3>{{ station.name }}</h3>
          <div class="card-details">
            <div class="detail-item">
              <span class="label">Status:</span>
              <span :class="['status', station.status]">{{ station.status }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Power Output:</span>
              <span>{{ station.powerOutput }}kW</span>
            </div>
            <div class="detail-item">
              <span class="label">Connector Type:</span>
              <span>{{ station.connectorType }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Location:</span>
              <span>{{ station.latitude }}, {{ station.longitude }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Last Updated:</span>
              <span>{{ formatDate(station.updatedAt) }}</span>
            </div>
            <div class="card-actions">
              <button @click="viewDetails(station)" class="action-btn view-btn">
                View Details
              </button>
              <button 
                v-if="station.status === 'available'" 
                @click="bookStation(station)"
                class="action-btn book-btn"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add this before the closing div of charger-list-container -->
    <div v-if="selectedStation" class="modal-overlay" @click="closeDetails">
      <div class="modal-content" @click.stop>
        <ChargerDetails 
          :station="selectedStation"
          @close="closeDetails"
          @booking-success="handleBookingSuccess"
          @status-updated="handleStatusUpdated"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import ChargerMap from './ChargerMap.vue'
import ChargerDetails from './ChargerDetails.vue'

export default {
  name: 'ChargerList',
  components: {
    ChargerMap,
    ChargerDetails
  },
  data() {
    return {
      stations: [],
      filteredStations: [],
      loading: true,
      error: null,
      isMobile: false,
      searchQuery: '',
      statusFilter: '',
      connectorFilter: '',
      powerFilter: '',
      sortKey: 'name',
      sortOrder: 'asc',
      refreshInterval: null,
      mapCenter: {
        lat: 20.5937, // Default center (India)
        lng: 78.9629
      },
      mapZoom: 5,
      selectedStation: null
    }
  },
  computed: {
    sortedStations() {
      return [...this.filteredStations].sort((a, b) => {
        let aVal = a[this.sortKey]
        let bVal = b[this.sortKey]
        
        if (this.sortKey === 'powerOutput') {
          aVal = parseFloat(aVal)
          bVal = parseFloat(bVal)
        }
        
        if (this.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    }
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$router.push('/login')
        return false
      }
      return true
    },
    setupAxiosAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    },
    async fetchStations() {
      if (!this.checkAuth()) return
      
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get('http://localhost:5000/api/charging-stations')
        this.stations = response.data
        this.filteredStations = response.data
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.error = 'Session expired. Please login again.'
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            this.$router.push('/login')
          } else {
            this.error = err.response.data.error || 'Failed to fetch charging stations'
          }
        } else if (err.request) {
          this.error = 'Network Error - Please check your internet connection'
        } else {
          this.error = err.message || 'An unexpected error occurred'
        }
      } finally {
        this.loading = false
      }
    },
    async bookStation(station) {
      if (!this.checkAuth()) return
      
      try {
        await axios.post(`http://localhost:5000/api/charging-stations/${station._id}/book`)
        await this.fetchStations() // Refresh the list
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            this.error = 'Session expired. Please login again.'
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            this.$router.push('/login')
          } else {
            this.error = err.response.data.error || 'Failed to book charging station'
          }
        } else if (err.request) {
          this.error = 'Network Error - Please check your internet connection'
        } else {
          this.error = err.message || 'An unexpected error occurred'
        }
      }
    },
    filterStations() {
      this.filteredStations = this.stations.filter(station => {
        const matchesSearch = station.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        const matchesStatus = !this.statusFilter || station.status === this.statusFilter
        const matchesConnector = !this.connectorFilter || station.connectorType === this.connectorFilter
        const matchesPower = !this.powerFilter || station.powerOutput.toString() === this.powerFilter
        
        return matchesSearch && matchesStatus && matchesConnector && matchesPower
      })
    },
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortOrder = 'asc'
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString()
    },
    viewDetails(station) {
      this.selectedStation = station
    },
    closeDetails() {
      this.selectedStation = null
    },
    handleBookingSuccess() {
      this.selectedStation = null
      this.fetchStations()
    },
    handleStatusUpdated() {
      this.selectedStation = null
      this.fetchStations()
    },
    handleReLogin() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768
    },
    startAutoRefresh() {
      // Refresh every 30 seconds
      this.refreshInterval = setInterval(() => {
        this.fetchStations()
      }, 30000)
    },
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
      }
    }
  },
  mounted() {
    this.setupAxiosAuth()
    this.fetchStations()
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
    this.startAutoRefresh()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
    this.stopAutoRefresh()
  }
}
</script>

<style scoped>
.charger-list-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(-45deg, #333333, #555555, #444444, #555555);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.5s ease;
  color: #444444; /* Setting a dark gray for general text */
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

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.header h2 {
  color: #444444; /* Dark grayish color for the title */
}

.header-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filters select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.refresh-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.charger-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 1rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

th {
  background: rgba(245, 245, 245, 0.9);
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.5s ease;
}

.available {
  background: linear-gradient(45deg, #e6ffe6, #ccffcc);
  color: #006600;
  transition: all 0.5s ease;
}

.in-use {
  background: linear-gradient(45deg, #fff3e6, #ffe0b3);
  color: #cc7700;
  transition: all 0.5s ease;
}

.maintenance {
  background: linear-gradient(45deg, #ffe6e6, #ffcccc);
  color: #cc0000;
  transition: all 0.5s ease;
}

.offline {
  background: linear-gradient(45deg, #f2f2f2, #e6e6e6);
  color: #666666;
  transition: all 0.5s ease;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: #dc3545;
  text-align: center;
  padding: 1rem;
  background: rgba(248, 215, 218, 0.9);
  border-radius: 8px;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
}

.error-hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  color: #721c24;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(45deg, #dc3545, #c82333);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.empty-hint {
  color: #666;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

/* Mobile Card View Styles */
.charger-cards {
  display: grid;
  gap: 1rem;
  padding: 0.5rem;
}

.charger-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.5s ease;
}

.charger-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.95);
}

.charger-card h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.card-details {
  display: grid;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #666;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .charger-list-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header h2 {
    margin: 0;
  }

  .refresh-btn {
    width: 100%;
  }

  .header-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    flex-direction: column;
  }

  .filters select {
    width: 100%;
  }

  .card-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.sort-icon {
  margin-left: 0.5rem;
  font-size: 0.8rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.view-btn {
  background: linear-gradient(45deg, #2196F3, #1976D2);
  color: white;
}

.book-btn {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.modal-overlay {
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
  padding: 1rem;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}
</style> 