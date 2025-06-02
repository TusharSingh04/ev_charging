<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">Log In</h1>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="Enter your email" required>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" placeholder="Enter your password" required>
        </div>

        <button type="submit" class="submit-button">Submit</button>
      </form>

      <div class="separator"></div>

      <button class="google-signin-button">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/192px-Google_%22G%22_logo.svg.png" alt="Google logo" class="google-icon">
        Sign in with Google
      </button>

      <p class="signup-link">
        Don't have an account? <router-link to="/register">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'; // Assuming axios for API calls

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      // role: '' // You might need to add a mechanism for role selection based on backend requirements
    };
  },
  methods: {
    async handleLogin() {
      try {
        // You need to determine the user's role here (e.g., from a dropdown or separate pages)
        // For demonstration, let's assume 'user' role or add a data property for role selection
        const role = 'user'; // Replace with logic to get the actual role
        
        const response = await axios.post('/api/auth/login', {
          email: this.email,
          password: this.password,
          role: role // Include the role as required by the backend
        });

        // Handle successful login
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user)); // Store user info including role

        // Redirect based on role or to a default dashboard
        if (user.role === 'admin') {
          this.$router.push('/admin/dashboard');
        } else {
          this.$router.push('/dashboard'); // Or wherever regular users go
        }

        // Optional: Show success message
        // this.$toast.success('Login successful!'); // If using a toast notification system

      } catch (error) {
        // Handle login errors
        console.error('Login failed:', error);
        let errorMessage = 'Login failed. Please try again.';
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
           errorMessage = error.message;
        }

        // Optional: Show error message
        // this.$toast.error(errorMessage); // If using a toast notification system
        alert(errorMessage); // Using alert for simplicity
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
  background: linear-gradient(to bottom right, #6a11cb 0%, #2575fc 100%);
  padding: 20px;
  box-sizing: border-box;
}

.login-card {
  background-color: #fff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.login-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 30px;
}

.form-group {
  text-align: left;
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box; /* Include padding in width */
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #6a11cb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.submit-button:hover {
  background-color: #530ea3;
}

.separator {
  margin: 30px 0;
  border-bottom: 1px solid #eee;
}

.google-signin-button {
  width: 100%;
  padding: 10px;
  background-color: #fff;
  color: #555;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.google-signin-button:hover {
  background-color: #f8f8f8;
  border-color: #bbb;
}

.google-icon {
  width: 20px;
  height: 20px;
}

.signup-link {
  margin-top: 20px;
  font-size: 1rem;
  color: #555;
}

.signup-link a {
  color: #6a11cb;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style> 