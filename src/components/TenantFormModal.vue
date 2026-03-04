<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UnitItem } from '@/apis/services/units'

type TenantLike = {
  id?: number
  name?: string
  address?: string
  unit_id?: number | null
  contact_no?: string
  unit_rent_amount?: number | null
  due_date?: number | null
  is_fixed_power_rate?: boolean
  monthly_fixed_power_rate?: number | null
  initial_electric_sub_meter_reading?: number | null
  is_fixed_water_rate?: boolean
  monthly_fixed_water_rate?: number | null
  initial_water_sub_meter_reading?: number | null
}

type TenantFormPayload = {
  name: string
  address: string
  unit_no: string
  contact_no: string
  unit_rent_amount: string
  due_date: string
  is_fixed_power_rate: boolean
  monthly_fixed_power_rate: string
  initial_electric_sub_meter_reading: string
  is_fixed_water_rate: boolean
  monthly_fixed_water_rate: string
  initial_water_sub_meter_reading: string
}

const props = defineProps<{
  show: boolean
  loading: boolean
  isEditing: boolean
  tenant: TenantLike | null
  units: UnitItem[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: TenantFormPayload): void
}>()

const form = ref<TenantFormPayload>({
  name: '',
  address: '',
  unit_no: '',
  contact_no: '',
  unit_rent_amount: '',
  due_date: '',
  is_fixed_power_rate: false,
  monthly_fixed_power_rate: '',
  initial_electric_sub_meter_reading: '',
  is_fixed_water_rate: false,
  monthly_fixed_water_rate: '',
  initial_water_sub_meter_reading: '',
})

function setCreateDefaults() {
  form.value = {
    name: '',
    address: '',
    unit_no: '',
    contact_no: '',
    unit_rent_amount: '',
    due_date: '',
    is_fixed_power_rate: false,
    monthly_fixed_power_rate: '',
    initial_electric_sub_meter_reading: '',
    is_fixed_water_rate: false,
    monthly_fixed_water_rate: '',
    initial_water_sub_meter_reading: '',
  }
}

function setEditDefaults(tenant: TenantLike) {
  form.value = {
    name: tenant.name || '',
    address: tenant.address || '',
    unit_no: tenant.unit_id ? String(tenant.unit_id) : '',
    contact_no: tenant.contact_no || '',
    unit_rent_amount:
      tenant.unit_rent_amount !== null && tenant.unit_rent_amount !== undefined
        ? String(tenant.unit_rent_amount)
        : '',
    due_date: tenant.due_date ? String(tenant.due_date) : '',
    is_fixed_power_rate: !!tenant.is_fixed_power_rate,
    monthly_fixed_power_rate:
      tenant.monthly_fixed_power_rate !== null && tenant.monthly_fixed_power_rate !== undefined
        ? String(tenant.monthly_fixed_power_rate)
        : '',
    initial_electric_sub_meter_reading:
      tenant.initial_electric_sub_meter_reading !== null &&
      tenant.initial_electric_sub_meter_reading !== undefined
        ? String(tenant.initial_electric_sub_meter_reading)
        : '',
    is_fixed_water_rate: !!tenant.is_fixed_water_rate,
    monthly_fixed_water_rate:
      tenant.monthly_fixed_water_rate !== null && tenant.monthly_fixed_water_rate !== undefined
        ? String(tenant.monthly_fixed_water_rate)
        : '',
    initial_water_sub_meter_reading:
      tenant.initial_water_sub_meter_reading !== null &&
      tenant.initial_water_sub_meter_reading !== undefined
        ? String(tenant.initial_water_sub_meter_reading)
        : '',
  }
}

watch(
  () => [props.show, props.isEditing, props.tenant?.id],
  () => {
    if (!props.show) return
    if (props.isEditing && props.tenant) {
      setEditDefaults(props.tenant)
      return
    }
    setCreateDefaults()
  },
  { immediate: true },
)

function submit() {
  emit('submit', { ...form.value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="tenant-modal-overlay" @click.self="emit('close')">
      <div class="tenant-modal-card">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Update Tenant' : 'Create Tenant' }}</h3>
          <button type="button" class="ghost-btn" :disabled="loading" @click="emit('close')">Close</button>
        </div>

        <form @submit.prevent="submit">
          <input v-model="form.name" type="text" placeholder="Name" required />
          <input v-model="form.address" type="text" placeholder="Address" required />

          <select v-model="form.unit_no">
            <option value="">Select unit</option>
            <option v-for="unit in units" :key="unit.id" :value="String(unit.id)">
              {{ unit.unit_no }}
            </option>
          </select>

          <input v-model="form.contact_no" type="text" placeholder="Contact no." required />
          <input
            v-model="form.unit_rent_amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Monthly unit rent amount"
            required
          />
          <input
            v-model="form.due_date"
            type="number"
            min="1"
            max="31"
            step="1"
            placeholder="Due day of month (1-31)"
          />

          <label>
            <input v-model="form.is_fixed_power_rate" type="checkbox" />
            Electric bill is fixed rate
          </label>
          <input
            v-if="form.is_fixed_power_rate"
            v-model="form.monthly_fixed_power_rate"
            type="number"
            min="0"
            step="0.01"
            placeholder="Monthly fixed electric rate"
            required
          />
          <input
            v-if="!form.is_fixed_power_rate"
            v-model="form.initial_electric_sub_meter_reading"
            type="number"
            min="0"
            step="0.01"
            placeholder="Initial electric sub meter reading"
            required
          />

          <label>
            <input v-model="form.is_fixed_water_rate" type="checkbox" />
            Water bill is fixed rate
          </label>
          <input
            v-if="form.is_fixed_water_rate"
            v-model="form.monthly_fixed_water_rate"
            type="number"
            min="0"
            step="0.01"
            placeholder="Monthly fixed water rate"
            required
          />
          <input
            v-if="!form.is_fixed_water_rate"
            v-model="form.initial_water_sub_meter_reading"
            type="number"
            min="0"
            step="0.01"
            placeholder="Initial water sub meter reading"
            required
          />

          <div class="actions">
            <button type="submit" :disabled="loading">{{ isEditing ? 'Update Tenant' : 'Create Tenant' }}</button>
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

.tenant-modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 9999;
  background-color: var(--vt-c-divider-dark-1);
}

.tenant-modal-card {
  width: 100%;
  max-width: 640px;
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
  .tenant-modal-overlay {
    padding: 0.5rem;
    align-items: flex-end;
  }

  .tenant-modal-card {
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
