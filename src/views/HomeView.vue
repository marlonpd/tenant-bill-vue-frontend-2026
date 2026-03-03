<script setup lang="ts">
import { ref } from 'vue'
import { loginAccount, registerAccount } from '@/services/account'

const registerName = ref('')
const registerEmail = ref('')
const registerPassword = ref('')

const loginEmail = ref('')
const loginPassword = ref('')

const loading = ref(false)
const responseMessage = ref('')
const token = ref('')

async function handleRegister() {
  loading.value = true
  responseMessage.value = ''

  try {
    const data = await registerAccount({
      name: registerName.value,
      email: registerEmail.value,
      password: registerPassword.value,
    })
    responseMessage.value = data.message || 'Registered successfully'
  } catch (error: any) {
    responseMessage.value = error?.response?.data?.error || 'Register failed'
  } finally {
    loading.value = false
  }
}

async function handleLogin() {
  loading.value = true
  responseMessage.value = ''

  try {
    const data = await loginAccount({
      email: loginEmail.value,
      password: loginPassword.value,
    })
    token.value = data.access_token
    responseMessage.value = data.message || 'Login successful'
  } catch (error: any) {
    responseMessage.value = error?.response?.data?.error || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="api-page">
    <h1>Biller API Test</h1>

    <section>
      <h2>Register</h2>
      <form @submit.prevent="handleRegister">
        <input v-model="registerName" type="text" placeholder="Name" required />
        <input v-model="registerEmail" type="email" placeholder="Email" required />
        <input v-model="registerPassword" type="password" placeholder="Password" required />
        <button type="submit" :disabled="loading">Register</button>
      </form>
    </section>

    <section>
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <input v-model="loginEmail" type="email" placeholder="Email" required />
        <input v-model="loginPassword" type="password" placeholder="Password" required />
        <button type="submit" :disabled="loading">Login</button>
      </form>
    </section>

    <p v-if="responseMessage">{{ responseMessage }}</p>
    <p v-if="token"><strong>Token:</strong> {{ token }}</p>
  </main>
</template>

<style scoped>
.api-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

section {
  margin-top: 1.5rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

form {
  display: grid;
  gap: 0.75rem;
}

input,
button {
  padding: 0.625rem 0.75rem;
  font-size: 0.95rem;
}
</style>
