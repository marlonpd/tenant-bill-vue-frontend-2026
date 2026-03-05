<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { API_URL } from '@/apis/config'
import { AccountService } from '@/apis/services/account'

type PublicUser = {
  id: number
  name: string
  address: string | null
  profile_photo_url: string | null
  latitude: number | null
  longitude: number | null
}

type PublicUnit = {
  id: number
  unit_no: string
  description: string | null
  rate: number | null
  photo_urls: string[]
}

const route = useRoute()
const loading = ref(false)
const error = ref('')
const user = ref<PublicUser | null>(null)
const units = ref<PublicUnit[]>([])

function resolveUrl(path: string | null | undefined) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const base = API_URL.replace(/\/api\/?$/, '')
  if (path.startsWith('/')) return `${base}${path}`
  return `${base}/${path}`
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value)
}

const mapLink = computed(() => {
  if (!user.value?.latitude || !user.value?.longitude) return ''
  return `https://maps.google.com/?q=${encodeURIComponent(`${user.value.latitude},${user.value.longitude}`)}`
})

async function fetchPublicProfile() {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.userId)
    const { data } = await AccountService.getPublicProfile(id)
    user.value = data?.user || null
    units.value = data?.units || []
  } catch (err: any) {
    error.value = err?.response?.data?.error || 'Unable to load public profile.'
    user.value = null
    units.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPublicProfile()
})
</script>

<template>
  <section class="page-wrap public-profile-page">
    <div class="top-actions">
      <RouterLink class="home-link" :to="{ name: 'home' }">← Back to Home</RouterLink>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading">Loading profile...</p>

    <template v-else-if="user">
      <div class="profile-hero">
        <img
          v-if="user.profile_photo_url"
          :src="resolveUrl(user.profile_photo_url)"
          alt="Public profile photo"
          class="profile-photo"
        />
        <div v-else class="profile-photo profile-photo--empty">No photo</div>

        <div>
          <h2>{{ user.name }}</h2>
          <p>{{ user.address || 'Address not set' }}</p>
          <a v-if="mapLink" :href="mapLink" target="_blank" rel="noopener noreferrer">View pinned location</a>
        </div>
      </div>

      <h3>Units</h3>
      <p v-if="units.length === 0">No units to display.</p>

      <div v-else class="unit-grid">
        <article v-for="unit in units" :key="unit.id" class="unit-tile">
          <img
            v-if="unit.photo_urls && unit.photo_urls.length"
            :src="resolveUrl(unit.photo_urls[0])"
            alt="Unit photo"
            class="unit-photo"
          />
          <div v-else class="unit-photo unit-photo--empty">No photo</div>

          <h4>{{ unit.unit_no }}</h4>
          <p>{{ unit.description || 'No description' }}</p>
          <p class="unit-price">Price: {{ formatCurrency(unit.rate) }}</p>
        </article>
      </div>
    </template>
  </section>
</template>

<style scoped>
.public-profile-page {
  display: grid;
  gap: 0.9rem;
}

.top-actions {
  display: flex;
  justify-content: flex-start;
}

.home-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 36px;
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-heading);
  text-decoration: none;
  font-weight: 600;
}

.home-link:hover {
  border-color: var(--color-accent);
  color: var(--color-accent-hover);
}

.profile-hero {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.8rem;
  background: var(--color-background-soft);
}

.profile-photo {
  width: 100%;
  height: 180px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  object-fit: cover;
}

.profile-photo--empty,
.unit-photo--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  background: var(--color-background);
}

.unit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.unit-tile {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.65rem;
  background: var(--color-background);
  display: grid;
  gap: 0.35rem;
}

.unit-price {
  font-weight: 700;
  color: var(--color-heading);
}

.unit-photo {
  width: 100%;
  height: 150px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  object-fit: cover;
}

@media (max-width: 760px) {
  .profile-hero {
    grid-template-columns: 1fr;
  }
}
</style>
