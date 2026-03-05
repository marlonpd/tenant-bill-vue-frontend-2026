<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type BillingTenant = {
  id: number
  name?: string
  is_fixed_power_rate?: boolean
  monthly_fixed_power_rate?: number | null
  is_fixed_water_rate?: boolean
  monthly_fixed_water_rate?: number | null
  unit_rent_amount?: number | null
}

type BillingSubmitPayload = {
  from_date: string
  end_date: string
  monthly_rent_amount: number | null
  current_electric_sub_meter_reading: number | null
  current_water_sub_meter_reading: number | null
  notes: string | null
}

const props = defineProps<{
  show: boolean
  tenant: BillingTenant | null
  loading: boolean
  currentPowerRate: number | null
  currentWaterRate: number | null
  previousElectricReading: number | null
  previousWaterReading: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: BillingSubmitPayload): void
}>()

const form = ref({
  from_date: '',
  end_date: '',
  current_electric_sub_meter_reading: '',
  current_water_sub_meter_reading: '',
  notes: '',
})

watch(
  () => [props.show, props.tenant?.id],
  () => {
    if (!props.show || !props.tenant) return

    form.value = {
      from_date: '',
      end_date: '',
      current_electric_sub_meter_reading: '',
      current_water_sub_meter_reading: '',
      notes: '',
    }
  },
  { immediate: true },
)

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value)
}

function formatRate(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined) return '-'
  return `${Number(value).toFixed(4)} / ${unit}`
}

const monthlyRentPreview = computed(() => Number(props.tenant?.unit_rent_amount || 0))

const currentElectricReading = computed(() => {
  const value = Number(form.value.current_electric_sub_meter_reading)
  return Number.isFinite(value) ? value : null
})

const currentWaterReading = computed(() => {
  const value = Number(form.value.current_water_sub_meter_reading)
  return Number.isFinite(value) ? value : null
})

const usedElectricKwhPreview = computed<number | null>(() => {
  if (props.tenant?.is_fixed_power_rate) return null
  if (props.previousElectricReading === null || currentElectricReading.value === null) return null
  const used = currentElectricReading.value - props.previousElectricReading
  return used >= 0 ? used : null
})

const isElectricReadingLowerThanPrevious = computed(() => {
  if (props.tenant?.is_fixed_power_rate) return false
  if (props.previousElectricReading === null || currentElectricReading.value === null) return false
  return currentElectricReading.value < props.previousElectricReading
})

const usedWaterCubicMeterPreview = computed<number | null>(() => {
  if (props.tenant?.is_fixed_water_rate) return null
  if (props.previousWaterReading === null || currentWaterReading.value === null) return null
  const used = currentWaterReading.value - props.previousWaterReading
  return used >= 0 ? used : null
})

const isWaterReadingLowerThanPrevious = computed(() => {
  if (props.tenant?.is_fixed_water_rate) return false
  if (props.previousWaterReading === null || currentWaterReading.value === null) return false
  return currentWaterReading.value < props.previousWaterReading
})

const electricBillPreview = computed<number | null>(() => {
  if (!props.tenant) return null
  if (props.tenant.is_fixed_power_rate) {
    return props.tenant.monthly_fixed_power_rate ?? 0
  }
  if (usedElectricKwhPreview.value === null || props.currentPowerRate === null) return null
  return usedElectricKwhPreview.value * props.currentPowerRate
})

const waterBillPreview = computed<number | null>(() => {
  if (!props.tenant) return null
  if (props.tenant.is_fixed_water_rate) {
    return props.tenant.monthly_fixed_water_rate ?? 0
  }
  if (usedWaterCubicMeterPreview.value === null || props.currentWaterRate === null) return null
  return usedWaterCubicMeterPreview.value * props.currentWaterRate
})

const totalPreview = computed<number>(() => {
  return (
    monthlyRentPreview.value +
    Number(electricBillPreview.value || 0) +
    Number(waterBillPreview.value || 0)
  )
})

function submit() {
  emit('submit', {
    from_date: form.value.from_date,
    end_date: form.value.end_date,
    monthly_rent_amount:
      props.tenant?.unit_rent_amount !== null && props.tenant?.unit_rent_amount !== undefined
        ? Number(props.tenant.unit_rent_amount)
        : null,
    current_electric_sub_meter_reading: form.value.current_electric_sub_meter_reading
      ? Number(form.value.current_electric_sub_meter_reading)
      : null,
    current_water_sub_meter_reading: form.value.current_water_sub_meter_reading
      ? Number(form.value.current_water_sub_meter_reading)
      : null,
    notes: form.value.notes || null,
  })
}

