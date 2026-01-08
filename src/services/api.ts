import axios from 'axios'
import type { AxiosInstance } from 'axios'

// IP default - bisa diganti dari UI
let API_BASE_URL = 'http://192.168.137.115'

export const setBaseUrl = (newUrl: string): void => {
  API_BASE_URL = newUrl
}

export const getBaseUrl = (): string => {
  return API_BASE_URL
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
})

export interface SensorData {
  temperature: number
  humidity: number
  sensorEnabled: boolean
  status?: string
  message?: string
}

export interface ToggleResponse {
  sensorEnabled: boolean
  status: string
}

export const fetchSensorData = async (customIp?: string): Promise<SensorData> => {
  try {
    const baseUrl = customIp ? `http://${customIp}` : API_BASE_URL
    const response = await api.get<SensorData>('/api/data', {
      baseURL: baseUrl
    })
    return response.data
  } catch (error) {
    console.error('Error fetching sensor data:', error)
    throw error
  }
}

export const toggleSensor = async (enabled: boolean, customIp?: string): Promise<ToggleResponse> => {
  try {
    const baseUrl = customIp ? `http://${customIp}` : API_BASE_URL
    const response = await api.post<ToggleResponse>(
      '/api/toggle-sensor',
      { enabled },
      { baseURL: baseUrl }
    )
    return response.data
  } catch (error) {
    console.error('Error toggling sensor:', error)
    throw error
  }
}