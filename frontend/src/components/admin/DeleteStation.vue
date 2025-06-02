<template>
  <div class="delete-station">
    <h1>Delete Charging Station</h1>
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
    </div>
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    <div v-else class="station-form">
      <div class="form-group">
        <label for="station">Select Station to Delete:</label>
        <select id="station" v-model="selectedStationId" required>
          <option value="">Select a station</option>
          <option v-for="station in stations" :key="station._id" :value="station._id">
            {{ station.name }} - {{ station.address }}
          </option>
        </select>
      </div>

      <div v-if="selectedStationId" class="station-details">
        <h3>Station Details</h3>
        <p><strong>Name:</strong> {{ selectedStation.name }}</p>
        <p><strong>Address:</strong> {{ selectedStation.address }}</p>
        <p><strong>Total Ports:</strong> {{ selectedStation.totalPorts }}</p>
        <p><strong>Available Ports:</strong> {{ selectedStation.availablePorts }}</p>
        <p><strong>Status:</strong> {{ selectedStation.status }}</p>
      </div>

      <div v-if="selectedStationId" class="warning-message">
        <p>⚠️ Warning: This action cannot be undone. Are you sure you want to delete this station?</p>
      </div>

      <button 
        v-if="selectedStationId"
        @click="handleDelete" 
        class="delete-btn"
        :disabled="deleting"
      >
        {{ deleting ? 'Deleting...' : 'Delete Station' }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import config from '../../config';

export default {
  name: 'DeleteStation',
  data() {
    return {
      stations: [],
      selectedStationId: '',
      selectedStation: null,
      loading: false,
      deleting: false,
      error: null
    };
  },
  async mounted() {
    await this.fetchStations();
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
    async handleDelete() {
      if (!confirm('Are you absolutely sure you want to delete this station?')) {
        return;
      }

      this.deleting = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        await axios.delete(
          `${config.apiUrl}/charging-stations/${this.selectedStationId}`,
          {
            headers: {
              ...config.headers,
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Show success message
        alert('Station deleted successfully!');
        
        // Reset selection and refresh list
        this.selectedStationId = '';
        this.selectedStation = null;
        await this.fetchStations();
      } catch (error) {
        console.error('Error deleting station:', error);
        this.error = error.response?.data?.error || 'Failed to delete station';
      } finally {
        this.deleting = false;
      }
    }
  },
  watch: {
    selectedStationId(newId) {
      if (newId) {
        this.selectedStation = this.stations.find(s => s._id === newId);
      } else {
        this.selectedStation = null;
      }
    }
  }
};
</script>

<style scoped>
.delete-station {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.station-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

select:focus {
  outline: none;
  border-color: #4CAF50;
}

.station-details {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.station-details h3 {
  margin-top: 0;
  color: #2c3e50;
}

.station-details p {
  margin: 5px 0;
  color: #666;
}

.warning-message {
  color: #ff5252;
  text-align: center;
  padding: 10px;
  background: #ffebee;
  border-radius: 4px;
  margin: 20px 0;
}

.delete-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-btn:hover:not(:disabled) {
  background-color: #ff1744;
}

.delete-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff5252;
  text-align: center;
  padding: 10px;
  background: #ffebee;
  border-radius: 4px;
  margin-top: 1rem;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 