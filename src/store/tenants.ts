import { ref } from 'vue'
import { defineStore } from 'pinia'
import { TenantsService, type TenantItem, type TenantPayload } from '@/apis/services/tenants'

export const useTenantsStore = defineStore('tenants', () => {
  const tenants = ref<TenantItem[]>([])

  async function fetchTenants() {
    const { data } = await TenantsService.getAll()
    tenants.value = data.tenants || data || []
  }

  async function createTenant(payload: TenantPayload) {
    await TenantsService.create(payload)
    await fetchTenants()
  }

  async function updateTenant(id: number, payload: TenantPayload) {
    await TenantsService.update(id, payload)
    await fetchTenants()
  }

  async function deleteTenant(id: number) {
    await TenantsService.destroy(id)
    await fetchTenants()
  }

  return { tenants, fetchTenants, createTenant, updateTenant, deleteTenant }
})
