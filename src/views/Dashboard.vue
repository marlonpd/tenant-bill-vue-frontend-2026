<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTenantsStore } from '@/store/tenants'
import { UnitsService, type UnitItem } from '@/apis/services/units'
import { BillingPeriodsService } from '@/apis/services/billingPeriods'
import BillingModal from '@/components/BillingModal.vue'
import TenantFormModal from '@/components/TenantFormModal.vue'
import TenantDetailsModal from '@/components/TenantDetailsModal.vue'

const tenantsStore = useTenantsStore()

const selectedTenantId = ref<number | null>(null)
const loading = ref(false)
const message = ref('')
const error = ref('')
const units = ref<UnitItem[]>([])
const showBillingModal = ref(false)
const billingTenant = ref<any | null>(null)
const showTenantModal = ref(false)
const editingTenant = ref<any | null>(null)
const showTenantDetailsModal = ref(false)
const detailTenant = ref<any | null>(null)
const detailUnitLabel = ref('-')

const isEditing = computed(() => selectedTenantId.value !== null)

function openCreateTenantModal() {
  selectedTenantId.value = null
  editingTenant.value = null
  showTenantModal.value = true
}

function startEdit(tenant: any) {
  selectedTenantId.value = tenant.id
  editingTenant.value = tenant
  showTenantModal.value = true
}

function closeTenantModal() {
  showTenantModal.value = false
  editingTenant.value = null
  selectedTenantId.value = null
}

function openTenantDetailsModal(tenant: any) {
  detailTenant.value = tenant
  detailUnitLabel.value = unitLabel(tenant.unit_id)
  showTenantDetailsModal.value = true
}

function closeTenantDetailsModal() {
  showTenantDetailsModal.value = false
  detailTenant.value = null
  detailUnitLabel.value = '-'
}

