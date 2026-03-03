<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMeterReadingStore } from '@/store/meterReading'

const route = useRoute()
const meterReadingStore = useMeterReadingStore()

onMounted(() => {
  const tenantId = Number(route.params.tenantId)
  if (tenantId) {
    meterReadingStore.fetchMeterReadings(tenantId)
  }
})
</script>

<template>
  <section class="page-wrap">
    <h2>Meter Readings</h2>
    <ul>
      <li v-for="(reading, index) in meterReadingStore.meterReadings" :key="reading.id || index">
        {{ reading.current_reading ?? reading.currentReading ?? JSON.stringify(reading) }}
      </li>
    </ul>
  </section>
</template>
