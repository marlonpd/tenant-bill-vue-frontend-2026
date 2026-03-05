<script setup lang="ts">
import { ref, watch } from 'vue'

type BillLike = {
  id: number
  total_amount?: number | null
  paid_amount?: number | null
  outstanding_amount?: number | null
}

type PaymentSubmitPayload = {
  billing_period_id: number
  amount: number
  payment_date: string
  payment_method: string | null
  reference_no: string | null
  notes: string | null
}

const props = defineProps<{
  show: boolean
  loading: boolean
  bill: BillLike | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: PaymentSubmitPayload): void
}>()

const amount = ref('')
const paymentDate = ref(new Date().toISOString().slice(0, 10))
const paymentMethod = ref('cash')
const referenceNo = ref('')
const notes = ref('')

watch(
  () => [props.show, props.bill?.id],
  () => {
    if (!props.show || !props.bill) return
    amount.value = String(props.bill.outstanding_amount ?? props.bill.total_amount ?? '')
    paymentDate.value = new Date().toISOString().slice(0, 10)
    paymentMethod.value = 'cash'
    referenceNo.value = ''
    notes.value = ''
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
  if (!props.bill) return

  emit('submit', {
    billing_period_id: props.bill.id,
    amount: Number(amount.value || 0),
    payment_date: paymentDate.value,
    payment_method: paymentMethod.value || null,
    reference_no: referenceNo.value || null,
    notes: notes.value || null,
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="payment-overlay" @click.self="emit('close')">
      <div class="payment-card">
        <div class="modal-header">
          <h3>Record Payment</h3>
          <button type="button" class="ghost-btn" :disabled="loading" @click="emit('close')">Close</button>
        </div>

        <div class="meta">
          <p><strong>Bill No:</strong> #{{ bill?.id || '-' }}</p>
          <p><strong>Total:</strong> {{ formatCurrency(bill?.total_amount) }}</p>
          <p><strong>Paid:</strong> {{ formatCurrency(bill?.paid_amount) }}</p>
          <p><strong>Outstanding:</strong> {{ formatCurrency(bill?.outstanding_amount) }}</p>
        </div>

        <form @submit.prevent="submit">
          <input v-model="amount" type="number" min="0.01" step="0.01" placeholder="Payment amount" required />
          <input v-model="paymentDate" type="date" required />
          <select v-model="paymentMethod">
            <option value="cash">Cash</option>
            <option value="gcash">GCash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="other">Other</option>
          </select>
          <input v-model="referenceNo" type="text" placeholder="Reference no. (optional)" />
          <input v-model="notes" type="text" placeholder="Notes (optional)" />

          <div class="actions">
            <button type="submit" :disabled="loading">Save Payment</button>
            <button type="button" class="ghost-btn" :disabled="loading" @click="emit('close')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.payment-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 10000;
  background-color: var(--vt-c-divider-dark-1);
}

.payment-card {
  width: 100%;
  max-width: 520px;
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
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-accent-hover);
}

.meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem 0.8rem;
  margin-bottom: 0.8rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.35rem;
}

.ghost-btn {
  background: var(--color-background-soft);
  color: var(--color-accent);
  border-color: var(--color-accent-soft);
}
</style>
