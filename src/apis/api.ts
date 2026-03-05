import axios from 'axios'
import { API_URL } from './config'
import JwtService from './jwt'

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = JwtService.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error?.response?.status
    const message = (error?.response?.data?.msg || error?.response?.data?.error || '').toLowerCase()

    const isAuthFailure =
      statusCode === 401 &&
      (message.includes('token') || message.includes('authorization') || message.includes('expired'))

    if (isAuthFailure) {
      JwtService.destroyToken()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

const ApiService = {
  query(resource: string, params?: object) {
    return apiClient.get(resource, { params })
  },
  get(resource: string) {
    return apiClient.get(resource)
  },
  post(resource: string, params?: object) {
    return apiClient.post(resource, params)
  },
  put(resource: string, params?: object) {
    return apiClient.put(resource, params)
  },
  delete(resource: string, params?: object) {
    return apiClient.delete(resource, params ? { data: params } : undefined)
  },
}

export default ApiService
