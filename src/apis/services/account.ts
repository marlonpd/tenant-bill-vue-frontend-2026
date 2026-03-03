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
  logout(email: string) {
    return ApiService.post('/account/logout', { email })
  },
}