function formatReading(value: number | null | undefined) {
  if (value === null || value === undefined) return '-'
  return Number(value).toFixed(2)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="billing-modal-overlay" @click.self="emit('close')">
      <div class="billing-modal-card">
        <div class="modal-header">
          <h3>Create Billing</h3>
          <button type="button" class="ghost-btn" :disabled="loading" @click="emit('close')">Close</button>
        </div>

        <div class="meta-row">
          <p><strong>Tenant:</strong> {{ tenant?.name || 'Tenant' }}</p>
          <p><strong>Monthly Rent:</strong> {{ formatCurrency(monthlyRentPreview) }}</p>
        </div>

        <form @submit.prevent="submit">
          <input v-model="form.from_date" type="date" required />
          <input v-model="form.end_date" type="date" required />

          <p><strong>Monthly Rent (from tenant profile):</strong> {{ formatCurrency(monthlyRentPreview) }}</p>

          <template v-if="tenant?.is_fixed_power_rate">
            <p><strong>Fixed Electric Rate:</strong> {{ formatCurrency(tenant?.monthly_fixed_power_rate) }}</p>
          </template>
          <template v-else>
            <p><strong>Current Power Rate:</strong> {{ formatRate(currentPowerRate, 'kWh') }}</p>
            <p><strong>Previous Electric Reading:</strong> {{ formatReading(previousElectricReading) }}</p>
            <input
              v-model="form.current_electric_sub_meter_reading"
              type="number"
              min="0"
              step="0.01"
              placeholder="Current electric sub meter reading"
              required
            />
            <p v-if="isElectricReadingLowerThanPrevious" class="reading-warning">
              Current electric reading must be greater than or equal to previous reading.
            </p>
          </template>

          <template v-if="tenant?.is_fixed_water_rate">
            <p><strong>Fixed Water Rate:</strong> {{ formatCurrency(tenant?.monthly_fixed_water_rate) }}</p>
          </template>
          <template v-else>
            <p><strong>Current Water Rate:</strong> {{ formatRate(currentWaterRate, 'm³') }}</p>
            <p><strong>Previous Water Reading:</strong> {{ formatReading(previousWaterReading) }}</p>
            <input
              v-model="form.current_water_sub_meter_reading"
              type="number"
              min="0"
              step="0.01"
              placeholder="Current water sub meter reading"
              required
            />
            <p v-if="isWaterReadingLowerThanPrevious" class="reading-warning">
              Current water reading must be greater than or equal to previous reading.
            </p>
          </template>

          <input v-model="form.notes" type="text" placeholder="Notes (optional)" />

          <div class="actions">
            <button type="submit" :disabled="loading">Create Billing</button>
            <button type="button" class="ghost-btn" :disabled="loading" @click="emit('close')">Cancel</button>
          </div>
        </form>

        <div class="billing-summary">
          <h4>Billing Summary</h4>
          <p>
            <strong>House Rent:</strong>
            <span>{{ formatCurrency(monthlyRentPreview) }}</span>
          </p>
          <p>
            <strong>Electric Bill:</strong>
            <span v-if="electricBillPreview !== null">{{ formatCurrency(electricBillPreview) }}</span>
            <span v-else>Calculated from meter usage on submit</span>
          </p>
          <p v-if="!tenant?.is_fixed_power_rate">
            <strong>Used kWh:</strong>
            <span v-if="usedElectricKwhPreview !== null">{{ formatReading(usedElectricKwhPreview) }}</span>
            <span v-else>Enter a valid current electric reading</span>
          </p>
          <p>
            <strong>Water Bill:</strong>
            <span v-if="waterBillPreview !== null">{{ formatCurrency(waterBillPreview) }}</span>
            <span v-else>Calculated from meter usage on submit</span>
          </p>
          <p v-if="!tenant?.is_fixed_water_rate">
            <strong>Used m³:</strong>
            <span v-if="usedWaterCubicMeterPreview !== null">{{ formatReading(usedWaterCubicMeterPreview) }}</span>
            <span v-else>Enter a valid current water reading</span>
          </p>
          <p class="total-row">
            <strong>Total:</strong>
            <span>{{ formatCurrency(totalPreview) }}</span>
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.35rem;
}

.billing-modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 9999;
  background-color: var(--vt-c-divider-dark-1);
}

.billing-modal-card {
  width: 100%;
  max-width: 540px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background);
  max-height: 92vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.modal-header h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-accent-hover);
}

.meta-row {
  display: grid;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.ghost-btn {
  background: var(--color-background-soft);
  color: var(--color-accent);
  border-color: var(--color-accent-soft);
}

.ghost-btn:hover:not(:disabled) {
  background: var(--color-accent-soft);
  color: var(--color-accent-hover);
}

.billing-summary {
  margin-top: 0.9rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--color-border);
  display: grid;
  gap: 0.35rem;
}

.billing-summary h4 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 0.15rem;
}

.billing-summary p {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
}

.total-row {
  padding-top: 0.25rem;
  margin-top: 0.2rem;
  border-top: 1px dashed var(--color-border);
}

.reading-warning {
  color: #dc2626;
  font-size: 0.85rem;
}

@media (max-width: 700px) {
  .billing-modal-overlay {
    padding: 0.5rem;
    align-items: flex-end;
  }

  .billing-modal-card {
    max-width: 100%;
    max-height: 94vh;
    border-radius: 12px 12px 0 0;
    padding: 0.85rem;
  }

  .modal-header {
    margin-bottom: 0.5rem;
  }

  .modal-header h3 {
    font-size: 1rem;
  }

  .actions button {
    flex: 1;
  }
}
</style>
