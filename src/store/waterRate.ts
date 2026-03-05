import { ref } from 'vue'
import { defineStore } from 'pinia'
import { WaterRateService, type WaterRatePayload } from '@/apis/services/waterRate'

export const useWaterRateStore = defineStore('water-rate', () => {
  const waterRates = ref<any[]>([])

  async function fetchWaterRates() {
    const { data } = await WaterRateService.getAll()
    waterRates.value = data.water_rates || data.rates || data || []
  }

  async function createWaterRate(payload: WaterRatePayload) {
    await WaterRateService.create(payload)
    await fetchWaterRates()
  }

  async function updateWaterRate(waterRateId: number, payload: WaterRatePayload) {
    await WaterRateService.update(waterRateId, payload)
    await fetchWaterRates()
  }

  async function deleteWaterRate(waterRateId: number) {
    await WaterRateService.delete(waterRateId)
    await fetchWaterRates()
  }

  return { waterRates, fetchWaterRates, createWaterRate, updateWaterRate, deleteWaterRate }
})
