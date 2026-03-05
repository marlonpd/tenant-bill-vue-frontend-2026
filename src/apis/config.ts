const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '/api'
export const API_URL = String(rawApiUrl).replace(/\/$/, '')
