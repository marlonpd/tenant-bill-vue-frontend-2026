import ApiService from '@/apis/api'

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
}

export const AccountService = {
  login(payload: LoginPayload) {
    return ApiService.post('/account/login', payload)
  },
  register(payload: RegisterPayload) {
    return ApiService.post('/account/register', payload)
  },
  protected() {
    return ApiService.get('/account/protected')
  },
  me() {
    return ApiService.get('/account/me')
  },
  updateProfile(payload: {
    address?: string | null
    latitude?: number | null
    longitude?: number | null
    profilePhoto?: File | null
  }) {
    const formData = new FormData()
    if (payload.address !== undefined) {
      formData.append('address', payload.address || '')
    }
    if (payload.latitude !== undefined && payload.latitude !== null) {
      formData.append('latitude', String(payload.latitude))
    }
    if (payload.longitude !== undefined && payload.longitude !== null) {
      formData.append('longitude', String(payload.longitude))
    }
    if (payload.profilePhoto) {
      formData.append('profile_photo', payload.profilePhoto)
    }
    return ApiService.put('/account/profile', formData)
  },
  logout(email: string) {
    return ApiService.post('/account/logout', { email })
  },
}
