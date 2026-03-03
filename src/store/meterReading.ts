import { ref } from 'vue'
import { defineStore } from 'pinia'
import { MeterReadingService } from '@/apis/services/meterReading'

export const useMeterReadingStore = defineStore('meter-reading', () => {
  const meterReadings = ref<any[]>([])

  async function fetchMeterReadings(tenantId: number) {
    const { data } = await MeterReadingService.getAll(tenantId)
    meterReadings.value = data.meter_readings || data.readings || data || []
  }

  return { meterReadings, fetchMeterReadings }
})
