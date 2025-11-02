import axios from 'axios'

// Allow overriding API base URL via VITE_API_BASE_URL environment variable.
// If not set, defaults to relative "/api" path.
const rawBase = (import.meta as any)?.env?.VITE_API_BASE_URL
const envBase = typeof rawBase === 'string' && rawBase.trim().length > 0 ? rawBase.trim() : undefined
const baseURL = envBase ?? '/api'

export const http = axios.create({
    baseURL,
    withCredentials: true,
})

// Debug log to verify API base URL at runtime
if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[http] baseURL =', baseURL, '; env.VITE_API_BASE_URL =', rawBase)
}

let token: string | null = localStorage.getItem('token')

export const setToken = (t: string | null) => {
    token = t
    if (t) localStorage.setItem('token', t)
    else localStorage.removeItem('token')
}
export const getToken = () => token

http.interceptors.request.use((config) => {
    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

http.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            setToken(null)
        }
        return Promise.reject(err)
    }
)


