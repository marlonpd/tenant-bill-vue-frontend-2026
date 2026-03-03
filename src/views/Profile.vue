<script setup lang="ts">
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
</script>

<template>
  <section class="page-wrap">
    <h2>Profile</h2>
    <p><strong>Name:</strong> {{ authStore.user.name || '-' }}</p>
    <p><strong>Email:</strong> {{ authStore.user.email || '-' }}</p>
  </section>
</template>
