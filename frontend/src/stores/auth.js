import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/axios'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const username = ref(localStorage.getItem('username') || '')
  const role = ref(localStorage.getItem('role') || '')

  const isAuthenticated = computed(() => !!accessToken.value)
  const isEditor = computed(() => role.value === 'ROLE_EDITOR')

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials)
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    username.value = data.username
    role.value = data.role
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('username', data.username)
    localStorage.setItem('role', data.role)
    // Clean up legacy key from previous implementation
    localStorage.removeItem('token')
  }

  async function refresh() {
    const { data } = await api.post('/auth/refresh', { refreshToken: refreshToken.value })
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await api.post('/auth/logout', { refreshToken: refreshToken.value })
      }
    } catch {
      // Backend call best-effort — clear locally either way
    } finally {
      accessToken.value = ''
      refreshToken.value = ''
      username.value = ''
      role.value = ''
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('username')
      localStorage.removeItem('role')
      localStorage.removeItem('token')
    }
  }

  return { accessToken, refreshToken, username, role, isAuthenticated, isEditor, login, refresh, logout }
})