<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { UnitsService, type UnitItem } from '@/apis/services/units'

const units = ref<UnitItem[]>([])
const loading = ref(false)
const message = ref('')
const error = ref('')

const form = ref({
  name: '',
  electric_meter_no: '',
  water_meter_no: '',
})

async function fetchUnits() {
  try {
    const { data } = await UnitsService.getAll()
    units.value = data.units || []
  } catch {
    units.value = []
  }
}

function resetForm() {
  form.value = {
    name: '',
    electric_meter_no: '',
    water_meter_no: '',
  }
}

async function submitUnit() {
  loading.value = true
  message.value = ''
  error.value = ''

  try {
    await UnitsService.create({
      unit_no: form.value.name,
      electric_meter_no: form.value.electric_meter_no || null,
      water_meter_no: form.value.water_meter_no || null,
    })

    message.value = 'Unit created successfully.'
    resetForm()
    await fetchUnits()
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      err?.response?.data?.msg ||
      err?.message ||
      'Unable to create unit.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUnits()
})
</script>

<template>
  <section class="page-wrap">
    <h2>Create Unit</h2>

    <p v-if="message">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <form @submit.prevent="submitUnit">
      <input v-model="form.name" type="text" placeholder="Unit name" required />
      <input
        v-model="form.electric_meter_no"
        type="text"
        placeholder="Electric meter ID (optional)"
      />
      <input
        v-model="form.water_meter_no"
        type="text"
        placeholder="Water meter ID (optional)"
      />

      <div class="actions">
        <button type="submit" :disabled="loading">Create Unit</button>
        <button type="button" :disabled="loading" @click="resetForm">Clear</button>
      </div>
    </form>

    <h3>Units</h3>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Electric meter ID</th>
          <th>Water meter ID</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(unit, index) in units" :key="unit.id || index">
          <td>{{ index + 1 }}</td>
          <td>{{ unit.unit_no }}</td>
          <td>{{ unit.electric_meter_no || '-' }}</td>
          <td>{{ unit.water_meter_no || '-' }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 0.5rem;
}
</style>