async function submitTenant(payload: {
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
}) {
  loading.value = true
  error.value = ''
  message.value = ''

  const unitNo = String(payload.unit_no ?? '').trim()
  const rentAmountRaw = String(payload.unit_rent_amount ?? '').trim()
  const dueDateRaw = String(payload.due_date ?? '').trim()
  const monthlyFixedPowerRateRaw = String(payload.monthly_fixed_power_rate ?? '').trim()
  const electricInitialRaw = String(payload.initial_electric_sub_meter_reading ?? '').trim()
  const monthlyFixedWaterRateRaw = String(payload.monthly_fixed_water_rate ?? '').trim()
  const waterInitialRaw = String(payload.initial_water_sub_meter_reading ?? '').trim()

  if (payload.is_fixed_power_rate && !monthlyFixedPowerRateRaw) {
    loading.value = false
    error.value = 'Monthly fixed electric rate is required when electric bill is fixed.'
    return
  }

  if (payload.is_fixed_water_rate && !monthlyFixedWaterRateRaw) {
    loading.value = false
    error.value = 'Monthly fixed water rate is required when water bill is fixed.'
    return
  }

  if (!payload.is_fixed_power_rate && !electricInitialRaw) {
    loading.value = false
    error.value = 'Initial electric sub meter reading is required for meter-based electric billing.'
    return
  }

  if (!payload.is_fixed_water_rate && !waterInitialRaw) {
    loading.value = false
    error.value = 'Initial water sub meter reading is required for meter-based water billing.'
    return
  }

  const tenantPayload = {
    name: payload.name,
    address: payload.address,
    contact_no: payload.contact_no,
    unit_id: unitNo ? Number(unitNo) : null,
    unit_rent_amount: rentAmountRaw ? Number(rentAmountRaw) : null,
    due_date: dueDateRaw ? Number(dueDateRaw) : null,
    is_fixed_power_rate: payload.is_fixed_power_rate,
    monthly_fixed_power_rate: payload.is_fixed_power_rate
      ? monthlyFixedPowerRateRaw
        ? Number(monthlyFixedPowerRateRaw)
        : null
      : null,
    initial_electric_sub_meter_reading: payload.is_fixed_power_rate
      ? null
      : electricInitialRaw
        ? Number(electricInitialRaw)
        : null,
    is_fixed_water_rate: payload.is_fixed_water_rate,
    monthly_fixed_water_rate: payload.is_fixed_water_rate
      ? monthlyFixedWaterRateRaw
        ? Number(monthlyFixedWaterRateRaw)
        : null
      : null,
    initial_water_sub_meter_reading: payload.is_fixed_water_rate
      ? null
      : waterInitialRaw
        ? Number(waterInitialRaw)
        : null,
  }

  try {
    if (isEditing.value && selectedTenantId.value) {
      await tenantsStore.updateTenant(selectedTenantId.value, tenantPayload)
      message.value = 'Tenant updated successfully.'
    } else {
      await tenantsStore.createTenant(tenantPayload)
      message.value = 'Tenant created successfully.'
    }
    selectedTenantId.value = null
    closeTenantModal()
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
      selectedTenantId.value = null
      closeTenantModal()
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
    <div class="page-header">
      <h2 class="page-title">Tenants</h2>
      <div class="header-actions">
        <button type="button" class="primary-btn" :disabled="loading" @click="openCreateTenantModal">
          New Tenant
        </button>
      </div>
    </div>

    <p v-if="message" class="status-message">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div class="table-wrap">
      <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Unit no.</th>
          <th>Contact no.</th>
          <th>Monthly rent</th>
          <th>Due date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(tenant, index) in tenantsStore.tenants" :key="tenant.id || index">
          <td data-label="#">{{ index + 1 }}</td>
          <td data-label="Name">
            <RouterLink :to="{ name: 'meter.reading', params: { tenantId: tenant.id } }">
              {{ tenant.name || 'Tenant' }}
            </RouterLink>
          </td>
          <td data-label="Unit no.">{{ unitLabel(tenant.unit_id) }}</td>
          <td data-label="Contact no.">{{ tenant.contact_no || '-' }}</td>
          <td data-label="Monthly rent">{{ formatCurrency(tenant.unit_rent_amount) }}</td>
          <td data-label="Due date">{{ tenant.due_date ? `Day ${tenant.due_date}` : '-' }}</td>
          <td data-label="Actions">
            <div class="row-actions">
              <button type="button" :disabled="loading" @click="openTenantDetailsModal(tenant)">View More</button>
              <button type="button" :disabled="loading" @click="openBillingModal(tenant)">New Billing</button>
              <button type="button" :disabled="loading" @click="startEdit(tenant)">Edit</button>
              <button type="button" :disabled="loading" @click="removeTenant(tenant.id)">Delete</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    </div>

    <BillingModal
      :show="showBillingModal"
      :tenant="billingTenant"
      :loading="loading"
      @close="closeBillingModal"
      @submit="submitBilling"
    />

    <TenantFormModal
      :show="showTenantModal"
      :loading="loading"
      :is-editing="isEditing"
      :tenant="editingTenant"
      :units="units"
      @close="closeTenantModal"
      @submit="submitTenant"
    />

    <TenantDetailsModal
      :show="showTenantDetailsModal"
      :tenant="detailTenant"
      :unit-label="detailUnitLabel"
      @close="closeTenantDetailsModal"
    />
  </section>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-heading);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.primary-btn {
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.25);
}

.status-message {
  margin-bottom: 0.35rem;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border: 1px solid var(--color-accent);
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent-hover);
  font-size: 0.8rem;
  font-weight: 600;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions,
  .primary-btn {
    width: 100%;
  }

  .table-wrap {
    border: none;
    overflow: visible;
  }

  table,
  tbody,
  tr,
  td {
    display: block;
    width: 100%;
  }

  thead {
    display: none;
  }

  tbody tr {
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 0.65rem;
    margin-bottom: 0.65rem;
    background: var(--color-background);
  }

  td {
    border: none;
    border-bottom: 1px dashed var(--color-border);
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  td:last-child {
    border-bottom: none;
  }

  td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--color-heading);
    flex: 0 0 48%;
    text-align: left;
  }

  .row-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
