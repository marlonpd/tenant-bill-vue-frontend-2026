import ApiService from '@/apis/api'

export const HealthService = {
  getErrors(lines = 200) {
    return ApiService.query('/health/errors', { lines })
  },
}
