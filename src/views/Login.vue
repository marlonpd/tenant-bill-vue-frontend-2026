<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')

async function onSubmit() {
  error.value = ''
  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push({ name: 'dashboard' })
  } catch (err: any) {
    error.value = err?.response?.data?.error || 'Login failed'
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <img src="/renthq-logo.svg" alt="RentHQ logo" />
        <h2 class="auth-title">Welcome Back</h2>
        <p class="auth-subtitle">Sign in to manage billing, tenants, and utilities.</p>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <form @submit.prevent="onSubmit">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Log in</button>
      </form>

      <div class="auth-links">
        <RouterLink :to="{ name: 'home' }">Back to home</RouterLink>
        <RouterLink :to="{ name: 'register' }">Create account</RouterLink>
      </div>
    </div>
  </section>
</template>
