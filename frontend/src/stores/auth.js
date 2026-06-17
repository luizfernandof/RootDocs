import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/axios'

function decodeTokenPayload(token) {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function getTokenRemainingMs(token) {
  const payload = decodeTokenPayload(token)
  if (!payload?.exp) return 0
  return payload.exp * 1000 - Date.now()
}

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000
const REFRESH_INTERVAL_MS = 5 * 60 * 1000

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const username = ref(localStorage.getItem('username') || '')
  const role = ref(localStorage.getItem('role') || '')

  const isAuthenticated = computed(() => !!accessToken.value)
  const isEditor = computed(() => role.value === 'ROLE_EDITOR')

  let refreshTimer = null

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
    localStorage.removeItem('token')
    startRefreshTimer()
  }

  async function refresh() {
    if (!refreshToken.value) throw new Error('No refresh token')
    const { data } = await api.post('/auth/refresh', { refreshToken: refreshToken.value })
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
  }

  function startRefreshTimer() {
    stopRefreshTimer()
    refreshTimer = setInterval(async () => {
      if (!refreshToken.value) return
      const remaining = getTokenRemainingMs(accessToken.value)
      if (remaining < REFRESH_THRESHOLD_MS) {
        try {
          await refresh()
        } catch {
          logout()
        }
      }
    }, REFRESH_INTERVAL_MS)
  }

  function stopRefreshTimer() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  async function logout() {
    stopRefreshTimer()
    try {
      if (refreshToken.value) {
        await api.post('/auth/logout', { refreshToken: refreshToken.value })
      }
    } catch {
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

  if (isAuthenticated.value) {
    startRefreshTimer()
  }

  return { accessToken, refreshToken, username, role, isAuthenticated, isEditor, login, refresh, logout, startRefreshTimer, stopRefreshTimer }
})