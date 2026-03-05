const TENANT_TOKEN_KEY = 'tenant_token'

export const getTenantToken = () => window.localStorage.getItem(TENANT_TOKEN_KEY)

export const saveTenantToken = (token: string) => {
  window.localStorage.setItem(TENANT_TOKEN_KEY, token)
}

export const destroyTenantToken = () => {
  window.localStorage.removeItem(TENANT_TOKEN_KEY)
}

export default {
  getTenantToken,
  saveTenantToken,
  destroyTenantToken,
}
