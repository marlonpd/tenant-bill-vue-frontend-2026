<script setup lang="ts">
import type { BillingPeriodItem } from '@/apis/services/billingPeriods'
import { PaymentsService } from '@/apis/services/payments'
import PaymentModal from '@/components/PaymentModal.vue'
import { computed, ref } from 'vue'

type TenantLike = {
  id?: number
  name?: string
  address?: string
  contact_no?: string
  unit_rent_amount?: number | null
  due_date?: number | null
}

const props = defineProps<{
  show: boolean
  loading: boolean
  tenant: TenantLike | null
  billingPeriods: BillingPeriodItem[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh-history'): void
}>()

const showPaymentModal = ref(false)
const paymentLoading = ref(false)
const selectedBill = ref<BillingPeriodItem | null>(null)
const actionError = ref('')
const searchText = ref('')
const statusFilter = ref('')
const fromDateFilter = ref('')
const toDateFilter = ref('')

const filteredBillingPeriods = computed(() => {
  return props.billingPeriods.filter((bill) => {
    const matchesSearch =
      !searchText.value ||
      `${bill.tenant_name || ''} ${bill.tenant_address || ''}`.toLowerCase().includes(searchText.value.toLowerCase())

    const matchesStatus = !statusFilter.value || bill.status === statusFilter.value

    const billEndDate = bill.end_date ? new Date(bill.end_date) : null
    const matchesFrom = !fromDateFilter.value || (billEndDate && billEndDate >= new Date(fromDateFilter.value))
    const matchesTo = !toDateFilter.value || (billEndDate && billEndDate <= new Date(toDateFilter.value))

    return matchesSearch && matchesStatus && matchesFrom && matchesTo
  })
})

const totalBilled = computed(() =>
  filteredBillingPeriods.value.reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0),
)

const totalPaid = computed(() =>
  filteredBillingPeriods.value.reduce((sum, bill) => sum + Number(bill.paid_amount || 0), 0),
)

const totalOutstanding = computed(() => totalBilled.value - totalPaid.value)

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

function formatNumber(value: number | null | undefined, decimals = 2) {
  if (value === null || value === undefined) return '-'
  return Number(value).toFixed(decimals)
}

