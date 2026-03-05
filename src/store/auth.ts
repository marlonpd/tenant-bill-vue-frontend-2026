import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { AccountService } from '@/apis/services/account'
import JwtService from '@/apis/jwt'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{
    name?: string
    email?: string
    role?: string
    contact_no?: string | null
    address?: string | null
    profile_photo_url?: string | null
    latitude?: number | null
    longitude?: number | null
  }>({})
  const errors = ref<string[]>([])
  const token = ref<string | null>(JwtService.getToken())

  const isAuthenticated = computed(() => !!token.value)

  async function login(payload: { email: string; password: string }) {
    errors.value = []
    const { data } = await AccountService.login(payload)
    token.value = data.access_token
    user.value = data.user || {}
    JwtService.saveToken(data.access_token)
  }

  async function fetchMe() {
    if (!token.value) return
    const { data } = await AccountService.me()
    user.value = data.user || {}
  }

  async function register(payload: { name: string; email: string; password: string }) {
    errors.value = []
    await AccountService.register(payload)
  }

  async function logout() {
    const email = user.value.email || ''
    if (email) {
      await AccountService.logout(email)
    }
    token.value = null
    user.value = {}
    JwtService.destroyToken()
  }

  return { user, errors, token, isAuthenticated, login, register, logout, fetchMe }
})
