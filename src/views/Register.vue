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
  <section class="page-wrap">
    <h2>Register</h2>
    <p v-if="message">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <form @submit.prevent="onSubmit">
      <input v-model="name" type="text" placeholder="Name" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required />
      <button type="submit">Register</button>
    </form>
    <RouterLink :to="{ name: 'login' }">Already have an account?</RouterLink>
  </section>
</template>
