import api from '../lib/api'
import type { Vehicle, VehicleSummary, PagedResult } from '../types'

export const vehicleApi = {
  getAll: async (page = 1, pageSize = 20): Promise<PagedResult<VehicleSummary>> => {
    const { data } = await api.get('/vehicles', { params: { page, pageSize } })
    return data
  },

  getById: async (id: string): Promise<Vehicle> => {
    const { data } = await api.get(`/vehicles/${id}`)
    return data
  },

  getByVin: async (vin: string): Promise<Vehicle> => {
    const { data } = await api.get(`/vehicles/vin/${vin}`)
    return data
  },

  updateStatus: async (id: string, status: string, notes?: string): Promise<Vehicle> => {
    const { data } = await api.patch(`/vehicles/${id}/status`, { status, notes })
    return data
  },

  create: async (payload: {
    vin: string
    make: string
    model: string
    year: number
    color: string
    trimLevel: string
    capacityKwh: number
    rangeKm: number
    chargingSpeedKw: number
  }): Promise<Vehicle> => {
    const { data } = await api.post('/vehicles', payload)
    return data
  },
}
