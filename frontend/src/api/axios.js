import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import router from '../router'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

function getTokenRemainingMs() {
  const token = localStorage.getItem('accessToken')
  if (!token) return 0
  try {
    const base64 = token.split('.')[1]
    const payload = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload.exp) return 0
    return payload.exp * 1000 - Date.now()
  } catch {
    return 0
  }
}

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000

let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (token) prom.resolve(token)
    else prom.reject(error)
  })
  failedQueue = []
}

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.url?.includes('/auth/')) return config

  const remaining = getTokenRemainingMs()
  if (remaining > 0 && remaining < REFRESH_THRESHOLD_MS && !isRefreshing) {
    isRefreshing = true
    try {
      const auth = useAuthStore()
      await auth.refresh()
      const newToken = auth.accessToken
      config.headers.Authorization = `Bearer ${newToken}`
      processQueue(null, newToken)
    } catch {
      processQueue(new Error('Refresh failed'), null)
    } finally {
      isRefreshing = false
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const auth = useAuthStore()
        await auth.refresh()
        const newToken = auth.accessToken
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        const auth = useAuthStore()
        auth.logout()
        router.push('/login')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/')) {
      const auth = useAuthStore()
      auth.logout()
      router.push('/login')
    }

    return Promise.reject(error)
  }
)