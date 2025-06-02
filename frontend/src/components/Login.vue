<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Login</h2>
      <form @submit.prevent="handleSubmit">
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
          <label for="role">Role</label>
          <select id="role" v-model="selectedRole" required>
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>

        <div class="register-link">
          New User? <router-link to="/register">Register</router-link>
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import config from '../config';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      selectedRole: '',
      loading: false,
      error: null,
      successMessage: null
    };
  },
  created() {
    // Check for success message in route query
    if (this.$route.query.message) {
      this.successMessage = this.$route.query.message;
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      this.error = null;

      try {
        // First, authenticate the user
        const authResponse = await axios.post(`${config.apiUrl}/auth/login`, {
          email: this.email,
          password: this.password,
          role: this.selectedRole
        });

        const { token, user } = authResponse.data;

        // Store the token and user info
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.role);

        // Redirect based on role
        if (user.role === 'admin') {
          this.$router.push('/admin/dashboard');
        } else {
          this.$router.push('/user/dashboard');
        }
      } catch (error) {
        console.error('Login error:', error);
        this.error = error.response?.data?.error || error.message || 'Login failed';
        // Clear any stored data on error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: transparent;
}

.login-form {
  background: #7F8C8D; /* Steel grey background */
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  color: #2c3e50; /* Slightly darker color */
  margin-bottom: 1.5rem;
  font-weight: bold; /* Make title bolder */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* Add text shadow */
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333; /* Slightly darker color for labels */
  font-weight: bold; /* Make labels bolder */
  text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.3); /* Add subtle text shadow */
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #4CAF50;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #2E7D32; /* Darker shade of green */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #1B5E20; /* Even darker green on hover */
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

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #333; /* Slightly darker color for surrounding text */
  font-weight: bold; /* Make surrounding text bolder */
  text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.3); /* Add subtle text shadow */
}

.register-link a {
  color: #1a237e; /* Darker blue color for the link */
  text-decoration: none;
  font-weight: bold; /* Make link text bolder */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4); /* Add text shadow to link */
}

.register-link a:hover {
  text-decoration: underline;
}

.success-message {
  color: #4CAF50;
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #e8f5e9;
  border-radius: 4px;
}
</style> 