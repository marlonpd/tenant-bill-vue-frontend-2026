<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TenantJwtService from '@/apis/tenantJwt'
import { TenantPortalService, type TenantPortalBillItem } from '@/apis/services/tenantPortal'

const router = useRouter()

const loading = ref(false)
const error = ref('')
const tenant = ref<any | null>(null)
const billingPeriods = ref<TenantPortalBillItem[]>([])

const latestBill = computed(() => {
  return billingPeriods.value.length > 0 ? billingPeriods.value[0] : null
})

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

async function fetchBillingHistory() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await TenantPortalService.getBillingHistory()
    tenant.value = data?.tenant || null
    billingPeriods.value = data?.billing_periods || []
  } catch (err: any) {
    error.value = err?.response?.data?.error || 'Unable to load billing history.'
    billingPeriods.value = []
  } finally {
    loading.value = false
  }
}

function logoutTenant() {
  TenantJwtService.destroyTenantToken()
  router.push({ name: 'tenant-login' })
}

onMounted(() => {
  fetchBillingHistory()
})
</script>

<template>
  <section class="page-wrap">
    <div class="tenant-header">
      <h2>Tenant Billing History</h2>
      <button type="button" @click="logoutTenant">Sign out</button>
    </div>

    <p v-if="tenant" class="muted">{{ tenant.name }} • {{ tenant.email }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <section v-if="latestBill" class="latest-card">
      <h3>Latest Bill</h3>
      <p><strong>Period:</strong> {{ formatDate(latestBill.from_date) }} - {{ formatDate(latestBill.end_date) }}</p>
      <p><strong>Total:</strong> {{ formatCurrency(latestBill.total_amount) }}</p>
      <p><strong>Status:</strong> {{ latestBill.status }}</p>
      <p><strong>Outstanding:</strong> {{ formatCurrency(latestBill.outstanding_amount) }}</p>
      <p><strong>Due:</strong> {{ formatDate(latestBill.due_date) }}</p>
    </section>

    <p v-if="loading">Loading billing history...</p>
    <p v-else-if="billingPeriods.length === 0">No billing history yet.</p>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Period</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Outstanding</th>
            <th>Status</th>
            <th>Due date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in billingPeriods" :key="item.id">
            <td>{{ formatDate(item.from_date) }} - {{ formatDate(item.end_date) }}</td>
            <td>{{ formatCurrency(item.total_amount) }}</td>
            <td>{{ formatCurrency(item.paid_amount) }}</td>
            <td>{{ formatCurrency(item.outstanding_amount) }}</td>
            <td>{{ item.status }}</td>
            <td>{{ formatDate(item.due_date) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.tenant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.muted {
  color: var(--color-text);
  opacity: 0.8;
  margin-bottom: 0.75rem;
}

.latest-card {
  margin-bottom: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.75rem;
  background: var(--color-background-soft);
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}
</style>
