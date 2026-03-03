import axios from 'axios'
import { API_URL } from './config'
import JwtService from './jwt'

const apiClient = axios.create({
  baseURL: API_URL,
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
  delete(resource: string) {
    return apiClient.delete(resource)
  },
}

export default ApiService
