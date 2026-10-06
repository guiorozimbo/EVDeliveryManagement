import api from '../lib/api'
import type { Customer, CustomerSummary, PagedResult } from '../types'

export const customerApi = {
  getAll: async (page = 1, pageSize = 20): Promise<PagedResult<CustomerSummary>> => {
    const { data } = await api.get('/customers', { params: { page, pageSize } })
    return data
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await api.get(`/customers/${id}`)
    return data
  },

  create: async (payload: {
    firstName: string
    lastName: string
    email: string
    phone: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }): Promise<Customer> => {
    const { data } = await api.post('/customers', payload)
    return data
  },

  update: async (id: string, payload: Partial<{
    firstName: string
    lastName: string
    phone: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }>): Promise<Customer> => {
    const { data } = await api.put(`/customers/${id}`, payload)
    return data
  },
}
