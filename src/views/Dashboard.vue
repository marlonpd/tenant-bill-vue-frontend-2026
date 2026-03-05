<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useTenantsStore } from '@/store/tenants'
import { UnitsService, type UnitItem } from '@/apis/services/units'
import { BillingPeriodsService } from '@/apis/services/billingPeriods'
import type { BillingPeriodItem } from '@/apis/services/billingPeriods'
import { AuditLogsService, type AuditLogItem } from '@/apis/services/auditLogs'
import { NotificationsService, type NotificationItem } from '@/apis/services/notifications'
import { PowerRateService } from '@/apis/services/powerRate'
import { WaterRateService } from '@/apis/services/waterRate'
import BulkBillingModal from '@/components/BulkBillingModal.vue'
import BillingModal from '@/components/BillingModal.vue'
import BillingHistoryModal from '@/components/BillingHistoryModal.vue'
import TenantFormModal from '@/components/TenantFormModal.vue'
import TenantDetailsModal from '@/components/TenantDetailsModal.vue'

const tenantsStore = useTenantsStore()
const authStore = useAuthStore()

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
const currentPowerRate = ref<number | null>(null)
const currentWaterRate = ref<number | null>(null)
const previousElectricReading = ref<number | null>(null)
const previousWaterReading = ref<number | null>(null)
const showBillingHistoryModal = ref(false)
const billingHistoryTenant = ref<any | null>(null)
const billingHistoryItems = ref<BillingPeriodItem[]>([])
const billingHistoryLoading = ref(false)
const showBulkBillingModal = ref(false)
const notifications = ref<NotificationItem[]>([])
const notificationsLoading = ref(false)
const tenantSearch = ref('')
const tenantStatusFilter = ref('')
const auditLogs = ref<AuditLogItem[]>([])
const auditLogsLoading = ref(false)

const isEditing = computed(() => selectedTenantId.value !== null)
const isManager = computed(() => {
  const role = (authStore.user.role || '').toLowerCase()
  return role === 'owner' || role === 'admin'
})

const filteredTenants = computed(() => {
  return tenantsStore.tenants.filter((tenant) => {
    const keyword = tenantSearch.value.trim().toLowerCase()
    const status = tenantStatusFilter.value.trim().toLowerCase()

    const matchesKeyword =
      !keyword ||
      `${tenant.name || ''} ${tenant.address || ''} ${tenant.contact_no || ''}`
        .toLowerCase()
        .includes(keyword)

    const matchesStatus = !status || (tenant.status || '').toLowerCase() === status

    return matchesKeyword && matchesStatus
  })
})

function openCreateTenantModal() {
  selectedTenantId.value = null
  editingTenant.value = null
  showTenantModal.value = true
}

function openBulkBillingModal() {
  showBulkBillingModal.value = true
}

