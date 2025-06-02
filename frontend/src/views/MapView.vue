<template>
  <div class="map-view">
    <h1>EV Charging Stations</h1>
    <div v-if="stationsStore.isLoading" class="loading">
      Loading charging stations...
    </div>
    <div v-else-if="stationsStore.getError" class="error">
      {{ stationsStore.getError }}
    </div>
    <ChargerMap
      v-else
      :stations="stationsStore.getStations"
      :center="defaultCenter"
      :zoom="5"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStationsStore } from '../stores/stations'
import ChargerMap from '../components/ChargerMap.vue'

const stationsStore = useStationsStore()
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
}

onMounted(async () => {
  await stationsStore.fetchStations()
})
</script>

<style scoped>
.map-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
}

.loading {
  background-color: #f8f9fa;
  color: #666;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style> 