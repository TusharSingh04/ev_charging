import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import config from './config'

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.css'

// Configure axios defaults
axios.defaults.baseURL = config.apiUrl
axios.defaults.headers.common = config.headers
axios.defaults.withCredentials = true

const app = createApp(App)

app.use(store)
app.use(router)

app.mount('#app') 