function printBill(bill: BillingPeriodItem) {
  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (!printWindow) return

  const tenantName = bill.tenant_name || props.tenant?.name || '-'
  const tenantAddress = bill.tenant_address || props.tenant?.address || '-'
  const tenantContact = bill.tenant_contact_no || props.tenant?.contact_no || '-'

  printWindow.document.write(`
    <html>
      <head>
        <title>Bill #${bill.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
          .header { display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid #d1d5db; padding-bottom: 10px; }
          .title { font-size: 20px; font-weight: 700; margin: 0; }
          .subtitle { margin: 2px 0 0; color: #4b5563; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
          .box { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; }
          .box p { margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background: #f3f4f6; }
          .total-row td { font-weight: 700; }
          .notes { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #9ca3af; }
          @media print { body { margin: 12px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <p class="title">RentHQ</p>
            <p class="subtitle">Official Billing Statement</p>
          </div>
          <div>
            <p><strong>Bill No:</strong> #${bill.id}</p>
            <p><strong>Issued:</strong> ${formatDate(bill.created_at)}</p>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <p><strong>Bill To:</strong> ${tenantName}</p>
            <p><strong>Address:</strong> ${tenantAddress}</p>
            <p><strong>Contact:</strong> ${tenantContact}</p>
          </div>
          <div class="box">
            <p><strong>Billing Period:</strong> ${formatDate(bill.from_date)} - ${formatDate(bill.end_date)}</p>
            <p><strong>Issued:</strong> ${formatDate(bill.created_at)}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr><th>Description</th><th>Amount</th></tr>
          </thead>
          <tbody>
            <tr><td>House Rent</td><td>${formatCurrency(bill.monthly_rent_amount)}</td></tr>
            <tr><td>Electric Bill</td><td>${formatCurrency(bill.electric_charge_amount)}</td></tr>
            <tr><td>Water Bill</td><td>${formatCurrency(bill.water_charge_amount)}</td></tr>
            <tr class="total-row"><td>Total Amount</td><td>${formatCurrency(bill.total_amount)}</td></tr>
          </tbody>
        </table>

        <div class="grid">
          <div class="box">
            <p><strong>Electric Previous:</strong> ${formatNumber(bill.previous_electric_sub_meter_reading)}</p>
            <p><strong>Electric Current:</strong> ${formatNumber(bill.current_electric_sub_meter_reading)}</p>
            <p><strong>Used kWh:</strong> ${formatNumber(bill.used_electric_kwh)}</p>
            <p><strong>Rate/kWh:</strong> ${formatNumber(bill.electric_rate_per_kwh, 4)}</p>
          </div>
          <div class="box">
            <p><strong>Water Previous:</strong> ${formatNumber(bill.previous_water_sub_meter_reading)}</p>
            <p><strong>Water Current:</strong> ${formatNumber(bill.current_water_sub_meter_reading)}</p>
            <p><strong>Used m³:</strong> ${formatNumber(bill.used_water_cubic_meter)}</p>
            <p><strong>Rate/m³:</strong> ${formatNumber(bill.water_rate_per_cubic_meter, 4)}</p>
          </div>
        </div>

        ${bill.notes ? `<p class="notes"><strong>Notes:</strong> ${bill.notes}</p>` : ''}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}

function statusLabel(status: string | null | undefined) {
  if (!status) return 'Issued'
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())
}

function statusClass(status: string | null | undefined) {
  if (status === 'paid') return 'status-paid'
  if (status === 'partially_paid') return 'status-partial'
  if (status === 'overdue') return 'status-overdue'
  return 'status-issued'
}

function openPaymentModal(bill: BillingPeriodItem) {
  actionError.value = ''
  selectedBill.value = bill
  showPaymentModal.value = true
}

function closePaymentModal() {
  showPaymentModal.value = false
  selectedBill.value = null
}

async function submitPayment(payload: {
  billing_period_id: number
  amount: number
  payment_date: string
  payment_method: string | null
  reference_no: string | null
  notes: string | null
}) {
  paymentLoading.value = true
  actionError.value = ''
  try {
    await PaymentsService.create(payload)
    closePaymentModal()
    emit('refresh-history')
  } catch (error: any) {
    actionError.value =
      error?.response?.data?.error ||
      error?.response?.data?.msg ||
      error?.message ||
      'Unable to record payment.'
  } finally {
    paymentLoading.value = false
  }
}

function printReceipt(bill: BillingPeriodItem, payment: BillingPeriodItem['payments'][number]) {
  const printWindow = window.open('', '_blank', 'width=820,height=700')
  if (!printWindow) return

  const tenantName = bill.tenant_name || props.tenant?.name || '-'
  const tenantAddress = bill.tenant_address || props.tenant?.address || '-'

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt #${payment.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
          .header { display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid #d1d5db; padding-bottom: 10px; }
          .title { font-size: 20px; font-weight: 700; margin: 0; }
          .box { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; margin-bottom: 12px; }
          .box p { margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <p class="title">RentHQ</p>
            <p>Official Payment Receipt</p>
          </div>
          <div>
            <p><strong>Receipt No:</strong> #${payment.id}</p>
            <p><strong>Date:</strong> ${formatDate(payment.payment_date)}</p>
          </div>
        </div>
        <div class="box">
          <p><strong>Received From:</strong> ${tenantName}</p>
          <p><strong>Address:</strong> ${tenantAddress}</p>
          <p><strong>For Bill No:</strong> #${bill.id}</p>
          <p><strong>Billing Period:</strong> ${formatDate(bill.from_date)} - ${formatDate(bill.end_date)}</p>
        </div>
        <table>
          <thead><tr><th>Description</th><th>Details</th></tr></thead>
          <tbody>
            <tr><td>Amount Received</td><td>${formatCurrency(payment.amount)}</td></tr>
            <tr><td>Payment Method</td><td>${payment.payment_method || '-'}</td></tr>
            <tr><td>Reference No.</td><td>${payment.reference_no || '-'}</td></tr>
            <tr><td>Notes</td><td>${payment.notes || '-'}</td></tr>
          </tbody>
        </table>
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}

function exportCsv() {
  const header = [
    'bill_id', 'tenant_name', 'from_date', 'end_date', 'due_date', 'status',
    'monthly_rent_amount', 'electric_charge_amount', 'water_charge_amount',
    'late_fee_amount', 'total_amount', 'paid_amount', 'outstanding_amount',
  ]

  const rows = filteredBillingPeriods.value.map((bill) => [
    bill.id,
    bill.tenant_name || '',
    bill.from_date || '',
    bill.end_date || '',
    bill.due_date || '',
    bill.status || '',
    bill.monthly_rent_amount || 0,
    bill.electric_charge_amount || 0,
    bill.water_charge_amount || 0,
    bill.late_fee_amount || 0,
    bill.total_amount || 0,
    bill.paid_amount || 0,
    bill.outstanding_amount || 0,
  ])

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'billing_history_filtered.csv'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="history-overlay" @click.self="emit('close')">
      <div class="history-card">
        <div class="modal-header">
          <h3>Billing History</h3>
          <button type="button" class="ghost-btn" @click="emit('close')">Close</button>
        </div>

        <div class="tenant-meta">
          <p><strong>Tenant Filter:</strong> {{ tenant?.name || 'All Tenants' }}</p>
          <p><strong>Total Bills:</strong> {{ filteredBillingPeriods.length }}</p>
          <p><strong>Total Billed:</strong> {{ formatCurrency(totalBilled) }}</p>
          <p><strong>Total Paid:</strong> {{ formatCurrency(totalPaid) }}</p>
          <p><strong>Outstanding:</strong> {{ formatCurrency(totalOutstanding) }}</p>
          <p><strong>Generated:</strong> {{ formatDate(new Date().toISOString()) }}</p>
        </div>

        <div class="filters-row">
          <input v-model="searchText" type="text" placeholder="Search tenant/address" />
          <select v-model="statusFilter">
            <option value="">All Status</option>
            <option value="issued">Issued</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <input v-model="fromDateFilter" type="date" />
          <input v-model="toDateFilter" type="date" />
          <button type="button" class="print-btn" @click="exportCsv">Export CSV</button>
        </div>

        <p v-if="actionError" class="error">{{ actionError }}</p>

        <p v-if="loading">Loading billing history...</p>
        <p v-else-if="filteredBillingPeriods.length === 0">No billing history found.</p>

        <div v-else class="bills-wrap">
          <article v-for="bill in filteredBillingPeriods" :key="bill.id" class="bill-paper">
            <header class="bill-header">
              <div>
                <h4>RentHQ</h4>
                <p>Official Billing Statement</p>
                <p><strong>Tenant:</strong> {{ bill.tenant_name || tenant?.name || '-' }}</p>
              </div>
              <div class="bill-meta-right">
                <p><strong>Bill No:</strong> #{{ bill.id }}</p>
                <p><strong>Issued:</strong> {{ formatDate(bill.created_at) }}</p>
                <p>
                  <strong>Status:</strong>
                  <span class="status-pill" :class="statusClass(bill.status)">{{ statusLabel(bill.status) }}</span>
                </p>
                <button type="button" class="print-btn" @click="printBill(bill)">Print Bill</button>
                <button
                  type="button"
                  class="print-btn"
                  :disabled="Number(bill.outstanding_amount || 0) <= 0"
                  @click="openPaymentModal(bill)"
                >
                  Record Payment
                </button>
              </div>
            </header>

            <section class="bill-row two-col">
              <div>
                <p><strong>Bill To:</strong> {{ bill.tenant_name || tenant?.name || '-' }}</p>
                <p><strong>Address:</strong> {{ bill.tenant_address || tenant?.address || '-' }}</p>
                <p><strong>Due Date:</strong> {{ formatDate(bill.due_date) }}</p>
              </div>
              <div>
                <p><strong>Billing Period:</strong> {{ formatDate(bill.from_date) }} - {{ formatDate(bill.end_date) }}</p>
                <p><strong>Contact:</strong> {{ bill.tenant_contact_no || tenant?.contact_no || '-' }}</p>
              </div>
            </section>

            <section class="charges-table">
              <div class="row header">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div class="row">
                <span>House Rent</span>
                <span>{{ formatCurrency(bill.monthly_rent_amount) }}</span>
              </div>
              <div class="row">
                <span>Electric Bill</span>
                <span>{{ formatCurrency(bill.electric_charge_amount) }}</span>
              </div>
              <div class="row">
                <span>Water Bill</span>
                <span>{{ formatCurrency(bill.water_charge_amount) }}</span>
              </div>
              <div class="row" v-if="Number(bill.late_fee_amount || 0) > 0">
                <span>Late Fee</span>
                <span>{{ formatCurrency(bill.late_fee_amount) }}</span>
              </div>
              <div class="row total">
                <span>Total Amount</span>
                <span>{{ formatCurrency(bill.total_amount) }}</span>
              </div>
              <div class="row">
                <span>Paid Amount</span>
                <span>{{ formatCurrency(bill.paid_amount) }}</span>
              </div>
              <div class="row total">
                <span>Outstanding Balance</span>
                <span>{{ formatCurrency(bill.outstanding_amount) }}</span>
              </div>
            </section>

            <section class="bill-row two-col meter-section">
              <div>
                <h5>Electric Meter</h5>
                <p><strong>Prev:</strong> {{ formatNumber(bill.previous_electric_sub_meter_reading) }}</p>
                <p><strong>Current:</strong> {{ formatNumber(bill.current_electric_sub_meter_reading) }}</p>
                <p><strong>Used kWh:</strong> {{ formatNumber(bill.used_electric_kwh) }}</p>
                <p><strong>Rate/kWh:</strong> {{ formatNumber(bill.electric_rate_per_kwh, 4) }}</p>
              </div>
              <div>
                <h5>Water Meter</h5>
                <p><strong>Prev:</strong> {{ formatNumber(bill.previous_water_sub_meter_reading) }}</p>
                <p><strong>Current:</strong> {{ formatNumber(bill.current_water_sub_meter_reading) }}</p>
                <p><strong>Used m³:</strong> {{ formatNumber(bill.used_water_cubic_meter) }}</p>
                <p><strong>Rate/m³:</strong> {{ formatNumber(bill.water_rate_per_cubic_meter, 4) }}</p>
              </div>
            </section>

            <p v-if="bill.notes" class="notes"><strong>Notes:</strong> {{ bill.notes }}</p>

            <section class="payments-section" v-if="bill.payments && bill.payments.length > 0">
              <h5>Payments</h5>
              <div class="payment-item" v-for="payment in bill.payments" :key="payment.id">
                <span>#{{ payment.id }} • {{ formatDate(payment.payment_date) }} • {{ formatCurrency(payment.amount) }}</span>
                <button type="button" class="print-btn" @click="printReceipt(bill, payment)">Print Receipt</button>
              </div>
            </section>
          </article>
        </div>

        <PaymentModal
          :show="showPaymentModal"
          :loading="paymentLoading"
          :bill="selectedBill"
          @close="closePaymentModal"
          @submit="submitPayment"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.history-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 9999;
  background-color: var(--vt-c-divider-dark-1);
}

.history-card {
  width: 100%;
  max-width: 980px;
  max-height: 92vh;
  overflow: auto;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background);
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

.tenant-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.45rem 1rem;
  margin-bottom: 0.9rem;
  padding: 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.bills-wrap {
  display: grid;
  gap: 1rem;
}

.bill-paper {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.9rem;
  background: var(--color-background-soft);
}

.bill-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: 0.6rem;
  margin-bottom: 0.7rem;
  border-bottom: 2px solid var(--color-border);
}

.bill-header h4 {
  font-size: 1rem;
  font-weight: 700;
}

.bill-header p {
  opacity: 0.85;
}

.bill-meta-right {
  text-align: right;
}

.print-btn {
  margin-top: 0.35rem;
}

.status-pill {
  display: inline-block;
  margin-left: 0.35rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid var(--color-border);
}

.status-issued {
  background: var(--color-background-soft);
}

.status-partial {
  background: var(--color-accent-soft);
}

.status-paid {
  background: var(--color-accent-soft);
  color: var(--color-accent-hover);
}

.status-overdue {
  background: var(--color-background-soft);
  color: var(--color-heading);
}

.bill-row.two-col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.charges-table {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.8rem;
}

.charges-table .row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  padding: 0.5rem 0.6rem;
  border-bottom: 1px dashed var(--color-border);
}

.charges-table .row.header {
  font-weight: 700;
  background: var(--color-accent-soft);
  border-bottom: 1px solid var(--color-border);
}

.charges-table .row.total {
  font-weight: 700;
  border-bottom: none;
  background: var(--color-background);
}

.meter-section h5 {
  margin-bottom: 0.3rem;
}

.notes {
  margin-top: 0.5rem;
  border-top: 1px dashed var(--color-border);
  padding-top: 0.5rem;
}

.payments-section {
  margin-top: 0.6rem;
  border-top: 1px dashed var(--color-border);
  padding-top: 0.5rem;
}

.payments-section h5 {
  margin-bottom: 0.35rem;
}

.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.35rem 0;
}

.error {
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

@media (max-width: 700px) {
  .history-overlay {
    padding: 0.5rem;
    align-items: flex-end;
  }

  .history-card {
    max-height: 94vh;
    border-radius: 12px 12px 0 0;
    padding: 0.85rem;
  }

  .bill-meta-right {
    text-align: left;
  }

  .bill-header {
    flex-direction: column;
  }
}
</style>
