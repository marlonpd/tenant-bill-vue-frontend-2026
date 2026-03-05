<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { HealthService } from '@/apis/services/health'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const message = ref('')
const lineCount = ref(200)
const entries = ref<string[]>([])

const isManager = computed(() => {
  const role = (authStore.user.role || '').toLowerCase()
  return role === 'owner' || role === 'admin'
})

async function loadLogs() {
  if (!isManager.value) {
    error.value = 'Only owner/admin can view backend error logs.'
    entries.value = []
    return
  }

  loading.value = true
  error.value = ''
  message.value = ''

  try {
    const { data } = await HealthService.getErrors(lineCount.value)
    entries.value = data?.entries || []
    message.value = `Loaded ${data?.count || 0} log entries.`
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      err?.response?.data?.msg ||
      err?.message ||
      'Unable to load backend error logs.'
    entries.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await authStore.fetchMe()
  await loadLogs()
})
</script>

<template>
  <section class="page-wrap error-logs-page">
    <h2>Backend Error Logs</h2>
    <p class="subtitle">Owner/Admin only view for `/api/health/errors`.</p>

    <p v-if="message" class="status-message">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div class="toolbar">
      <input v-model.number="lineCount" type="number" min="1" max="500" step="1" placeholder="Lines" />
      <button type="button" :disabled="loading" @click="loadLogs">
        {{ loading ? 'Loading...' : 'Refresh Logs' }}
      </button>
    </div>

    <pre v-if="entries.length" class="log-box">{{ entries.join('\n') }}</pre>
    <p v-else-if="!loading">No error log entries found.</p>
  </section>
</template>

<style scoped>
.error-logs-page {
  display: grid;
  gap: 0.7rem;
}

.subtitle {
  color: var(--color-text);
  opacity: 0.85;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.toolbar input {
  max-width: 130px;
}

.log-box {
  margin-top: 0.4rem;
  max-height: 65vh;
  overflow: auto;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
  font-size: 0.82rem;
  line-height: 1.45;
  white-space: pre-wrap;
}
</style>
