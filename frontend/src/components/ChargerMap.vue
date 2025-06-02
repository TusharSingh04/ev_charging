<template>
  <div class="map-container">
    <div v-if="!mapReady" class="loading">Loading map...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <l-map v-else :zoom="zoom" :center="center" ref="map" class="map">
      <l-tile-layer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        :attribution="attribution"
      />
      <!-- User Location Marker -->
      <l-marker v-if="userLocation" :lat-lng="userLocation">
        <l-icon :icon-url="userIconUrl" :icon-size="[32, 32]" />
        <l-tooltip permanent>Your Location</l-tooltip>
      </l-marker>
      <!-- Station Markers -->
      <template v-for="station in stations" :key="station._id">
        <l-marker :lat-lng="[station.latitude, station.longitude]">
          <l-icon :icon-url="getStationIcon(station.status)" :icon-size="[32, 32]" />
          <l-tooltip :options="{ permanent: false, direction: 'top' }">
            <div class="tooltip-content">
              <h4>{{ station.name }}</h4>
              <p><strong>Status:</strong> <span :class="['status', station.status]">{{ getStatusText(station.status) }}</span></p>
              <p><strong>Power:</strong> {{ station.powerOutput }}kW</p>
            </div>
          </l-tooltip>
          <l-popup>
            <div class="info-window">
              <h3>{{ station.name }}</h3>
              <p><strong>Status:</strong> <span :class="['status', station.status]">{{ getStatusText(station.status) }}</span></p>
              <p><strong>Power Output:</strong> {{ station.powerOutput }}kW</p>
              <p><strong>Connector Type:</strong> {{ station.connectorType }}</p>
              <p><strong>Last Updated:</strong> {{ new Date(station.updatedAt).toLocaleString() }}</p>
              <button @click="routeToStation([station.latitude, station.longitude])" class="route-btn">
                Get Directions
              </button>
            </div>
          </l-popup>
        </l-marker>
      </template>
    </l-map>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup, LIcon, LTooltip } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

const props = defineProps({
  stations: {
    type: Array,
    required: true
  },
  center: {
    type: Object,
    default: () => ({
      lat: 20.5937,
      lng: 78.9629
    })
  },
  zoom: {
    type: Number,
    default: 5
  }
})

const mapReady = ref(false)
const map = ref(null)
const userLocation = ref(null)
const routingControl = ref(null)
const locationWatchId = ref(null)
const error = ref(null)
const attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'

// Icon URLs
const userIconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'
const stationIcons = {
  available: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  'in-use': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  maintenance: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  offline: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png'
}

const getStationIcon = (status) => {
  return stationIcons[status] || stationIcons.offline
}

const getStatusText = (status) => {
  const statusMap = {
    'maintenance': 'Under Maintenance',
    'offline': 'Offline',
    'in-use': 'In Use',
    'available': 'Available'
  }
  return statusMap[status] || status
}

const initMap = async () => {
  try {
    error.value = null
    const L = await import('leaflet')
    
    // Fix Leaflet marker icons
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    })

    mapReady.value = true
  } catch (err) {
    console.error('Error initializing map:', err)
    error.value = 'Failed to load map. Please refresh the page.'
  }
}

const getUserLocation = () => {
  if (navigator.geolocation) {
    locationWatchId.value = navigator.geolocation.watchPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        // Center map on user location when first obtained
        if (map.value && !map.value.mapObject.getCenter()) {
          map.value.mapObject.setView([position.coords.latitude, position.coords.longitude], 13)
        }
      },
      (err) => {
        console.error("Error watching user location:", err)
        error.value = 'Unable to get your location. Please enable location services.'
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  } else {
    error.value = 'Geolocation is not supported by your browser.'
  }
}

const routeToStation = async (destination) => {
  if (!userLocation.value) {
    error.value = "Please allow access to your location to get directions."
    return
  }

  try {
    error.value = null
    const L = await import('leaflet')
    const Routing = await import('leaflet-routing-machine')
    
    const mapInstance = map.value.mapObject

    // Remove previous routing control if exists
    if (routingControl.value) {
      mapInstance.removeControl(routingControl.value)
    }

    routingControl.value = Routing.control({
      waypoints: [
        L.latLng(userLocation.value.lat, userLocation.value.lng),
        L.latLng(destination[0], destination[1])
      ],
      routeWhileDragging: true,
      lineOptions: {
        styles: [{ color: '#4CAF50', weight: 4 }]
      },
      createMarker: () => null // Don't create markers for waypoints
    }).addTo(mapInstance)
  } catch (err) {
    console.error('Error creating route:', err)
    error.value = 'Failed to create route. Please try again.'
  }
}

// Watch for changes in stations
watch(() => props.stations, (newStations) => {
  if (newStations && newStations.length > 0 && map.value) {
    // Adjust map view to show all stations
    const bounds = newStations.map(station => [station.latitude, station.longitude])
    map.value.mapObject.fitBounds(bounds)
  }
}, { deep: true })

onMounted(() => {
  initMap()
  getUserLocation()
})

onBeforeUnmount(() => {
  if (locationWatchId.value !== null) {
    navigator.geolocation.clearWatch(locationWatchId.value)
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 600px;
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.loading, .error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2em;
  color: #666;
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.error {
  color: #dc3545;
}

.map {
  width: 100%;
  height: 100%;
}

.info-window {
  padding: 10px;
  max-width: 300px;
}

.info-window h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.info-window p {
  margin: 5px 0;
  color: #666;
}

.status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.875rem;
}

.available {
  background-color: #e6ffe6;
  color: #006600;
}

.in-use {
  background-color: #fff3e6;
  color: #cc7700;
}

.maintenance {
  background-color: #ffe6e6;
  color: #cc0000;
}

.offline {
  background-color: #f2f2f2;
  color: #666666;
}

.route-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s;
}

.route-btn:hover {
  background-color: #45a049;
}

:deep(.leaflet-routing-container) {
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
}

:deep(.leaflet-routing-alternatives-container) {
  display: none;
}

.tooltip-content {
  padding: 5px;
  min-width: 200px;
}

.tooltip-content h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 1rem;
}

.tooltip-content p {
  margin: 3px 0;
  color: #666;
  font-size: 0.875rem;
}

:deep(.leaflet-tooltip) {
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 8px;
}

:deep(.leaflet-tooltip-top:before) {
  border-top-color: #ccc;
}

:deep(.leaflet-tooltip-bottom:before) {
  border-bottom-color: #ccc;
}
</style> 