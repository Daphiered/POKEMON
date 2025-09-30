import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/components/Dashboard.vue'
import GuessPokemon from '@/components/GuessPokemon.vue'
import MemoryGame from '@/components/MemoryGame.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },   // default redirect
    { path: '/dashboard', component: Dashboard },
    { path: '/guess', component: GuessPokemon },
    { path: '/memory', component: MemoryGame },
  ],
})

export default router
