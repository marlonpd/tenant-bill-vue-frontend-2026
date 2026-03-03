<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import HeaderSection from '@/components/HeaderSection.vue'
import FooterSection from '@/components/FooterSection.vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <div class="app-shell">
    <HeaderSection v-if="isAuthenticated" />
    <RouterView />
    <FooterSection />
  </div>
</template>

<style scoped>
.app-shell {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
