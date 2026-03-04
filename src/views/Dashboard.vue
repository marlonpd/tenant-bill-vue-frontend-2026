<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTenantsStore } from '@/store/tenants'
import { UnitsService, type UnitItem } from '@/apis/services/units'
import { BillingPeriodsService } from '@/apis/services/billingPeriods'
import BillingModal from '@/components/BillingModal.vue'

const tenantsStore = useTenantsStore()

const selectedTenantId = ref<number | null>(null)
const loading = ref(false)
const message = ref('')
const error = ref('')
const units = ref<UnitItem[]>([])
const showBillingModal = ref(false)
const billingTenant = ref<any | null>(null)

const form = ref({
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

const isEditing = computed(() => selectedTenantId.value !== null)

function resetForm() {
  selectedTenantId.value = null
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

function startEdit(tenant: any) {
  selectedTenantId.value = tenant.id
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

async function submitTenant() {
  loading.value = true
  error.value = ''
  message.value = ''

  const unitNo = String(form.value.unit_no ?? '').trim()
  const rentAmountRaw = String(form.value.unit_rent_amount ?? '').trim()
  const dueDateRaw = String(form.value.due_date ?? '').trim()
  const monthlyFixedPowerRateRaw = String(form.value.monthly_fixed_power_rate ?? '').trim()
  const electricInitialRaw = String(form.value.initial_electric_sub_meter_reading ?? '').trim()
  const monthlyFixedWaterRateRaw = String(form.value.monthly_fixed_water_rate ?? '').trim()
  const waterInitialRaw = String(form.value.initial_water_sub_meter_reading ?? '').trim()

  if (form.value.is_fixed_power_rate && !monthlyFixedPowerRateRaw) {
    loading.value = false
    error.value = 'Monthly fixed electric rate is required when electric bill is fixed.'
    return
  }

  if (form.value.is_fixed_water_rate && !monthlyFixedWaterRateRaw) {
    loading.value = false
    error.value = 'Monthly fixed water rate is required when water bill is fixed.'
    return
  }

  if (!form.value.is_fixed_power_rate && !electricInitialRaw) {
    loading.value = false
    error.value = 'Initial electric sub meter reading is required for meter-based electric billing.'
    return
  }

  if (!form.value.is_fixed_water_rate && !waterInitialRaw) {
    loading.value = false
    error.value = 'Initial water sub meter reading is required for meter-based water billing.'
    return
  }

  const payload = {
    name: form.value.name,
    address: form.value.address,
    contact_no: form.value.contact_no,
    unit_id: unitNo ? Number(unitNo) : null,
    unit_rent_amount: rentAmountRaw ? Number(rentAmountRaw) : null,
    due_date: dueDateRaw ? Number(dueDateRaw) : null,
    is_fixed_power_rate: form.value.is_fixed_power_rate,
    monthly_fixed_power_rate: form.value.is_fixed_power_rate
      ? monthlyFixedPowerRateRaw
        ? Number(monthlyFixedPowerRateRaw)
        : null
      : null,
    initial_electric_sub_meter_reading: form.value.is_fixed_power_rate
      ? null
      : electricInitialRaw
        ? Number(electricInitialRaw)
        : null,
    is_fixed_water_rate: form.value.is_fixed_water_rate,
    monthly_fixed_water_rate: form.value.is_fixed_water_rate
      ? monthlyFixedWaterRateRaw
        ? Number(monthlyFixedWaterRateRaw)
        : null
      : null,
    initial_water_sub_meter_reading: form.value.is_fixed_water_rate
      ? null
      : waterInitialRaw
        ? Number(waterInitialRaw)
        : null,
  }

  try {
    if (isEditing.value && selectedTenantId.value) {
      await tenantsStore.updateTenant(selectedTenantId.value, payload)
      message.value = 'Tenant updated successfully.'
    } else {
      await tenantsStore.createTenant(payload)
      message.value = 'Tenant created successfully.'
    }
    resetForm()
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      err?.response?.data?.msg ||
      err?.message ||
      'Unable to save tenant.'
  } finally {
    loading.value = false
  }
}

async function fetchUnits() {
  try {
    const { data } = await UnitsService.getAll()
    units.value = data.units || []
  } catch {
    units.value = []
  }
}

function unitLabel(unitId: number | null | undefined) {
  if (!unitId) return '-'
  const found = units.value.find((unit) => unit.id === unitId)
  return found?.unit_no || String(unitId)
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value)
}

function openBillingModal(tenant: any) {
  billingTenant.value = tenant
  showBillingModal.value = true
}

function closeBillingModal() {
  showBillingModal.value = false
  billingTenant.value = null
}

async function submitBilling(payload: {
  from_date: string
  end_date: string
  monthly_rent_amount: number | null
  current_electric_sub_meter_reading: number | null
  current_water_sub_meter_reading: number | null
  notes: string | null
}) {
  if (!billingTenant.value) return

  loading.value = true
  error.value = ''
  message.value = ''

  if (!payload.from_date || !payload.end_date) {
    loading.value = false
    error.value = 'Billing period from and end dates are required.'
    return
  }

  if (!billingTenant.value.is_fixed_power_rate && payload.current_electric_sub_meter_reading === null) {
    loading.value = false
    error.value = 'Current electric sub meter reading is required for meter-based electric billing.'
    return
  }

  if (!billingTenant.value.is_fixed_water_rate && payload.current_water_sub_meter_reading === null) {
    loading.value = false
    error.value = 'Current water sub meter reading is required for meter-based water billing.'
    return
  }

  try {
    await BillingPeriodsService.create({
      tenant_id: billingTenant.value.id,
      from_date: payload.from_date,
      end_date: payload.end_date,
      monthly_rent_amount: payload.monthly_rent_amount,
      current_electric_sub_meter_reading: billingTenant.value.is_fixed_power_rate
        ? null
        : payload.current_electric_sub_meter_reading,
      current_water_sub_meter_reading: billingTenant.value.is_fixed_water_rate
        ? null
        : payload.current_water_sub_meter_reading,
      notes: payload.notes,
    })

    message.value = 'Billing period created successfully.'
    closeBillingModal()
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      err?.response?.data?.msg ||
      err?.message ||
      'Unable to create billing period.'
  } finally {
    loading.value = false
  }
}

async function removeTenant(id: number) {
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    await tenantsStore.deleteTenant(id)
    message.value = 'Tenant deleted successfully.'
    if (selectedTenantId.value === id) {
      resetForm()
    }
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      err?.response?.data?.msg ||
      err?.message ||
      'Unable to delete tenant.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  tenantsStore.fetchTenants()
  fetchUnits()
})
</script>

<template>
  <section class="page-wrap">
    <h2>Tenants</h2>

    <p v-if="message">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <form @submit.prevent="submitTenant">
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
        <button type="submit" :disabled="loading">
          {{ isEditing ? 'Update Tenant' : 'Create Tenant' }}
        </button>
        <button type="button" :disabled="loading" @click="resetForm">Clear</button>
      </div>
    </form>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Address</th>
          <th>Unit no.</th>
          <th>Contact no.</th>
          <th>Monthly rent</th>
          <th>Due date</th>
          <th>Electric billing</th>
          <th>Monthly fixed electric rate</th>
          <th>Initial electric reading</th>
          <th>Water billing</th>
          <th>Monthly fixed water rate</th>
          <th>Initial water reading</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(tenant, index) in tenantsStore.tenants" :key="tenant.id || index">
          <td>{{ index + 1 }}</td>
          <td>
            <RouterLink :to="{ name: 'meter.reading', params: { tenantId: tenant.id } }">
              {{ tenant.name || 'Tenant' }}
            </RouterLink>
          </td>
          <td>{{ tenant.address || '-' }}</td>
          <td>{{ unitLabel(tenant.unit_id) }}</td>
          <td>{{ tenant.contact_no || '-' }}</td>
          <td>{{ formatCurrency(tenant.unit_rent_amount) }}</td>
          <td>{{ tenant.due_date ? `Day ${tenant.due_date}` : '-' }}</td>
          <td>{{ tenant.is_fixed_power_rate ? 'Fixed' : 'Meter-based' }}</td>
          <td>{{ formatCurrency(tenant.monthly_fixed_power_rate) }}</td>
          <td>{{ tenant.initial_electric_sub_meter_reading ?? '-' }}</td>
          <td>{{ tenant.is_fixed_water_rate ? 'Fixed' : 'Meter-based' }}</td>
          <td>{{ formatCurrency(tenant.monthly_fixed_water_rate) }}</td>
          <td>{{ tenant.initial_water_sub_meter_reading ?? '-' }}</td>
          <td class="actions">
            <button type="button" :disabled="loading" @click="openBillingModal(tenant)">New Billing</button>
            <button type="button" :disabled="loading" @click="startEdit(tenant)">Edit</button>
            <button type="button" :disabled="loading" @click="removeTenant(tenant.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <BillingModal
      :show="showBillingModal"
      :tenant="billingTenant"
      :loading="loading"
      @close="closeBillingModal"
      @submit="submitBilling"
    />
  </section>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 0.5rem;
}
</style>
