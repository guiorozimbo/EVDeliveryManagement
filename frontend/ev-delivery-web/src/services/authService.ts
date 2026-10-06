import api from '../lib/api'
import type { AuthResponse, LoginRequest } from '../types'

export const authApi = {
  login: async (req: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', req)
    return data
  },
}
