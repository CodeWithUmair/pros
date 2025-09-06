// lib/api.ts
import { BACKEND_URL } from '@/config'
import axios from 'axios'

export const api = axios.create({
    baseURL: BACKEND_URL,
    headers: { 'Content-Type': 'application/json' },
})
