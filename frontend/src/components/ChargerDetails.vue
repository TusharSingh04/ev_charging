<template>
  <div class="charger-details" v-if="station">
    <div class="details-header">
      <h2>{{ station.name }}</h2>
      <button @click="$emit('close')" class="close-btn">&times;</button>
    </div>
    
    <div class="details-content">
      <div class="detail-item">
        <span class="label">Status:</span>
        <span :class="['status', station.status]">{{ getStatusText(station.status) }}</span>
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
        <span>{{ new Date(station.updatedAt).toLocaleString() }}</span>
      </div>
    </div>

    <div class="details-actions">
      <button 
        v-if="station.status === 'available'" 
        @click="bookStation"
        class="action-btn book-btn"
        :disabled="loading"
      >
        {{ loading ? 'Booking...' : 'Book Now' }}
      </button>
      <button 
        v-else-if="station.status === 'in-use'" 
        @click="releaseStation"
        class="action-btn release-btn"
        :disabled="loading"
      >
        {{ loading ? 'Releasing...' : 'Release Station' }}
      </button>
      <button 
        v-else-if="isAdmin && station.status === 'maintenance'" 
        @click="makeAvailable"
        class="action-btn admin-btn"
        :disabled="loading"
      >
        {{ loading ? 'Updating...' : 'Make Available' }}
      </button>
      <button 
        v-else 
        class="action-btn unavailable-btn"
        disabled
      >
        {{ getStatusText(station.status) }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ChargerDetails',
  props: {
    station: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      error: null
    }
  },
  computed: {
    isAdmin() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.role === 'admin'
    }
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        'maintenance': 'Under Maintenance',
        'offline': 'Offline',
        'in-use': 'In Use',
        'available': 'Available'
      }
      return statusMap[status] || status
    },
    async bookStation() {
      if (!this.checkAuth()) return
      
      this.loading = true
      try {
        await axios.post(`http://localhost:5000/api/charging-stations/${this.station._id}/book`)
        this.$emit('booking-success')
      } catch (err) {
        this.handleError(err)
      } finally {
        this.loading = false
      }
    },
    async releaseStation() {
      if (!this.checkAuth()) return

      this.loading = true
      try {
        await axios.post(`http://localhost:5000/api/charging-stations/${this.station._id}/release`)
        this.$emit('status-updated')
      } catch (err) {
        this.handleError(err)
      } finally {
        this.loading = false
      }
    },
    async makeAvailable() {
      if (!this.checkAuth()) return

      this.loading = true
      try {
        await axios.put(`http://localhost:5000/api/charging-stations/${this.station._id}/status`, { status: 'available' })
        this.$emit('status-updated')
      } catch (err) {
        this.handleError(err)
      } finally {
        this.loading = false
      }
    },
    handleError(err) {
      if (err.response) {
        if (err.response.status === 401) {
          this.error = 'Session expired. Please login again.'
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          this.$router.push('/login')
        } else {
          alert(err.response.data.error || 'Operation failed')
        }
      } else if (err.request) {
        alert('Network Error - Please check your internet connection')
      } else {
        alert(err.message || 'An unexpected error occurred')
      }
    },
    checkAuth() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$router.push('/login')
        return false
      }
      return true
    }
  }
}
</script>

<style scoped>
.charger-details {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.details-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.details-content {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #666;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.available {
  background: linear-gradient(45deg, #e6ffe6, #ccffcc);
  color: #006600;
}

.in-use {
  background: linear-gradient(45deg, #fff3e6, #ffe0b3);
  color: #cc7700;
}

.maintenance {
  background: linear-gradient(45deg, #ffe6e6, #ffcccc);
  color: #cc0000;
}

.offline {
  background: linear-gradient(45deg, #f2f2f2, #e6e6e6);
  color: #666666;
}

.details-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  width: 100%;
}

.book-btn {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
}

.release-btn {
  background: linear-gradient(45deg, #2196F3, #1976D2);
  color: white;
}

.admin-btn {
  background: linear-gradient(45deg, #9C27B0, #7B1FA2);
  color: white;
}

.unavailable-btn {
  background: linear-gradient(45deg, #9e9e9e, #757575);
  color: white;
  cursor: not-allowed;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
}
</style> 