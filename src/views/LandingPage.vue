<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { API_URL } from '@/apis/config'
import { AccountService } from '@/apis/services/account'

type PublicUser = {
  id: number
  name: string
  address: string | null
  profile_photo_url: string | null
}

const randomUsers = ref<PublicUser[]>([])
const loadingRandomUsers = ref(false)

function resolveUrl(path: string | null | undefined) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const base = API_URL.replace(/\/api\/?$/, '')
  if (path.startsWith('/')) return `${base}${path}`
  return `${base}/${path}`
}

function profilePhoto(user: PublicUser) {
  return user.profile_photo_url ? resolveUrl(user.profile_photo_url) : ''
}

async function fetchRandomUsers() {
  loadingRandomUsers.value = true
  try {
    const { data } = await AccountService.getRandomPublicProfiles(10)
    randomUsers.value = data?.users || []
  } catch {
    randomUsers.value = []
  } finally {
    loadingRandomUsers.value = false
  }
}

onMounted(() => {
  fetchRandomUsers()
})
</script>

<template>
  <main class="landing">
    <section class="hero">
      <div class="hero-copy">
        <div class="brand-row">
          <img src="/renthq-logo.svg" alt="RentHQ logo" class="brand-logo" />
        </div>
        <p class="eyebrow">RentHQ Property Billing Platform</p>
        <h1>Manage tenants, billing, rates, and collections in one app.</h1>
        <p class="hero-subtitle">
          RentHQ helps landlords and property teams automate monthly billing,
          monitor due dates, and keep payment records organized.
        </p>

        <div class="hero-actions">
          <RouterLink class="btn btn-primary" :to="{ name: 'login' }">Owner/Admin Login</RouterLink>
          <RouterLink class="btn" :to="{ name: 'tenant-login' }">Tenant Portal</RouterLink>
          <RouterLink class="btn" :to="{ name: 'register' }">Create Account</RouterLink>
        </div>
      </div>

      <div class="hero-preview">
        <img src="/app-dashboard-preview.svg" alt="RentHQ dashboard preview" />
      </div>
    </section>

    <section class="features">
      <h2>Core Features</h2>
      <div class="feature-grid">
        <article class="feature-card">
          <h3>Tenant & Unit Management</h3>
          <p>Track tenant profiles, unit assignments, monthly rent, and due-day settings.</p>
        </article>
        <article class="feature-card">
          <h3>Utility Billing</h3>
          <p>Support fixed or meter-based water/electric billing with automatic usage calculations.</p>
        </article>
        <article class="feature-card">
          <h3>Payments & Ledger</h3>
          <p>Record payments, monitor outstanding balances, and view status per billing period.</p>
        </article>
        <article class="feature-card">
          <h3>History & Export</h3>
          <p>Browse billing history, print receipts, and export data for reporting workflows.</p>
        </article>
        <article class="feature-card">
          <h3>Bulk Operations</h3>
          <p>Generate bills in bulk and refresh overdue statuses to keep collections on schedule.</p>
        </article>
        <article class="feature-card">
          <h3>Tenant Self-Service</h3>
          <p>Give tenants their own portal to log in and see the latest billing history first.</p>
        </article>
      </div>
    </section>

    <section class="spotlight">
      <h2>Community Spotlight</h2>
      <p class="spotlight-subtitle">Browse 10 random registered user profiles.</p>

      <p v-if="loadingRandomUsers">Loading spotlight profiles...</p>

      <div v-else-if="randomUsers.length" class="spotlight-grid">
        <article v-for="user in randomUsers" :key="user.id" class="spotlight-card">
          <img
            v-if="profilePhoto(user)"
            :src="profilePhoto(user)"
            alt="Spotlight user photo"
            class="spotlight-photo"
          />
          <div v-else class="spotlight-photo spotlight-photo--empty">No photo</div>

          <div>
            <h3>{{ user.name }}</h3>
            <p>{{ user.address || 'Address not set' }}</p>
            <RouterLink class="btn" :to="{ name: 'public-profile', params: { userId: user.id } }">
              View Public Profile
            </RouterLink>
          </div>
        </article>
      </div>

      <p v-else>No public profiles available right now.</p>
    </section>
  </main>
</template>

<style scoped>
.landing {
  width: 100%;
  max-width: 1100px;
  margin: 1.25rem auto;
  display: grid;
  gap: 1rem;
}

.hero,
.features,
.spotlight {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: linear-gradient(180deg, var(--color-background-soft), var(--color-background));
  padding: 1rem;
}

.hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 1rem;
  align-items: center;
}

.eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-accent);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.brand-row {
  display: flex;
  align-items: center;
}

.brand-logo {
  width: 170px;
  height: auto;
}

.hero-copy h1 {
  margin-top: 0.3rem;
  font-size: 2rem;
  line-height: 1.15;
  color: var(--color-heading);
  font-weight: 800;
}

.hero-subtitle {
  margin-top: 0.75rem;
  color: var(--color-text);
}

.hero-actions {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn {
  min-height: 40px;
  padding: 0.625rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-heading);
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent-hover);
}

.btn-primary {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--vt-c-white);
}

.btn-primary:hover {
  border-color: var(--color-accent-hover);
  background: var(--color-accent-hover);
  color: var(--vt-c-white);
}

.hero-preview {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-background);
}

.hero-preview img {
  display: block;
  width: 100%;
  height: auto;
}

.features h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-heading);
}

.feature-grid {
  margin-top: 0.8rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
}

.feature-card {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.75rem;
  background: var(--color-background);
}

.feature-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-heading);
}

.feature-card p {
  margin-top: 0.3rem;
  color: var(--color-text);
}

.spotlight-subtitle {
  margin-top: 0.3rem;
  color: var(--color-text);
}

.spotlight-grid {
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
}

.spotlight-card {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
  padding: 0.75rem;
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.75rem;
  align-items: center;
}

.spotlight-photo {
  width: 120px;
  height: 120px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  object-fit: cover;
}

.spotlight-photo--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  background: var(--color-background-soft);
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-copy h1 {
    font-size: 1.6rem;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .spotlight-card {
    grid-template-columns: 1fr;
  }
}
</style>