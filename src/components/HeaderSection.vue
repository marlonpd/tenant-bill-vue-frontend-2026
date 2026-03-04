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
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  margin-top: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-soft);
}

.header-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-links :deep(a) {
  font-weight: 600;
  padding: 0.35rem 0.55rem;
  border-radius: 8px;
}

.header-links :deep(a.router-link-active) {
  color: var(--vt-c-white);
  background: var(--color-accent);
}

@media (max-width: 700px) {
  .header-nav {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
