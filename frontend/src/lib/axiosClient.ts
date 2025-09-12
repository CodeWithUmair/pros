'use client'

import { BACKEND_URL } from '@/config'
import axios, { type InternalAxiosRequestConfig, AxiosHeaders } from 'axios'

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers ?? new AxiosHeaders()

    // Get access token and its expiry
    const accessToken = localStorage.getItem('accessToken')
    const accessExpiry = Number(localStorage.getItem('accessExpiry') || 0)
    const now = Math.floor(Date.now() / 1000)

    if (!accessToken || accessExpiry < now) {
      const refreshToken = localStorage.getItem('refreshToken')
      const refreshExpiry = Number(localStorage.getItem('refreshExpiry') || 0)

      if (!refreshToken || refreshExpiry < now) {
        window.location.href = '/auth/login'
        throw new axios.Cancel('No valid refresh token available')
      }

      try {
        const resp = await axios.post(
          `${BACKEND_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )

        const {
          accessToken: { token: newAccessToken, expiry: newAccessExpiry },
        } = resp.data

        localStorage.setItem('accessToken', newAccessToken)
        localStorage.setItem('accessExpiry', String(newAccessExpiry))

        config.headers.Authorization = `Bearer ${newAccessToken}`
      } catch {
        window.location.href = '/auth/login'
        throw new axios.Cancel('Failed to refresh token')
      }
    } else {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

export default apiClient
