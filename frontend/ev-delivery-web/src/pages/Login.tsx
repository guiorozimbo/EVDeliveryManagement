import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../services/authService'

const DEMO_USERS = [
  { email: 'admin@evdelivery.com', password: 'Admin@123!', role: 'Admin' },
  { email: 'tech@evdelivery.com', password: 'Tech@123!', role: 'Technician' },
  { email: 'sales@evdelivery.com', password: 'Sales@123!', role: 'Sales' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@evdelivery.com')
  const [password, setPassword] = useState('Admin@123!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      login({ email: res.email, role: res.role, token: res.token })
      navigate('/dashboard')
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid credentials. Please check your email and password.')
      } else {
        setError(err.response?.data?.message || err.message || 'Unable to reach Gateway API at http://localhost:5000.')
      }
    } finally {
      setLoading(false)
    }
  }

  function quickLogin(u: typeof DEMO_USERS[0]) {
    setEmail(u.email)
    setPassword(u.password)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-xl shadow-cyan-500/20 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-[10px] font-mono uppercase tracking-widest text-cyan-300 mb-2">
            BYD DiLink OS · Architecture
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">EV Delivery Management</h1>
          <p className="text-slate-400 mt-1 text-xs">Staff-grade Delivery Dispatch & PDI Platform</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center justify-between">
            <span>Operator Sign In</span>
            <span className="text-xs text-slate-400 font-mono">v2.4.0</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-slate-700 bg-slate-950/80 text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                placeholder="email@evdelivery.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-slate-700 bg-slate-950/80 text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-800/50 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg py-2.5 text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Authenticating...' : 'Sign In to DiLink'}
            </button>
          </form>

          {/* Quick login demo accounts */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs font-medium text-slate-400 mb-2.5">One-click Demo Roles</p>
            <div className="space-y-1.5">
              {DEMO_USERS.map(u => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => quickLogin(u)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">{u.email}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{u.password}</p>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-300">
                      {u.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Architectural reference design · BYD DiLink inspired UI · .NET 10 Microservices
        </p>
      </div>
    </div>
  )
}
