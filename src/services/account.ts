import { http } from './http'

export type RegisterPayload = {
  name: string
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  message: string
  access_token: string
  user: {
    name: string
    email: string
  }
}

export async function registerAccount(payload: RegisterPayload) {
  const response = await http.post('/account/register', payload)
  return response.data
}

export async function loginAccount(payload: LoginPayload) {
  const response = await http.post<LoginResponse>('/account/login', payload)
  return response.data
}
