import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import config from '../config'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import UserDashboard from '../components/UserDashboard.vue'
import CreateStation from '../components/admin/CreateStation.vue'
import UpdateStation from '../components/admin/UpdateStation.vue'
import DeleteStation from '../components/admin/DeleteStation.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/user/dashboard',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  {
    path: '/admin/stations/create',
    name: 'CreateStation',
    component: CreateStation,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/stations/update/:id',
    name: 'UpdateStation',
    component: UpdateStation,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/stations/delete',
    name: 'DeleteStation',
    component: DeleteStation,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  
  // If route requires auth and no token, redirect to login
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  // If user is logged in and tries to access login page, verify role and redirect
  if (to.path === '/login' && token) {
    try {
      const response = await axios.get(`${config.apiUrl}/auth/verify-role`, {
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`
        }
      })

      const { role } = response.data
      localStorage.setItem('userRole', role)
      next(role === 'admin' ? '/admin/dashboard' : '/user/dashboard')
    } catch (error) {
      // If token is invalid or expired, clear storage and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      next('/login')
    }
    return
  }

  // For protected routes, verify role from backend
  if (to.meta.requiresAuth) {
    try {
      const response = await axios.get(`${config.apiUrl}/auth/verify-role`, {
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`
        }
      })

      const { role } = response.data
      localStorage.setItem('userRole', role)

      // Check if user has required role for the route
      if (to.meta.requiresAdmin && role !== 'admin') {
        next('/user/dashboard')
      } else if (!to.meta.requiresAdmin && role === 'admin') {
        next('/admin/dashboard')
      } else {
        next()
      }
    } catch (error) {
      // If token is invalid or expired, clear storage and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      next('/login')
    }
    return
  }

  next()
})

export default router 