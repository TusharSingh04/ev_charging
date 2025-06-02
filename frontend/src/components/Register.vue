<template>
  <div class="register-container">
    <div class="register-form">
      <h2>Register</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            type="text"
            id="name"
            v-model="name"
            required
            placeholder="Enter your name"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Enter your password"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            placeholder="Confirm your password"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>

        <div class="login-link">
          Already have an account? <router-link to="/login">Login</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import config from '../config';

export default {
  name: 'Register',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      loading: false,
      error: null
    };
  },
  methods: {
    async handleSubmit() {
      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        await axios.post(`${config.apiUrl}/auth/register`, {
          name: this.name,
          email: this.email,
          password: this.password,
          role: 'user' // Only allowing user registration
        });

        // Show success message and redirect to login
        this.$router.push({
          path: '/login',
          query: { message: 'Registration successful. Please log in.' }
        });
      } catch (error) {
        console.error('Registration error:', error);
        this.error = error.response?.data?.error || 'Registration failed';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.register-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 1rem;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff5252;
  text-align: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #ffebee;
  border-radius: 4px;
}

.login-link {
  text-align: center;
  color: #666;
}

.login-link a {
  color: #4CAF50;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style> 