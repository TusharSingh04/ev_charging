<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <h1>Admin Dashboard</h1>
      <button @click="handleLogout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    </header>

    <div class="dashboard-content">
      <div class="stations-section">
        <div class="section-header">
          <h2>Charging Stations</h2>
          <button @click="showAddStationModal = true" class="add-btn">
            <i class="fas fa-plus"></i> Add New Station
          </button>
        </div>

        <div class="stations-list">
          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>Loading stations...</p>
          </div>
          <div v-else-if="error" class="error">
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
          </div>
          <div v-else-if="stations.length === 0" class="no-stations">
            <i class="fas fa-info-circle"></i>
            <p>No charging stations found</p>
          </div>
          <div v-else class="stations-grid">
            <div v-for="station in stations" :key="station._id" class="station-card">
              <h3>{{ station.name }}</h3>
              <p><strong>Address:</strong> {{ station.address }}</p>
              <p><strong>Status:</strong> 
                <span :class="['status-badge', station.status]">
                  {{ station.status }}
                </span>
              </p>
              <p><strong>Charging Type:</strong> {{ station.chargingType }}</p>
              <div class="station-actions">
                <button @click="editStation(station)" class="edit-btn">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button @click="deleteStation(station._id)" class="delete-btn">
                  <i class="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Station Modal -->
    <div v-if="showAddStationModal" class="modal">
      <div class="modal-content">
        <h2>{{ editingStation ? 'Edit Station' : 'Add New Station' }}</h2>
        <form @submit.prevent="handleStationSubmit">
          <div class="form-group">
            <label for="name">Station Name</label>
            <input
              type="text"
              id="name"
              v-model="stationForm.name"
              required
              placeholder="Enter station name"
            />
          </div>
          <div class="form-group">
            <label for="address">Address</label>
            <input
              type="text"
              id="address"
              v-model="stationForm.address"
              required
              placeholder="Enter station address"
            />
          </div>
          <div class="form-group">
            <label for="chargingType">Charging Type</label>
            <select id="chargingType" v-model="stationForm.chargingType" required>
              <option value="">Select charging type</option>
              <option value="Type 1">Type 1</option>
              <option value="Type 2">Type 2</option>
              <option value="CCS">CCS</option>
              <option value="CHAdeMO">CHAdeMO</option>
              <option value="Tesla">Tesla</option>
            </select>
          </div>
          <div class="form-group">
            <label for="latitude">Latitude</label>
            <input
              type="number"
              id="latitude"
              v-model="stationForm.latitude"
              step="any"
              required
              placeholder="Enter latitude"
            />
          </div>
          <div class="form-group">
            <label for="longitude">Longitude</label>
            <input
              type="number"
              id="longitude"
              v-model="stationForm.longitude"
              step="any"
              required
              placeholder="Enter longitude"
            />
          </div>
          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" v-model="stationForm.status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button type="submit" :disabled="submitting" class="submit-btn">
              <i class="fas fa-save"></i>
              {{ submitting ? 'Saving...' : 'Save Station' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import config from '../config'

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter()
    const stations = ref([])
    const loading = ref(true)
    const error = ref('')
    const showAddStationModal = ref(false)
    const editingStation = ref(null)
    const submitting = ref(false)

    const stationForm = ref({
      name: '',
      address: '',
      chargingType: '',
      status: 'active',
      location: {
        type: 'Point',
        coordinates: []
      }
    })

    const fetchStations = async () => {
      try {
        loading.value = true
        error.value = ''
        const response = await axios.get(`${config.apiUrl}/charging-stations`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        stations.value = response.data
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to fetch stations'
      } finally {
        loading.value = false
      }
    }

    const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }

    const editStation = (station) => {
      router.push(`/admin/stations/update/${station._id}`)
    }

    const deleteStation = async (id) => {
      if (!confirm('Are you sure you want to delete this station?')) return

      try {
        await axios.delete(`${config.apiUrl}/charging-stations/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        await fetchStations()
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to delete station'
      }
    }

    const handleStationSubmit = async () => {
      try {
        submitting.value = true
        const url = editingStation.value
          ? `${config.apiUrl}/charging-stations/${editingStation.value._id}`
          : `${config.apiUrl}/charging-stations`
        
        const method = editingStation.value ? 'put' : 'post'
        
        // Format the location data according to GeoJSON
        const stationData = {
          name: stationForm.value.name,
          address: stationForm.value.address,
          chargingType: stationForm.value.chargingType,
          status: stationForm.value.status,
          location: {
            type: 'Point',
            coordinates: [
              parseFloat(stationForm.value.longitude),
              parseFloat(stationForm.value.latitude)
            ]
          }
        }
        
        await axios[method](url, stationData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        await fetchStations()
        closeModal()
      } catch (err) {
        console.error('Error saving station:', err)
        error.value = err.response?.data?.error || 'Failed to save station'
      } finally {
        submitting.value = false
      }
    }

    const closeModal = () => {
      showAddStationModal.value = false
      editingStation.value = null
      stationForm.value = {
        name: '',
        address: '',
        chargingType: '',
        status: 'active',
        location: {
          type: 'Point',
          coordinates: []
        }
      }
    }

    onMounted(() => {
      const token = localStorage.getItem('token')
      const userRole = localStorage.getItem('userRole')
      
      if (!token || userRole !== 'admin') {
        router.push('/login')
        return
      }
      
      fetchStations()
    })

    return {
      stations,
      loading,
      error,
      showAddStationModal,
      editingStation,
      submitting,
      stationForm,
      handleLogout,
      editStation,
      deleteStation,
      handleStationSubmit,
      closeModal
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  /* background: linear-gradient(to bottom right, #6a11cb 0%, #2575fc 100%); */ /* Remove specific background */
  padding-bottom: 2rem;
  padding-top: 70px; /* Add padding to account for main navbar */
}

.dashboard-header {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 70px; /* Position below main navbar */
  z-index: 99; /* Lower than main navbar but higher than content */
  margin-bottom: 2rem;
  backdrop-filter: blur(5px);
}

.dashboard-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
}

.dashboard-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.stations-section {
  background: rgba(255, 255, 255, 0.8);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.section-header h2 {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
}

.add-btn {
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background-color: #43a047;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 0 1rem;
}

.station-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.station-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.station-card h3 {
  color: #2c3e50;
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.station-card p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.station-card p strong {
  color: #2c3e50;
  font-weight: 500;
  min-width: 120px;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
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

.station-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

.edit-btn:hover {
  background-color: #1976D2;
  transform: translateY(-1px);
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

.logout-btn {
  background-color: #6c757d;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-btn:hover {
  background-color: #5a6268;
  transform: translateY(-1px);
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
  z-index: 1000; /* Increased z-index to appear above navbars */
  padding: 1rem;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative; /* Added to ensure proper stacking context */
  margin-top: 70px; /* Added to account for main navbar */
}

.modal-content h2 {
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.modal-actions button {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1rem;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error,
.no-stations {
  text-align: center;
  padding: 2rem 1rem;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.error {
  color: #ffcccc;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem;
  }

  .dashboard-content {
    padding: 1rem;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .stations-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style> 