<template>
  <div class="mapbox-wrap">
    <div ref="mapEl" class="mapbox-canvas" />
    <!-- Optional: graceful error if no token -->
    <div v-if="!token" class="mapbox-empty">Mapbox token missing</div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, shallowRef, computed } from 'vue'
import mapboxgl from 'mapbox-gl'

// Props: center and zoom
const props = defineProps({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  zoom: { type: Number, default: 14 },
  // map style id; change to any of your styles
  style: { type: String, default: 'mapbox://styles/mapbox/streets-v12' }
})

const token = import.meta.env.VITE_MAPBOX_TOKEN
const mapEl = shallowRef(null)
const map = shallowRef(null)
const marker = shallowRef(null)

const center = computed(() => [props.lng, props.lat])

onMounted(() => {
  if (!token || !mapEl.value) return
  mapboxgl.accessToken = token

  map.value = new mapboxgl.Map({
    container: mapEl.value,
    style: props.style,
    center: center.value,
    zoom: props.zoom,
    cooperativeGestures: true,
  })

  map.value.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')

  marker.value = new mapboxgl.Marker({ color: '#2e7d32' })
    .setLngLat(center.value)
    .addTo(map.value)
})

watch(center, (next, prev) => {
  if (!map.value) return
  // animate to new point
  map.value.flyTo({ center: next, zoom: props.zoom, essential: true })
  marker.value?.setLngLat(next)
})

onBeforeUnmount(() => {
  marker.value?.remove()
  map.value?.remove()
})
</script>

<style scoped>
/* you can put this globally too */
.mapbox-canvas {
  width: 100%;
  height: 220px;          /* tweak height to fit your dialog */
  border-radius: 12px;
  overflow: hidden;
}
.mapbox-empty {
  display: grid;
  place-items: center;
  height: 220px;
  border-radius: 12px;
  border: 1px dashed rgba(0,0,0,.2);
  font-size: .9rem;
  color: rgba(0,0,0,.6);
}
</style>

<!-- Mapbox CSS (needed for controls). If you prefer, import once globally. -->
<style>
@import "mapbox-gl/dist/mapbox-gl.css";
</style>
