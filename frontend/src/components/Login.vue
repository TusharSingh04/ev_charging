<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Login</h2>
      <div class="form-group">
        <label for="email">Email:</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          required 
          placeholder="Enter your email"
          :disabled="loading"
          :class="{ 'error-input': validationErrors.email }"
        >
        <span v-if="validationErrors.email" class="validation-error">
          {{ validationErrors.email }}
        </span>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          required 
          placeholder="Enter your password"
          :disabled="loading"
          :class="{ 'error-input': validationErrors.password }"
        >
        <span v-if="validationErrors.password" class="validation-error">
          {{ validationErrors.password }}
        </span>
      </div>
      <button type="submit" class="login-btn" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
      <div v-if="error" class="error">
        <p>{{ error }}</p>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      error: null,
      loading: false,
      validationErrors: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    validateForm() {
      let isValid = true
      this.validationErrors = {
        email: '',
        password: ''
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!this.email) {
        this.validationErrors.email = 'Email is required'
        isValid = false
      } else if (!emailRegex.test(this.email)) {
        this.validationErrors.email = 'Please enter a valid email address'
        isValid = false
      }

      // Validate password
      if (!this.password) {
        this.validationErrors.password = 'Password is required'
        isValid = false
      } else if (this.password.length < 6) {
        this.validationErrors.password = 'Password must be at least 6 characters long'
        isValid = false
      }

      return isValid
    },
    async handleLogin() {
      if (!this.validateForm()) {
        return
      }

      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: this.email,
          password: this.password
        })
        
        // Store the token and user info
        localStorage.setItem('token', response.data.token)
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }
        
        // Set up axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        
        // Redirect to charger list
        this.$router.push('/chargers')
      } catch (err) {
        if (err.response) {
          // Server responded with an error
          if (err.response.status === 401) {
            this.error = 'Invalid email or password'
          } else {
            this.error = err.response.data.error || 'Login failed'
          }
        } else if (err.request) {
          // Request was made but no response received
          this.error = 'Network Error - Please check your internet connection'
        } else {
          // Something else happened
          this.error = err.message || 'An unexpected error occurred'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px); /* Subtract navbar height */
  background-color: #f5f5f5;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.login-btn {
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

.login-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.login-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  margin-top: 1rem;
  text-align: center;
  padding: 0.5rem;
  background-color: #f8d7da;
  border-radius: 4px;
}

.error-input {
  border-color: #dc3545 !important;
}

.validation-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}
</style> 