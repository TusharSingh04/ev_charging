import { createStore } from 'vuex'
import api from '../config/api'

export default createStore({
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    stations: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_STATIONS(state, stations) {
      state.stations = stations
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        const response = await api.post('/auth/login', credentials)
        commit('SET_USER', response.data.user)
        commit('SET_TOKEN', response.data.token)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Login failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async register({ commit }, userData) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        const response = await api.post('/auth/register', userData)
        commit('SET_USER', response.data.user)
        commit('SET_TOKEN', response.data.token)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Registration failed')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async logout({ commit }) {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        commit('SET_USER', null)
        commit('SET_TOKEN', null)
      }
    },
    async fetchStations({ commit }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        const response = await api.get('/stations')
        commit('SET_STATIONS', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch stations')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    stations: state => state.stations,
    isLoading: state => state.loading,
    error: state => state.error
  }
}) 