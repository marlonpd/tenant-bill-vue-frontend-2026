<script setup lang="ts">
import { onMounted } from 'vue'
import { usePowerRateStore } from '@/store/powerRate'

const powerRateStore = usePowerRateStore()

onMounted(() => {
  powerRateStore.fetchPowerRates()
})
</script>

<template>
  <section class="page-wrap">
    <h2>Power Rates</h2>
    <ul>
      <li v-for="(rate, index) in powerRateStore.powerRates" :key="index">
        {{ rate.rate ?? rate.value ?? rate }}
      </li>
    </ul>
  </section>
</template>
