import api from '../lib/api'
import type { Customer, CustomerSummary, PagedResult } from '../types'

export const customerApi = {
  getAll: async (page = 1, pageSize = 50): Promise<PagedResult<CustomerSummary>> => {
    const { data } = await api.get('/customers', { params: { page, pageSize } })
    return data
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await api.get(`/customers/${id}`)
    return data
  },

  create: async (payload: {
    name?: string
    firstName?: string
    lastName?: string
    email: string
    phone: string
    street: string
    city: string
    state: string
    postalCode?: string
    zipCode?: string
    country?: string
    documentNumber?: string
  }): Promise<Customer> => {
    const fullName = payload.name || `${payload.firstName ?? ''} ${payload.lastName ?? ''}`.trim()
    const postal = payload.postalCode || payload.zipCode || '01000-000'
    const body = {
      name: fullName,
      email: payload.email,
      phone: payload.phone,
      street: payload.street,
      city: payload.city,
      state: payload.state,
      postalCode: postal,
      country: payload.country || 'Brazil',
      documentNumber: payload.documentNumber || null,
    }
    const { data } = await api.post('/customers', body)
    return data
  },

  update: async (id: string, payload: Partial<{
    name: string
    email: string
    phone: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    documentNumber: string
  }>): Promise<Customer> => {
    const { data } = await api.put(`/customers/${id}`, payload)
    return data
  },
}
