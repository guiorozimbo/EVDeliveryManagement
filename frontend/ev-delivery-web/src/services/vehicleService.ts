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
    brand?: string
    make?: string
    model: string
    year: number
    color: string
    version?: string
    trimLevel?: string
    batteryCapacityKwh?: number
    capacityKwh?: number
    batteryLevelPercentage?: number
    estimatedRangeKm?: number
    rangeKm?: number
    odometerKm?: number
    odometer?: number
    licensePlate?: string
    location?: string
    deliveryCenter?: string
    imageUrl?: string
  }): Promise<Vehicle> => {
    const brand = payload.brand || payload.make || 'BYD'
    const version = payload.version || payload.trimLevel || 'Standard'
    const batteryCapacityKwh = payload.batteryCapacityKwh ?? payload.capacityKwh ?? 82.5
    const batteryLevelPercentage = payload.batteryLevelPercentage ?? 100
    const estimatedRangeKm = payload.estimatedRangeKm ?? payload.rangeKm ?? 450
    const odometerKm = payload.odometerKm ?? payload.odometer ?? 5.0

    const body = {
      vin: payload.vin,
      brand,
      model: payload.model,
      version,
      year: payload.year,
      color: payload.color,
      batteryCapacityKwh,
      batteryLevelPercentage,
      estimatedRangeKm,
      odometerKm,
      licensePlate: payload.licensePlate || null,
      location: payload.location || 'Centro de Distribuição Principal',
      deliveryCenter: payload.deliveryCenter || 'São Paulo - SP',
      imageUrl: payload.imageUrl || `/vehicles/byd_${payload.model.toLowerCase().replace(/\s+/g, '_')}.png`,
      initialStatus: 'ORDERED',
      createdBy: 'Operador DiLink'
    }
    const { data } = await api.post('/vehicles', body)
    return data
  },
}
