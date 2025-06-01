<template>
  <div class="login-container">
    <form v-if="isLogin" @submit.prevent="handleLogin" class="login-form">
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
      <p class="toggle-form-text">Don't have an account? <a href="#" @click.prevent="toggleForm">Register here</a></p>
    </form>

    <form v-else @submit.prevent="handleRegister" class="register-form">
      <h2>Register</h2>
      <div class="form-group">
        <label for="register-email">Email:</label>
        <input 
          type="email" 
          id="register-email" 
          v-model="registerEmail" 
          required 
          placeholder="Enter your email"
          :disabled="loading"
          :class="{ 'error-input': validationErrors.registerEmail }"
        >
        <span v-if="validationErrors.registerEmail" class="validation-error">
          {{ validationErrors.registerEmail }}
        </span>
      </div>
      <div class="form-group">
        <label for="register-password">Password:</label>
        <input 
          type="password" 
          id="register-password" 
          v-model="registerPassword" 
          required 
          placeholder="Enter your password"
          :disabled="loading"
          :class="{ 'error-input': validationErrors.registerPassword }"
        >
        <span v-if="validationErrors.registerPassword" class="validation-error">
          {{ validationErrors.registerPassword }}
        </span>
      </div>
      <div class="form-group">
        <label for="register-confirm-password">Confirm Password:</label>
        <input 
          type="password" 
          id="register-confirm-password" 
          v-model="registerConfirmPassword" 
          required 
          placeholder="Confirm your password"
          :disabled="loading"
          :class="{ 'error-input': validationErrors.registerConfirmPassword }"
        >
        <span v-if="validationErrors.registerConfirmPassword" class="validation-error">
          {{ validationErrors.registerConfirmPassword }}
        </span>
      </div>
      <button type="submit" class="register-btn" :disabled="loading">
        {{ loading ? 'Registering...' : 'Register' }}
      </button>
      <div v-if="error" class="error">
        <p>{{ error }}</p>
      </div>
      <p class="toggle-form-text">Already have an account? <a href="#" @click.prevent="toggleForm">Login here</a></p>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Login',
  data() {
    return {
      isLogin: true,
      email: '',
      password: '',
      registerEmail: '',
      registerPassword: '',
      registerConfirmPassword: '',
      error: null,
      loading: false,
      validationErrors: {
        email: '',
        password: '',
        registerEmail: '',
        registerPassword: '',
        registerConfirmPassword: ''
      }
    }
  },
  methods: {
    toggleForm() {
      this.isLogin = !this.isLogin;
      this.error = null; // Clear errors when toggling
      this.validationErrors = { // Clear validation errors
        email: '',
        password: '',
        registerEmail: '',
        registerPassword: '',
        registerConfirmPassword: ''
      };
    },
    validateLoginForm() {
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
    validateRegisterForm() {
      let isValid = true
      this.validationErrors = {
        registerEmail: '',
        registerPassword: '',
        registerConfirmPassword: ''
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!this.registerEmail) {
        this.validationErrors.registerEmail = 'Email is required'
        isValid = false
      } else if (!emailRegex.test(this.registerEmail)) {
        this.validationErrors.registerEmail = 'Please enter a valid email address'
        isValid = false
      }

      // Validate password
      if (!this.registerPassword) {
        this.validationErrors.registerPassword = 'Password is required'
        isValid = false
      } else if (this.registerPassword.length < 6) {
        this.validationErrors.registerPassword = 'Password must be at least 6 characters long'
        isValid = false
      }

      // Validate confirm password
      if (!this.registerConfirmPassword) {
        this.validationErrors.registerConfirmPassword = 'Confirm Password is required'
        isValid = false
      } else if (this.registerPassword !== this.registerConfirmPassword) {
        this.validationErrors.registerConfirmPassword = 'Passwords do not match'
        isValid = false
      }

      return isValid
    },
    async handleLogin() {
      if (!this.validateLoginForm()) {
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
    },
    async handleRegister() {
      if (!this.validateRegisterForm()) {
        return
      }

      this.loading = true;
      this.error = null;

      try {
        // Assuming a backend endpoint for registration exists at /api/auth/register
        const response = await axios.post('http://localhost:5000/api/auth/register', {
          email: this.registerEmail,
          password: this.registerPassword
        });

        // Handle successful registration (e.g., show a success message, clear form, or automatically log in)
        console.log('Registration successful:', response.data);
        this.error = 'Registration successful. You can now login.';
        this.toggleForm(); // Switch back to login form after successful registration
        this.registerEmail = '';
        this.registerPassword = '';
        this.registerConfirmPassword = '';

      } catch (err) {
        if (err.response) {
          // Server responded with an error
          if (err.response.status === 400 && err.response.data.error === 'User already exists') {
            this.error = 'User with this email already exists.';
          } else {
            this.error = err.response.data.error || 'Registration failed.';
          }
        } else if (err.request) {
          // Request was made but no response received
          this.error = 'Network Error - Please check your internet connection.';
        } else {
          // Something else happened
          this.error = err.message || 'An unexpected error occurred during registration.';
        }
      } finally {
        this.loading = false;
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
  background-color: transparent; /* Make background transparent */
}

.login-form,
.register-form {
  background: none; /* Remove white background */
  padding: 2rem;
  border-radius: 8px;
  box-shadow: none; /* Remove shadow */
  width: 100%;
  max-width: 400px;
  color: #000000; /* Change to black for better contrast */
  text-align: center; /* Center form content */
}

.login-form h2,
.register-form h2 {
  color: #000000; /* Change to black for better contrast */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1); /* Add text shadow */
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left; /* Align form group content to left */
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #000000; /* Change to black for better contrast */
  font-weight: bold; /* Make text bold */
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  color: #000000; /* Change to black for better contrast */
  font-weight: bold; /* Make text bold */
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.login-btn,
.register-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white; /* Keep button text white for contrast */
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: bold; /* Make button text bold */
  margin-top: 1.5rem; /* Add space above button */
}

.login-btn:hover:not(:disabled),
.register-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.login-btn:disabled,
.register-btn:disabled {
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

.toggle-form-text {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #000000; /* Change to black for better contrast */
}

.toggle-form-text a {
  color: #2E7D32; /* Darker green for better contrast */
  text-decoration: none;
  font-weight: bold;
}

.toggle-form-text a:hover {
  text-decoration: underline;
}
</style> 