<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useWaterRateStore } from '@/store/waterRate'

const waterRateStore = useWaterRateStore()
const rate = ref<string>('')
const rateDate = ref<string>(new Date().toISOString().slice(0, 10))
const editingId = ref<number | null>(null)
const isSubmitting = ref(false)
const errorMessage = ref('')

const hasRates = computed(() => waterRateStore.waterRates.length > 0)
const currentRate = computed(() => waterRateStore.waterRates[0] || null)

function formatRate(value: number | string | null | undefined) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return '-'
  }
  return numeric.toFixed(4)
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString()
}

function resetForm() {
  rate.value = ''
  rateDate.value = new Date().toISOString().slice(0, 10)
  editingId.value = null
  errorMessage.value = ''
}

function startEdit(item: any) {
  editingId.value = Number(item.id)
  rate.value = String(item.rate ?? '')
  rateDate.value = item.rate_date || new Date().toISOString().slice(0, 10)
  errorMessage.value = ''
}

async function submitForm() {
  errorMessage.value = ''

  const parsedRate = Number(rate.value)
  if (!Number.isFinite(parsedRate) || parsedRate < 0) {
    errorMessage.value = 'Please enter a valid non-negative rate per cubic meter.'
    return
  }

  if (!rateDate.value) {
    errorMessage.value = 'Please select a valid rate date.'
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      rate: parsedRate,
      rate_date: rateDate.value,
    }

    if (editingId.value) {
      await waterRateStore.updateWaterRate(editingId.value, payload)
    } else {
      await waterRateStore.createWaterRate(payload)
    }
    resetForm()
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.error || 'Unable to save water rate. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

async function removeWaterRate(waterRateId: number) {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await waterRateStore.deleteWaterRate(waterRateId)
    if (editingId.value === waterRateId) {
      resetForm()
    }
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.error || 'Unable to delete water rate. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  waterRateStore.fetchWaterRates()
})
</script>

<template>
  <section class="page-wrap">
    <header class="section-header">
      <div>
        <h2>Water Rates per m³</h2>
        <p class="section-subtitle">Manage your current water rate history.</p>
      </div>
      <div class="current-rate" v-if="currentRate">
        <span class="current-label">Current</span>
        <strong>{{ formatRate(currentRate.rate) }} / m³</strong>
      </div>
    </header>

    <form @submit.prevent="submitForm" class="rate-form">
      <div class="form-grid">
        <label>
          <span>Rate</span>
          <input
            v-model="rate"
            type="number"
            step="0.0001"
            min="0"
            placeholder="Rate per cubic meter"
            :disabled="isSubmitting"
          />
        </label>
        <label>
          <span>Effective Date</span>
          <input v-model="rateDate" type="date" :disabled="isSubmitting" />
        </label>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="isSubmitting">
          {{ editingId ? 'Update Rate' : 'Add Rate' }}
        </button>
        <button v-if="editingId" type="button" @click="resetForm" :disabled="isSubmitting">
          Cancel
        </button>
      </div>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div v-if="hasRates" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Rate / m³</th>
            <th>Effective Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in waterRateStore.waterRates" :key="item.id">
            <td>{{ formatRate(item.rate) }}</td>
            <td>{{ formatDate(item.rate_date) }}</td>
            <td class="action-cell">
              <button type="button" @click="startEdit(item)" :disabled="isSubmitting">Edit</button>
              <button type="button" @click="removeWaterRate(item.id)" :disabled="isSubmitting">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="empty-state">No water rates yet.</p>
  </section>
</template>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-subtitle {
  margin-top: 0.35rem;
  color: var(--color-text);
  opacity: 0.8;
}

.current-rate {
  display: grid;
  gap: 0.2rem;
  text-align: right;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
}

.current-label {
  font-size: 0.8rem;
  color: var(--color-heading);
}

.rate-form {
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

label {
  display: grid;
  gap: 0.35rem;
}

label span {
  font-size: 0.9rem;
  color: var(--color-heading);
}

.form-actions {
  display: flex;
  gap: 0.6rem;
}

.table-wrap {
  overflow-x: auto;
}

.action-cell {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  margin-top: 0.5rem;
  opacity: 0.85;
}

@media (max-width: 680px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .current-rate {
    text-align: left;
  }
}
</style>
