<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { API_URL } from '@/apis/config'
import { AccountService } from '@/apis/services/account'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const loading = ref(false)
const message = ref('')
const error = ref('')
const selectedPhoto = ref<File | null>(null)
const localPhotoPreview = ref<string | null>(null)
const mapContainer = ref<HTMLDivElement | null>(null)
let mapInstance: L.Map | null = null
let mapPin: L.CircleMarker | null = null

const form = ref({
  contact_no: '',
  address: '',
  latitude: '',
  longitude: '',
})

function resolvePhotoUrl(photoUrl: string | null | undefined) {
  if (!photoUrl) return ''
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl
  if (photoUrl.startsWith('data:')) return photoUrl

  const apiBaseWithoutApi = API_URL.replace(/\/api\/?$/, '')
  if (!apiBaseWithoutApi) return photoUrl

  if (photoUrl.startsWith('/')) {
    return `${apiBaseWithoutApi}${photoUrl}`
  }

  return `${apiBaseWithoutApi}/${photoUrl}`
}

const currentPhotoUrl = computed(() => {
  if (localPhotoPreview.value) return localPhotoPreview.value
  return resolvePhotoUrl(authStore.user.profile_photo_url || '')
})

const googleMapsLink = computed(() => {
  const lat = form.value.latitude.trim()
  const lng = form.value.longitude.trim()
  if (!lat || !lng) return 'https://maps.google.com'
  return `https://maps.google.com/?q=${encodeURIComponent(`${lat},${lng}`)}`
})

function parseCoordinates() {
  const lat = Number(form.value.latitude)
  const lng = Number(form.value.longitude)
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng }
}

function syncMapPinFromForm(shouldRecenter = false) {
  if (!mapInstance || !mapPin) return
  const coords = parseCoordinates()
  if (!coords) return
  mapPin.setLatLng([coords.lat, coords.lng])
  if (shouldRecenter) {
    mapInstance.setView([coords.lat, coords.lng], mapInstance.getZoom())
  }
}

function initMap() {
  if (!mapContainer.value || mapInstance) return

  const initialCoords = parseCoordinates() || { lat: 14.5995, lng: 120.9842 }

  mapInstance = L.map(mapContainer.value).setView([initialCoords.lat, initialCoords.lng], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapInstance)

  mapPin = L.circleMarker([initialCoords.lat, initialCoords.lng], {
    radius: 8,
    color: '#0284c7',
    fillColor: '#38bdf8',
    fillOpacity: 0.9,
    weight: 2,
  }).addTo(mapInstance)

  mapInstance.on('click', (event: L.LeafletMouseEvent) => {
    const latitude = Number(event.latlng.lat.toFixed(6))
    const longitude = Number(event.latlng.lng.toFixed(6))
    form.value.latitude = String(latitude)
    form.value.longitude = String(longitude)
    syncMapPinFromForm()
  })
}

function populateFormFromUser() {
  form.value.contact_no = authStore.user.contact_no || ''
  form.value.address = authStore.user.address || ''
  form.value.latitude =
    authStore.user.latitude !== null && authStore.user.latitude !== undefined
      ? String(authStore.user.latitude)
      : ''
  form.value.longitude =
    authStore.user.longitude !== null && authStore.user.longitude !== undefined
      ? String(authStore.user.longitude)
      : ''
}

function onPhotoSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  selectedPhoto.value = file

  if (localPhotoPreview.value) {
    URL.revokeObjectURL(localPhotoPreview.value)
    localPhotoPreview.value = null
  }

  if (file) {
    localPhotoPreview.value = URL.createObjectURL(file)
  }
}

function useCurrentLocation() {
  error.value = ''
  if (!navigator.geolocation) {
    error.value = 'Geolocation is not supported by this browser.'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.value.latitude = String(position.coords.latitude)
      form.value.longitude = String(position.coords.longitude)
    },
    () => {
      error.value = 'Unable to fetch current location.'
    },
  )
}

