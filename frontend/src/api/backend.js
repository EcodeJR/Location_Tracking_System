import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL

const api = axios.create({ baseURL: API_URL })

// attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const register = (payload) => api.post('/auth/register', payload)
export const login = (payload) => api.post('/auth/login', payload)

// Images
export const uploadImage = (formData) =>
  api.post('/images/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const myImages = () => api.get('/images/my')

// Optional face recognition — failures are swallowed by caller
export const recognizeFace = (fileId) => api.post('/images/recognize', { fileId })

export default api