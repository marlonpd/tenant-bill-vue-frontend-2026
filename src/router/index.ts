import { createRouter, createWebHistory } from 'vue-router'
import JwtService from '@/apis/jwt'
import TenantJwtService from '@/apis/tenantJwt'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import Units from '@/views/Units.vue'
import Profile from '@/views/Profile.vue'
import PowerRates from '@/views/PowerRates.vue'
import WaterRates from '@/views/WaterRates.vue'
import MeterReading from '@/views/MeterReading.vue'
import TenantLogin from '@/views/TenantLogin.vue'
import TenantPortal from '@/views/TenantPortal.vue'
import LandingPage from '@/views/LandingPage.vue'
import PublicProfile from '@/views/PublicProfile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'home',
      path: '/',
      component: LandingPage,
    },
    {
      name: 'login',
      path: '/login',
      component: Login,
    },
    {
      name: 'register',
      path: '/register',
      component: Register,
    },
    {
      name: 'tenant-login',
      path: '/tenant/login',
      component: TenantLogin,
    },
    {
      name: 'tenant-portal',
      path: '/tenant/portal',
      component: TenantPortal,
      meta: { requiresTenantAuth: true },
    },
    {
      name: 'public-profile',
      path: '/public-profile/:userId',
      component: PublicProfile,
    },
    {
      name: 'dashboard',
      path: '/dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
    },
    {
      name: 'units',
      path: '/units',
      component: Units,
      meta: { requiresAuth: true },
    },
    {
      name: 'profile',
      path: '/profile',
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      name: 'power-rates',
      path: '/power-rates',
      component: PowerRates,
      meta: { requiresAuth: true },
    },
    {
      name: 'water-rates',
      path: '/water-rates',
      component: WaterRates,
      meta: { requiresAuth: true },
    },
    {
      name: 'meter.reading',
      path: '/tenant/meter-reading/:tenantId',
      component: MeterReading,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const hasToken = !!JwtService.getToken()
  const hasTenantToken = !!TenantJwtService.getTenantToken()

  if ((to.name === 'login' || to.name === 'register') && hasToken) {
    return { name: 'dashboard' }
  }

  if (to.name === 'tenant-login' && hasTenantToken) {
    return { name: 'tenant-portal' }
  }

  if (to.meta.requiresAuth && !hasToken) {
    return { name: 'login' }
  }

  if (to.meta.requiresTenantAuth && !hasTenantToken) {
    return { name: 'tenant-login' }
  }

  return true
})

export default router
