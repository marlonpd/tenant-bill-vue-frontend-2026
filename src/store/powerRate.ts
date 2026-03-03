import { ref } from 'vue'
import { defineStore } from 'pinia'
import { PowerRateService } from '@/apis/services/powerRate'

export const usePowerRateStore = defineStore('power-rate', () => {
  const powerRates = ref<any[]>([])

  async function fetchPowerRates() {
    const { data } = await PowerRateService.getAll()
    powerRates.value = data.power_rates || data.rates || data || []
  }

  return { powerRates, fetchPowerRates }
})