async function saveProfile() {
  loading.value = true
  message.value = ''
  error.value = ''

  const latitude = form.value.latitude.trim() ? Number(form.value.latitude.trim()) : null
  const longitude = form.value.longitude.trim() ? Number(form.value.longitude.trim()) : null

  if (form.value.latitude.trim() && Number.isNaN(latitude)) {
    loading.value = false
    error.value = 'Latitude must be a valid number.'
    return
  }

  if (form.value.longitude.trim() && Number.isNaN(longitude)) {
    loading.value = false
    error.value = 'Longitude must be a valid number.'
    return
  }

  try {
    const { data } = await AccountService.updateProfile({
      contact_no: form.value.contact_no || null,
      address: form.value.address || null,
      latitude,
      longitude,
      profilePhoto: selectedPhoto.value,
    })

    authStore.user = data?.user || {}
    populateFormFromUser()
    message.value = 'Profile updated successfully.'
    selectedPhoto.value = null

    if (localPhotoPreview.value) {
      URL.revokeObjectURL(localPhotoPreview.value)
      localPhotoPreview.value = null
    }
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      err?.response?.data?.msg ||
      err?.message ||
      'Unable to update profile.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await authStore.fetchMe()
  populateFormFromUser()
  initMap()
  syncMapPinFromForm(true)
})

onUnmounted(() => {
  if (localPhotoPreview.value) {
    URL.revokeObjectURL(localPhotoPreview.value)
    localPhotoPreview.value = null
  }
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    mapPin = null
  }
})

watch(
  () => [form.value.latitude, form.value.longitude],
  () => {
    syncMapPinFromForm()
  },
)
</script>

<template>
  <section class="page-wrap">
    <h2>Profile</h2>

    <p v-if="message" class="status-message">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div class="profile-header">
      <div class="profile-photo-card">
        <img v-if="currentPhotoUrl" :src="currentPhotoUrl" alt="Profile photo" class="profile-photo" />
        <div v-else class="profile-photo profile-photo--empty">No photo</div>
        <input type="file" accept="image/*" :disabled="loading" @change="onPhotoSelected" />
      </div>

      <div class="profile-basic">
        <p><strong>Name:</strong> {{ authStore.user.name || '-' }}</p>
        <p><strong>Email:</strong> {{ authStore.user.email || '-' }}</p>
        <p><strong>Contact no.:</strong> {{ authStore.user.contact_no || '-' }}</p>
        <p><strong>Role:</strong> {{ authStore.user.role || '-' }}</p>
      </div>
    </div>

    <form @submit.prevent="saveProfile">
      <input v-model="form.contact_no" type="text" placeholder="Contact no." />
      <input v-model="form.address" type="text" placeholder="Address" />

      <div class="location-row">
        <input v-model="form.latitude" type="text" placeholder="Latitude" />
        <input v-model="form.longitude" type="text" placeholder="Longitude" />
      </div>

      <div class="location-actions">
        <button type="button" :disabled="loading" @click="useCurrentLocation">Use My Current Location</button>
        <a :href="googleMapsLink" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
      </div>

      <p class="map-hint">Click on the map to pin your location.</p>
      <div ref="mapContainer" class="map-picker"></div>

      <button type="submit" :disabled="loading">{{ loading ? 'Saving...' : 'Save Profile' }}</button>
    </form>
  </section>
</template>

<style scoped>
.profile-header {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.profile-photo-card {
  display: grid;
  gap: 0.5rem;
}

.profile-photo {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-soft);
}

.profile-photo--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
}

.profile-basic {
  display: grid;
  gap: 0.4rem;
  align-content: start;
}

.status-message {
  margin-bottom: 0.4rem;
}

.location-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.location-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.map-hint {
  font-size: 0.85rem;
  color: var(--color-text);
}

.map-picker {
  width: 100%;
  height: 320px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
}

@media (max-width: 800px) {
  .profile-header {
    grid-template-columns: 1fr;
  }

  .location-row {
    grid-template-columns: 1fr;
  }
}
</style>
