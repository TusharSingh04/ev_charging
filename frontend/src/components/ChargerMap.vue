<template>
  <div class="map-container">
    <l-map :zoom="zoom" :center="center" ref="map">
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"></l-tile-layer>
      <!-- User Location Marker -->
      <l-marker v-if="userLocation" :lat-lng="userLocation">
        <l-popup>Your Location</l-popup>
      </l-marker>
      <l-marker v-for="station in stations" :key="station._id" :lat-lng="[station.latitude, station.longitude]">
        <l-popup>
          <div class="info-window">
            <h3>{{ station.name }}</h3>
            <p><strong>Status:</strong> {{ station.status }}</p>
            <p><strong>Power Output:</strong> {{ station.powerOutput }}kW</p>
            <p><strong>Connector Type:</strong> {{ station.connectorType }}</p>
            <p><strong>Last Updated:</strong> {{ new Date(station.updatedAt).toLocaleString() }}</p>
            <button @click="routeToStation([station.latitude, station.longitude])">Route Here</button>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'; // Import routing machine CSS
import 'leaflet-routing-machine'; // Import routing machine JS

// Fix for default marker icons not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: 'ChargerMap',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup
  },
  props: {
    stations: {
      type: Array,
      required: true
    },
    center: {
      type: Object,
      default: () => ({
        lat: 20.5937, // Default center (India)
        lng: 78.9629
      })
    },
    zoom: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      map: null,
      userLocation: null,
      routingControl: null,
      locationWatchId: null,
    }
  },
  methods: {
    createInfoWindowContent(station) {
      return `
        <div class="info-window">
          <h3>${station.name}</h3>
          <p><strong>Status:</strong> ${station.status}</p>
          <p><strong>Power Output:</strong> ${station.powerOutput}kW</p>
          <p><strong>Connector Type:</strong> ${station.connectorType}</p>
          <p><strong>Last Updated:</strong> ${new Date(station.updatedAt).toLocaleString()}</p>
        </div>
      `
    },
    getUserLocation() {
      if (navigator.geolocation) {
        this.locationWatchId = navigator.geolocation.watchPosition(
          (position) => {
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
          },
          (error) => {
            console.error("Error watching user location:", error);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    },
    routeToStation(destination) {
      if (!this.userLocation) {
        alert("Please allow access to your location to get directions.");
        return;
      }

      const map = this.$refs.map.mapObject;

      // Remove previous routing control if exists
      if (this.routingControl) {
        map.removeControl(this.routingControl);
      }

      this.routingControl = L.Routing.control({
        waypoints: [
          L.latLng(this.userLocation.lat, this.userLocation.lng),
          L.latLng(destination[0], destination[1])
        ],
        routeWhileDragging: true,
        geocoder: L.Control.Geocoder.nominatim() // Optional: Add geocoding
      }).addTo(map);
    }
  },
  mounted() {
    this.getUserLocation();
  },
  beforeUnmount() {
    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
    }
  }
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

/* Style for the routing machine control - adjust as needed */
:deep(.leaflet-routing-container) {
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
}
</style> 