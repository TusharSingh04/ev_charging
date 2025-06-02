<template>
  <div class="update-station">
    <h1>Update Charging Station</h1>
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
    </div>
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    <div v-else class="station-form">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Station Name (Text) <span class="required">*</span></label>
          <input
            type="text"
            id="name"
            v-model="station.name"
            required
            placeholder="Enter station name"
          />
        </div>

        <div class="form-group">
          <label for="address">Address (Text) <span class="required">*</span></label>
          <input
            type="text"
            id="address"
            v-model="station.address"
            required
            placeholder="Enter station address"
          />
        </div>

        <div class="form-group">
          <label for="chargingType">Charging Type (Select) <span class="required">*</span></label>
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
          <label for="connectorType">Connector Type (Text)</label>
          <input
            type="text"
            id="connectorType"
            v-model="station.connectorType"
            placeholder="Enter connector type"
          />
        </div>

        <div class="form-group">
          <label for="powerOutput">Power Output (kW) (Number)</label>
          <input
            type="number"
            id="powerOutput"
            v-model="station.powerOutput"
            step="any"
            placeholder="Enter power output"
          />
        </div>

        <div class="form-group">
          <label for="pricePerKWh">Price Per KWh (Number)</label>
          <input
            type="number"
            id="pricePerKWh"
            v-model="station.pricePerKWh"
            step="any"
            placeholder="Enter price per KWh"
          />
        </div>

        <div class="form-group">
          <label for="operatingHours">Operating Hours (Text)</label>
          <input
            type="text"
            id="operatingHours"
            v-model="station.operatingHours"
            placeholder="Enter operating hours"
          />
        </div>

        <div class="form-group">
          <label for="amenities">Amenities (Comma-separated text)</label>
          <input
            type="text"
            id="amenities"
            v-model="station.amenities"
            placeholder="Enter amenities"
          />
        </div>

        <div class="form-group">
          <label for="latitude">Latitude (Number) <span class="required">*</span></label>
          <input
            type="number"
            id="latitude"
            v-model="station.latitude"
            step="any"
            required
            placeholder="Enter latitude"
          />
        </div>

        <div class="form-group">
          <label for="longitude">Longitude (Number) <span class="required">*</span></label>
          <input
            type="number"
            id="longitude"
            v-model="station.longitude"
            step="any"
            required
            placeholder="Enter longitude"
          />
        </div>

        <div class="form-group">
          <label for="status">Status (Select)</label>
          <select id="status" v-model="station.status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" @click="goBack" class="cancel-btn">Cancel</button>
          <button type="submit" :disabled="submitting" class="submit-btn">
            {{ submitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import config from '../../config'

export default {
  name: 'UpdateStation',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const station = ref({
      name: '',
      address: '',
      chargingType: '',
      connectorType: '',
      powerOutput: null,
      pricePerKWh: null,
      operatingHours: '',
      amenities: '',
      status: 'active',
      latitude: '',
      longitude: ''
    })
    const loading = ref(true)
    const submitting = ref(false)
    const error = ref(null)

    const fetchStation = async () => {
      try {
        loading.value = true
        error.value = null
        const response = await axios.get(
          `${config.apiUrl}/charging-stations/${route.params.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )
        const stationData = response.data
        station.value = {
          ...stationData,
          latitude: stationData.location?.coordinates?.[1] || '',
          longitude: stationData.location?.coordinates?.[0] || '',
          // Handle amenities which might be an array on the backend
          amenities: Array.isArray(stationData.amenities) ? stationData.amenities.join(', ') : stationData.amenities || ''
        }
      } catch (err) {
        console.error('Error fetching station:', err)
        error.value = err.response?.data?.error || 'Failed to load station'
      } finally {
        loading.value = false
      }
    }

    const handleSubmit = async () => {
      try {
        submitting.value = true
        error.value = null

        const stationData = {
          name: station.value.name,
          address: station.value.address,
          chargingType: station.value.chargingType,
          connectorType: station.value.connectorType,
          powerOutput: parseFloat(station.value.powerOutput),
          pricePerKWh: parseFloat(station.value.pricePerKWh),
          operatingHours: station.value.operatingHours,
          // Split amenities string into an array
          amenities: station.value.amenities.split(',').map(item => item.trim()),
          status: station.value.status,
          location: {
            type: 'Point',
            coordinates: [
              parseFloat(station.value.longitude),
              parseFloat(station.value.latitude)
            ]
          }
        }

        const response = await axios.patch(
          `${config.apiUrl}/charging-stations/${route.params.id}`,
          stationData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )

        if (response.data) {
          router.push('/admin/dashboard')
        }
      } catch (err) {
        console.error('Error updating station:', err)
        error.value = err.response?.data?.error || 'Failed to update station'
      } finally {
        submitting.value = false
      }
    }

    const goBack = () => {
      router.push('/admin/dashboard')
    }

    onMounted(() => {
      fetchStation()
    })

    return {
      station,
      loading,
      submitting,
      error,
      handleSubmit,
      goBack
    }
  }
}
</script>

<style scoped>
.update-station {
  padding: 2rem;
  padding-top: 70px;
  max-width: 600px;
  margin: 0 auto;
}

.station-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
  border: none;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.submit-btn:hover:not(:disabled) {
  background-color: #43a047;
}

.submit-btn:disabled {
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
  color: #dc3545;
  text-align: center;
  padding: 1rem;
  background: #ffebee;
  border-radius: 4px;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 