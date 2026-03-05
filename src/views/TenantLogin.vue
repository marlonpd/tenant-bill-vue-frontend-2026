<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TenantJwtService from '@/apis/tenantJwt'
import { TenantPortalService } from '@/apis/services/tenantPortal'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const { data } = await TenantPortalService.login({
      email: email.value.trim().toLowerCase(),
      password: password.value,
    })

    TenantJwtService.saveTenantToken(data.access_token)
    router.push({ name: 'tenant-portal' })
  } catch (err: any) {
    error.value = err?.response?.data?.error || 'Tenant login failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="page-wrap">
    <h2>Tenant Portal Login</h2>
    <p v-if="error" class="error">{{ error }}</p>

    <form @submit.prevent="onSubmit">
      <input v-model="email" type="email" placeholder="Tenant email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit" :disabled="loading">{{ loading ? 'Signing in...' : 'Log in' }}</button>
    </form>

    <RouterLink :to="{ name: 'login' }">Owner/Admin login</RouterLink>
  </section>
</template>
