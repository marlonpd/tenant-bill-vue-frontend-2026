<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

async function onLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <nav class="header-nav">
    <div class="header-links">
      <RouterLink :to="{ name: 'profile' }">Profile</RouterLink>
      <RouterLink :to="{ name: 'dashboard' }">Tenants</RouterLink>
      <RouterLink :to="{ name: 'units' }">Units</RouterLink>
      <RouterLink :to="{ name: 'power-rates' }">Power Rates</RouterLink>
    </div>
    <button type="button" @click="onLogout">Sign out</button>
  </nav>
</template>

<style scoped>
.header-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
}

.header-links {
  display: flex;
  gap: 1rem;
}
</style>
