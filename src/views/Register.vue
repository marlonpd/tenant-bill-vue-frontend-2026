<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const error = ref('')

async function onSubmit() {
  error.value = ''
  message.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
    })
    message.value = 'Registered successfully. You can now login.'
    router.push({ name: 'login' })
  } catch (err: any) {
    error.value = err?.response?.data?.error || 'Register failed'
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <img src="/renthq-logo.svg" alt="RentHQ logo" />
        <h2 class="auth-title">Create Your Account</h2>
        <p class="auth-subtitle">Start using RentHQ for property billing operations.</p>
      </div>

      <p v-if="message">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>

      <form @submit.prevent="onSubmit">
        <input v-model="name" type="text" placeholder="Full name" required />
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <input v-model="confirmPassword" type="password" placeholder="Confirm password" required />
        <button type="submit">Register</button>
      </form>

      <div class="auth-links">
        <RouterLink :to="{ name: 'home' }">Back to home</RouterLink>
        <RouterLink :to="{ name: 'login' }">Already have an account?</RouterLink>
      </div>
    </div>
  </section>
</template>
