import { createRouter, createWebHistory } from 'vue-router'
import JwtService from '@/apis/jwt'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import Units from '@/views/Units.vue'
import Profile from '@/views/Profile.vue'
import PowerRates from '@/views/PowerRates.vue'
import MeterReading from '@/views/MeterReading.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
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
      name: 'meter.reading',
      path: '/tenant/meter-reading/:tenantId',
      component: MeterReading,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const hasToken = !!JwtService.getToken()

  if ((to.name === 'login' || to.name === 'register') && hasToken) {
    return { name: 'dashboard' }
  }

  if (to.meta.requiresAuth && !hasToken) {
    return { name: 'login' }
  }

  return true
})

export default router
