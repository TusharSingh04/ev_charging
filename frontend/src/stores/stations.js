import { defineStore } from 'pinia'
import api from '../config/api'

export const useStationsStore = defineStore('stations', {
  state: () => ({
    stations: [],
    loading: false,
    error: null,
    retryCount: 0,
    maxRetries: 3
  }),

  actions: {
    async fetchStations() {
      this.loading = true
      this.error = null
      try {
        console.log('Fetching stations...')
        const response = await api.get('/stations')
        console.log('Stations fetched:', response.data)
        this.stations = response.data
        this.retryCount = 0 // Reset retry count on success
      } catch (err) {
        console.error('Error fetching stations:', err)
        this.error = err.response?.data?.message || 'Failed to fetch charging stations'
        
        // Retry logic
        if (this.retryCount < this.maxRetries) {
          this.retryCount++
          console.log(`Retrying fetch (${this.retryCount}/${this.maxRetries})...`)
          setTimeout(() => this.fetchStations(), 2000) // Retry after 2 seconds
        }
      } finally {
        this.loading = false
      }
    },

    resetError() {
      this.error = null
      this.retryCount = 0
    }
  },

  getters: {
    getStations: (state) => state.stations,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getRetryCount: (state) => state.retryCount
  }
}) 