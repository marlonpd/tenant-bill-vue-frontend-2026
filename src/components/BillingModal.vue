<script setup lang="ts">
import { ref, watch } from 'vue'

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
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: BillingSubmitPayload): void
}>()

const form = ref({
  from_date: '',
  end_date: '',
  monthly_rent_amount: '',
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
      monthly_rent_amount:
        props.tenant.unit_rent_amount !== null && props.tenant.unit_rent_amount !== undefined
          ? String(props.tenant.unit_rent_amount)
          : '',
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

function submit() {
  emit('submit', {
    from_date: form.value.from_date,
    end_date: form.value.end_date,
    monthly_rent_amount: form.value.monthly_rent_amount
      ? Number(form.value.monthly_rent_amount)
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
          <p><strong>Monthly Rent:</strong> {{ formatCurrency(Number(form.monthly_rent_amount || 0)) }}</p>
        </div>

        <form @submit.prevent="submit">
          <input v-model="form.from_date" type="date" required />
          <input v-model="form.end_date" type="date" required />

          <input
            v-model="form.monthly_rent_amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Monthly rent amount"
            required
          />

          <template v-if="tenant?.is_fixed_power_rate">
            <p><strong>Fixed Electric Rate:</strong> {{ formatCurrency(tenant?.monthly_fixed_power_rate) }}</p>
          </template>
          <input
            v-else
            v-model="form.current_electric_sub_meter_reading"
            type="number"
            min="0"
            step="0.01"
            placeholder="Current electric sub meter reading"
            required
          />

          <template v-if="tenant?.is_fixed_water_rate">
            <p><strong>Fixed Water Rate:</strong> {{ formatCurrency(tenant?.monthly_fixed_water_rate) }}</p>
          </template>
          <input
            v-else
            v-model="form.current_water_sub_meter_reading"
            type="number"
            min="0"
            step="0.01"
            placeholder="Current water sub meter reading"
            required
          />

          <input v-model="form.notes" type="text" placeholder="Notes (optional)" />

          <div class="actions">
            <button type="submit" :disabled="loading">Create Billing</button>
            <button type="button" class="ghost-btn" :disabled="loading" @click="emit('close')">Cancel</button>
          </div>
        </form>
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
