<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTenantsStore } from '@/store/tenants'
import { UnitsService, type UnitItem } from '@/apis/services/units'

const tenantsStore = useTenantsStore()

const selectedTenantId = ref<number | null>(null)
const loading = ref(false)
const message = ref('')
const error = ref('')
const units = ref<UnitItem[]>([])

const form = ref({
  name: '',
  address: '',
  unit_no: '',
  contact_no: '',
})

const isEditing = computed(() => selectedTenantId.value !== null)

function resetForm() {
  selectedTenantId.value = null
  form.value = {
    name: '',
    address: '',
    unit_no: '',
    contact_no: '',
  }
}

function startEdit(tenant: any) {
  selectedTenantId.value = tenant.id
  form.value = {
    name: tenant.name || '',
    address: tenant.address || '',
    unit_no: tenant.unit_id ? String(tenant.unit_id) : '',
    contact_no: tenant.contact_no || '',
  }
}

async function submitTenant() {
  loading.value = true
  error.value = ''
  message.value = ''

  const unitNo = form.value.unit_no.trim()
  const payload = {
    name: form.value.name,
    address: form.value.address,
    contact_no: form.value.contact_no,
    unit_id: unitNo ? Number(unitNo) : null,
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
    error.value = err?.response?.data?.error || 'Unable to save tenant.'
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
    error.value = err?.response?.data?.error || 'Unable to delete tenant.'
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
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(tenant, index) in tenantsStore.tenants" :key="tenant.id || index">
          <td>{{ index + 1 }}</td>
          <td>
            <RouterLink :to="{ name: 'meter.reading', params: { tenantId: tenant.id } }">
              {{ tenant.name || tenant.tenant_name || 'Tenant' }}
            </RouterLink>
          </td>
          <td>{{ tenant.address || '-' }}</td>
          <td>{{ unitLabel(tenant.unit_id) }}</td>
          <td>{{ tenant.contact_no || '-' }}</td>
          <td class="actions">
            <button type="button" :disabled="loading" @click="startEdit(tenant)">Edit</button>
            <button type="button" :disabled="loading" @click="removeTenant(tenant.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 0.5rem;
}
</style>
