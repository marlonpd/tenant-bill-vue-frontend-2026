<script setup lang="ts">
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

const props = defineProps<{
  show: boolean
  tenant: TenantLike | null
  unitLabel: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="tenant-details-overlay" @click.self="emit('close')">
      <div class="tenant-details-card">
        <div class="modal-header">
          <h3>Tenant Details</h3>
          <button type="button" class="ghost-btn" @click="emit('close')">Close</button>
        </div>

        <div class="details-grid">
          <div class="detail-item"><span class="label">Name</span><span>{{ tenant?.name || '-' }}</span></div>
          <div class="detail-item"><span class="label">Address</span><span>{{ tenant?.address || '-' }}</span></div>
          <div class="detail-item"><span class="label">Unit no.</span><span>{{ unitLabel }}</span></div>
          <div class="detail-item"><span class="label">Contact no.</span><span>{{ tenant?.contact_no || '-' }}</span></div>
          <div class="detail-item"><span class="label">Monthly rent</span><span>{{ formatCurrency(tenant?.unit_rent_amount) }}</span></div>
          <div class="detail-item"><span class="label">Due date</span><span>{{ tenant?.due_date ? `Day ${tenant?.due_date}` : '-' }}</span></div>

          <div class="detail-item"><span class="label">Electric billing</span><span>{{ tenant?.is_fixed_power_rate ? 'Fixed' : 'Meter-based' }}</span></div>
          <div class="detail-item"><span class="label">Monthly fixed electric rate</span><span>{{ formatCurrency(tenant?.monthly_fixed_power_rate) }}</span></div>
          <div class="detail-item"><span class="label">Initial electric reading</span><span>{{ tenant?.initial_electric_sub_meter_reading ?? '-' }}</span></div>

          <div class="detail-item"><span class="label">Water billing</span><span>{{ tenant?.is_fixed_water_rate ? 'Fixed' : 'Meter-based' }}</span></div>
          <div class="detail-item"><span class="label">Monthly fixed water rate</span><span>{{ formatCurrency(tenant?.monthly_fixed_water_rate) }}</span></div>
          <div class="detail-item"><span class="label">Initial water reading</span><span>{{ tenant?.initial_water_sub_meter_reading ?? '-' }}</span></div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.tenant-details-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 9999;
  background-color: var(--vt-c-divider-dark-1);
}

.tenant-details-card {
  width: 100%;
  max-width: 720px;
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

.details-grid {
  display: grid;
  gap: 0.55rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.45rem 0;
  border-bottom: 1px dashed var(--color-border);
}

.detail-item .label {
  font-weight: 600;
  color: var(--color-heading);
}

@media (max-width: 700px) {
  .tenant-details-overlay {
    padding: 0.5rem;
    align-items: flex-end;
  }

  .tenant-details-card {
    max-height: 94vh;
    border-radius: 12px 12px 0 0;
    padding: 0.85rem;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
  }
}
</style>
