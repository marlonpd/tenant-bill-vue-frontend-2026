import { ref } from 'vue'
import { defineStore } from 'pinia'
import { PowerRateService, type PowerRatePayload } from '@/apis/services/powerRate'

export const usePowerRateStore = defineStore('power-rate', () => {
  const powerRates = ref<any[]>([])

  async function fetchPowerRates() {
    const { data } = await PowerRateService.getAll()
    powerRates.value = data.power_rates || data.rates || data || []
  }

  async function createPowerRate(payload: PowerRatePayload) {
    await PowerRateService.create(payload)
    await fetchPowerRates()
  }

  async function updatePowerRate(powerRateId: number, payload: PowerRatePayload) {
    await PowerRateService.update(powerRateId, payload)
    await fetchPowerRates()
  }

  async function deletePowerRate(powerRateId: number) {
    await PowerRateService.delete(powerRateId)
    await fetchPowerRates()
  }

  return { powerRates, fetchPowerRates, createPowerRate, updatePowerRate, deletePowerRate }
})
