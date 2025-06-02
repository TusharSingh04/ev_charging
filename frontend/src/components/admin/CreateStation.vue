<template>
  <div class="create-station">
    <h1>Create New Charging Station</h1>
    <form @submit.prevent="handleSubmit" class="station-form">
      <div class="form-group">
        <label for="name">Station Name:</label>
        <input 
          type="text" 
          id="name" 
          v-model="station.name" 
          required
          placeholder="Enter station name"
        >
      </div>

      <div class="form-group">
        <label for="address">Address:</label>
        <input 
          type="text" 
          id="address" 
          v-model="station.address" 
          required
          placeholder="Enter station address"
        >
      </div>

      <div class="form-group">
        <label for="chargingType">Charging Type:</label>
        <select id="chargingType" v-model="station.chargingType" required>
          <option value="">Select charging type</option>
          <option value="Type 1">Type 1</option>
          <option value="Type 2">Type 2</option>
          <option value="CCS">CCS</option>
          <option value="CHAdeMO">CHAdeMO</option>
          <option value="Tesla">Tesla</option>
        </select>
      </div>

      <div class="form-group">
        <label for="latitude">Latitude:</label>
        <input 
          type="number" 
          id="latitude" 
          v-model="latitude" 
          required
          step="any"
          placeholder="Enter latitude"
          @input="validateCoordinates"
        >
      </div>

      <div class="form-group">
        <label for="longitude">Longitude:</label>
        <input 
          type="number" 
          id="longitude" 
          v-model="longitude" 
          required
          step="any"
          placeholder="Enter longitude"
          @input="validateCoordinates"
        >
      </div>

      <div class="form-group">
        <label for="totalPorts">Total Ports:</label>
        <input 
          type="number" 
          id="totalPorts" 
          v-model="station.totalPorts" 
          required
          min="1"
          placeholder="Enter total number of ports"
        >
      </div>

      <div class="form-group">
        <label for="chargingRate">Charging Rate (kW):</label>
        <input 
          type="number" 
          id="chargingRate" 
          v-model="station.chargingRate" 
          required
          min="0"
          step="0.1"
          placeholder="Enter charging rate"
        >
      </div>

      <div class="form-group">
        <label for="status">Status:</label>
        <select id="status" v-model="station.status">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button type="submit" class="submit-btn" :disabled="loading || !isValidCoordinates">
        {{ loading ? 'Creating...' : 'Create Station' }}
      </button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import config from '../../config';

export default {
  name: 'CreateStation',
  data() {
    return {
      station: {
        name: '',
        address: '',
        chargingType: '',
        status: 'active',
        location: {
          type: 'Point',
          coordinates: []
        }
      },
      latitude: null,
      longitude: null,
      loading: false,
      error: null,
      isValidCoordinates: false
    };
  },
  methods: {
    validateCoordinates() {
      // Validate latitude (-90 to 90) and longitude (-180 to 180)
      const lat = parseFloat(this.latitude);
      const lng = parseFloat(this.longitude);
      
      this.isValidCoordinates = !isNaN(lat) && !isNaN(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180;

      if (!this.isValidCoordinates) {
        this.error = 'Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)';
      } else {
        this.error = null;
      }
    },
    async handleSubmit() {
      if (!this.isValidCoordinates) {
        this.error = 'Please enter valid coordinates';
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Format the location data according to GeoJSON
        const stationData = {
          ...this.station,
          location: {
            type: 'Point',
            coordinates: [parseFloat(this.longitude), parseFloat(this.latitude)]
          }
        };

        await axios.post(
          `${config.apiUrl}/charging-stations`,
          stationData,
          {
            headers: {
              ...config.headers,
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Show success message
        alert('Station created successfully!');
        
        // Reset form
        this.station = {
          name: '',
          address: '',
          chargingType: '',
          status: 'active',
          location: {
            type: 'Point',
            coordinates: []
          }
        };
        this.latitude = null;
        this.longitude = null;
        this.isValidCoordinates = false;
        
        // Redirect to stations list
        this.$router.push('/admin/stations');
      } catch (error) {
        console.error('Error creating station:', error);
        this.error = error.response?.data?.error || 'Failed to create station';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.create-station {
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

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #4CAF50;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.submit-btn:disabled {
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
</style> 