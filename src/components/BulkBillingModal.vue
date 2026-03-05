<script setup lang="ts">
import { ref, watch } from 'vue'

type BulkPayload = {
  from_date: string
  end_date: string
  notes: string | null
}

const props = defineProps<{
  show: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: BulkPayload): void
}>()

const fromDate = ref('')
const endDate = ref('')
const notes = ref('')

watch(
  () => props.show,
  (visible) => {
    if (!visible) return
    const today = new Date()
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    fromDate.value = first.toISOString().slice(0, 10)
    endDate.value = last.toISOString().slice(0, 10)
    notes.value = ''
  },
  { immediate: true },
)

function submit() {
  emit('submit', {
    from_date: fromDate.value,
    end_date: endDate.value,
    notes: notes.value || null,
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="bulk-overlay" @click.self="emit('close')">
      <div class="bulk-card">
        <div class="modal-header">
          <h3>Bulk Generate Bills</h3>
          <button type="button" class="ghost-btn" :disabled="loading" @click="emit('close')">Close</button>
        </div>

        <p class="helper">Generates monthly bills for active tenants. Meter-based tenants without readings will be skipped.</p>

        <form @submit.prevent="submit">
          <label>
            <span>From Date</span>
            <input v-model="fromDate" type="date" required />
          </label>
          <label>
            <span>End Date</span>
            <input v-model="endDate" type="date" required />
          </label>
          <label>
            <span>Notes</span>
            <input v-model="notes" type="text" placeholder="Optional note for generated bills" />
          </label>

          <div class="actions">
            <button type="submit" :disabled="loading">Generate</button>
            <button type="button" class="ghost-btn" :disabled="loading" @click="emit('close')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.bulk-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 10000;
  background-color: var(--vt-c-divider-dark-1);
}

.bulk-card {
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

.helper {
  margin-bottom: 0.7rem;
  opacity: 0.85;
}

label {
  display: grid;
  gap: 0.3rem;
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
