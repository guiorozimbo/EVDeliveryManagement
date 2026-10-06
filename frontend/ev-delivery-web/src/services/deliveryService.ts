import api from '../lib/api'
import type { Delivery, DeliverySummary, PagedResult } from '../types'

export const deliveryApi = {
  getAll: async (page = 1, pageSize = 20): Promise<PagedResult<DeliverySummary>> => {
    const { data } = await api.get('/deliveries', { params: { page, pageSize } })
    return data
  },

  getById: async (id: string): Promise<Delivery> => {
    const { data } = await api.get(`/deliveries/${id}`)
    return data
  },

  getByVehicleId: async (vehicleId: string): Promise<Delivery[]> => {
    const { data } = await api.get(`/deliveries`, { params: { vehicleId } })
    return Array.isArray(data) ? data : data.items ?? []
  },

  create: async (payload: {
    vehicleId: string
    customerId: string
    method: string
    deliveryCenter: string
    scheduledDate?: string
    deliveryWindowStart?: string
    deliveryWindowEnd?: string
    notes?: string
  }): Promise<Delivery> => {
    const { data } = await api.post('/deliveries', payload)
    return data
  },

  schedule: async (id: string, payload: {
    scheduledDate: string
    appointmentDate?: string
    deliveryWindowStart?: string
    deliveryWindowEnd?: string
  }): Promise<Delivery> => {
    const { data } = await api.post(`/deliveries/${id}/schedule`, payload)
    return data
  },

  start: async (id: string): Promise<Delivery> => {
    const { data } = await api.post(`/deliveries/${id}/start`)
    return data
  },

  complete: async (id: string): Promise<Delivery> => {
    const { data } = await api.post(`/deliveries/${id}/complete`)
    return data
  },

  cancel: async (id: string, reason: string): Promise<Delivery> => {
    const { data } = await api.post(`/deliveries/${id}/cancel`, { reason })
    return data
  },

  updateChecklistItem: async (
    deliveryId: string,
    itemId: string,
    payload: { isCompleted: boolean; notes?: string; completedBy?: string }
  ): Promise<Delivery> => {
    const { data } = await api.patch(`/deliveries/${deliveryId}/checklist/${itemId}`, payload)
    return data
  },
}