function closeBulkBillingModal() {
  showBulkBillingModal.value = false
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
  start_date: string
  unit_no: string
  contact_no: string
  email: string
  password: string
  unit_rent_amount: string
  due_date: string
  is_fixed_power_rate: boolean
  monthly_fixed_power_rate: string
  initial_electric_sub_meter_reading: string
  is_fixed_water_rate: boolean
  monthly_fixed_water_rate: string
  initial_water_sub_meter_reading: string
}) {
  if (!isManager.value) {
    error.value = 'Only owner/admin can modify tenant records.'
    return
  }

  loading.value = true
  error.value = ''
  message.value = ''

  const unitNo = String(payload.unit_no ?? '').trim()
  const startDateRaw = String(payload.start_date ?? '').trim()
  const emailRaw = String(payload.email ?? '').trim().toLowerCase()
  const passwordRaw = String(payload.password ?? '').trim()
  const rentAmountRaw = String(payload.unit_rent_amount ?? '').trim()
  const dueDateRaw = String(payload.due_date ?? '').trim()
  const monthlyFixedPowerRateRaw = String(payload.monthly_fixed_power_rate ?? '').trim()
  const electricInitialRaw = String(payload.initial_electric_sub_meter_reading ?? '').trim()
  const monthlyFixedWaterRateRaw = String(payload.monthly_fixed_water_rate ?? '').trim()
  const waterInitialRaw = String(payload.initial_water_sub_meter_reading ?? '').trim()

  if (!emailRaw) {
    loading.value = false
    error.value = 'Tenant email is required.'
    return
  }

  if (!isEditing.value && !passwordRaw) {
    loading.value = false
    error.value = 'Tenant password is required.'
    return
  }

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
    start_date: startDateRaw || null,
    contact_no: payload.contact_no,
    email: emailRaw,
    password: passwordRaw || null,
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

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

async function fetchCurrentUtilityRates() {
  try {
    const [powerResponse, waterResponse] = await Promise.all([
      PowerRateService.getAll(),
      WaterRateService.getAll(),
    ])

    const powerRates = powerResponse?.data?.power_rates || []
    const waterRates = waterResponse?.data?.water_rates || []

    currentPowerRate.value = powerRates.length > 0 ? Number(powerRates[0].rate) : null
    currentWaterRate.value = waterRates.length > 0 ? Number(waterRates[0].rate) : null
  } catch {
    currentPowerRate.value = null
    currentWaterRate.value = null
  }
}

async function fetchPreviousReadings(tenantId: number) {
  try {
    const { data } = await BillingPeriodsService.getPreviousReading(tenantId)
    previousElectricReading.value =
      data?.previous_electric_sub_meter_reading !== null &&
      data?.previous_electric_sub_meter_reading !== undefined
        ? Number(data.previous_electric_sub_meter_reading)
        : null
    previousWaterReading.value =
      data?.previous_water_sub_meter_reading !== null &&
      data?.previous_water_sub_meter_reading !== undefined
        ? Number(data.previous_water_sub_meter_reading)
        : null
  } catch {
    previousElectricReading.value = null
    previousWaterReading.value = null
  }
}

async function openBillingModal(tenant: any) {
  await Promise.all([fetchCurrentUtilityRates(), fetchPreviousReadings(tenant.id)])
  billingTenant.value = tenant
  showBillingModal.value = true
}

function closeBillingModal() {
  showBillingModal.value = false
  billingTenant.value = null
  previousElectricReading.value = null
  previousWaterReading.value = null
}

async function openBillingHistoryModal(tenant: any) {
  billingHistoryTenant.value = tenant
  billingHistoryItems.value = []
  showBillingHistoryModal.value = true
  billingHistoryLoading.value = true

  try {
    const { data } = await BillingPeriodsService.getHistory()
    billingHistoryItems.value = data?.billing_periods || []
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      err?.response?.data?.msg ||
      err?.message ||
      'Unable to load billing history.'
    billingHistoryItems.value = []
  } finally {
    billingHistoryLoading.value = false
  }
}

async function submitBulkBilling(payload: { from_date: string; end_date: string; notes: string | null }) {
  if (!isManager.value) {
    error.value = 'Only owner/admin can run bulk billing.'
    return
  }

  loading.value = true
  error.value = ''
  message.value = ''
  try {
    const { data } = await BillingPeriodsService.bulkGenerate(payload)
    message.value = `Bulk billing done. Created: ${data?.created_count || 0}, Skipped: ${data?.skipped_count || 0}`
    showBulkBillingModal.value = false
    await refreshBillingHistory()
    await refreshNotifications()
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      err?.response?.data?.msg ||
      err?.message ||
      'Unable to generate bulk billing.'
  } finally {
    loading.value = false
  }
}

async function refreshOverdueStatuses() {
  if (!isManager.value) {
    error.value = 'Only owner/admin can refresh overdue statuses.'
    return
  }

  loading.value = true
  error.value = ''
  message.value = ''
  try {
    const { data } = await BillingPeriodsService.refreshOverdue({ late_fee_rate: 0.02 })
    message.value = `Overdue refresh complete. Updated: ${data?.updated_count || 0}`
    await refreshBillingHistory()
    await refreshNotifications()
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      err?.response?.data?.msg ||
      err?.message ||
      'Unable to refresh overdue statuses.'
  } finally {
    loading.value = false
  }
}

async function refreshNotifications() {
  notificationsLoading.value = true
  try {
    const { data } = await NotificationsService.getAll({ unread_only: true })
    notifications.value = data?.notifications || []
  } catch {
    notifications.value = []
  } finally {
    notificationsLoading.value = false
  }
}

async function markNotificationRead(notificationId: number) {
  try {
    await NotificationsService.markAsRead(notificationId)
    await refreshNotifications()
  } catch {
    // no-op
  }
}

async function refreshBillingHistory() {
  if (!billingHistoryTenant.value) return
  billingHistoryLoading.value = true
  try {
    const { data } = await BillingPeriodsService.getHistory()
    billingHistoryItems.value = data?.billing_periods || []
  } catch {
    billingHistoryItems.value = []
  } finally {
    billingHistoryLoading.value = false
  }
}

function closeBillingHistoryModal() {
  showBillingHistoryModal.value = false
  billingHistoryTenant.value = null
  billingHistoryItems.value = []
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
  if (!isManager.value) {
    error.value = 'Only owner/admin can delete tenants.'
    return
  }

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

async function refreshAuditLogs() {
  if (!isManager.value) {
    auditLogs.value = []
    return
  }

  auditLogsLoading.value = true
  try {
    const { data } = await AuditLogsService.getAll({ limit: 15 })
    auditLogs.value = data?.audit_logs || []
  } catch {
    auditLogs.value = []
  } finally {
    auditLogsLoading.value = false
  }
}

onMounted(() => {
  authStore.fetchMe().catch(() => undefined)
  tenantsStore.fetchTenants()
  fetchUnits()
  fetchCurrentUtilityRates()
  refreshNotifications()
  refreshAuditLogs()
})
</script>

<template>
  <section class="page-wrap">
    <div class="page-header">
      <h2 class="page-title">Tenants</h2>
      <div class="header-actions">
        <button v-if="isManager" type="button" :disabled="loading" @click="openBulkBillingModal">Bulk Generate Bills</button>
        <button v-if="isManager" type="button" :disabled="loading" @click="refreshOverdueStatuses">Refresh Overdue</button>
        <button v-if="isManager" type="button" class="primary-btn" :disabled="loading" @click="openCreateTenantModal">
          New Tenant
        </button>
      </div>
    </div>

    <p v-if="message" class="status-message">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <section class="filter-panel">
      <input v-model="tenantSearch" type="text" placeholder="Search tenants" />
      <select v-model="tenantStatusFilter">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
    </section>

    <section class="notifications-panel">
      <div class="panel-header">
        <h3>Reminders</h3>
        <button type="button" :disabled="notificationsLoading" @click="refreshNotifications">Refresh</button>
      </div>
      <p v-if="notificationsLoading">Loading reminders...</p>
      <p v-else-if="notifications.length === 0">No unread reminders.</p>
      <ul v-else>
        <li v-for="item in notifications" :key="item.id">
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.message }}</p>
          </div>
          <button type="button" @click="markNotificationRead(item.id)">Mark Read</button>
        </li>
      </ul>
    </section>

    <section v-if="isManager" class="notifications-panel">
      <div class="panel-header">
        <h3>Recent Audit Logs</h3>
        <button type="button" :disabled="auditLogsLoading" @click="refreshAuditLogs">Refresh</button>
      </div>
      <p v-if="auditLogsLoading">Loading audit logs...</p>
      <p v-else-if="auditLogs.length === 0">No audit logs yet.</p>
      <ul v-else>
        <li v-for="log in auditLogs" :key="log.id">
          <div>
            <strong>{{ log.action }} • {{ log.entity_type }}</strong>
            <p>{{ log.details || '-' }}</p>
          </div>
          <small>{{ formatDate(log.created_at) }}</small>
        </li>
      </ul>
    </section>

    <div class="table-wrap">
      <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Unit no.</th>
          <th>Contact no.</th>
          <th>Start date</th>
          <th>Monthly rent</th>
          <th>Due date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(tenant, index) in filteredTenants" :key="tenant.id || index">
          <td data-label="#">{{ index + 1 }}</td>
          <td data-label="Name">
            <RouterLink :to="{ name: 'meter.reading', params: { tenantId: tenant.id } }">
              {{ tenant.name || 'Tenant' }}
            </RouterLink>
          </td>
          <td data-label="Unit no.">{{ unitLabel(tenant.unit_id) }}</td>
          <td data-label="Contact no.">{{ tenant.contact_no || '-' }}</td>
          <td data-label="Start date">{{ formatDate(tenant.start_date) }}</td>
          <td data-label="Monthly rent">{{ formatCurrency(tenant.unit_rent_amount) }}</td>
          <td data-label="Due date">{{ tenant.due_date ? `Day ${tenant.due_date}` : '-' }}</td>
          <td data-label="Actions">
            <div class="row-actions">
              <button
                type="button"
                class="action-btn"
                :disabled="loading"
                @click="openTenantDetailsModal(tenant)"
              >
                View More
              </button>
              <button
                type="button"
                class="action-btn action-btn--primary"
                :disabled="loading"
                @click="openBillingModal(tenant)"
              >
                New Billing
              </button>
              <button
                type="button"
                class="action-btn"
                :disabled="loading"
                @click="openBillingHistoryModal(tenant)"
              >
                Billing History
              </button>
              <button
                v-if="isManager"
                type="button"
                class="action-btn"
                :disabled="loading"
                @click="startEdit(tenant)"
              >
                Edit
              </button>
              <button
                v-if="isManager"
                type="button"
                class="action-btn action-btn--danger"
                :disabled="loading"
                @click="removeTenant(tenant.id)"
              >
                Delete
              </button>
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
      :current-power-rate="currentPowerRate"
      :current-water-rate="currentWaterRate"
      :previous-electric-reading="previousElectricReading"
      :previous-water-reading="previousWaterReading"
      @close="closeBillingModal"
      @submit="submitBilling"
    />

    <BulkBillingModal
      :show="showBulkBillingModal"
      :loading="loading"
      @close="closeBulkBillingModal"
      @submit="submitBulkBilling"
    />

    <BillingHistoryModal
      :show="showBillingHistoryModal"
      :loading="billingHistoryLoading"
      :tenant="billingHistoryTenant"
      :billing-periods="billingHistoryItems"
      @close="closeBillingHistoryModal"
      @refresh-history="refreshBillingHistory"
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

.filter-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.notifications-panel {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
}

.notifications-panel ul {
  display: grid;
  gap: 0.4rem;
}

.notifications-panel li {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.5rem;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
}

.notifications-panel li p {
  margin-top: 0.2rem;
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

.action-btn {
  min-height: 34px;
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 0.8rem;
  font-weight: 600;
}

.action-btn:hover:not(:disabled) {
  background: var(--color-accent-soft);
  color: var(--color-accent-hover);
}

.action-btn--primary {
  background: var(--color-accent);
  color: var(--vt-c-white);
  border-color: var(--color-accent);
}

.action-btn--primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  color: var(--vt-c-white);
}

.action-btn--danger {
  border-style: dashed;
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
    justify-content: flex-start;
  }
}
</style>
