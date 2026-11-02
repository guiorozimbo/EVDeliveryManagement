import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  LayoutDashboard,
  Car,
  Users,
  Truck,
  LogOut,
  Zap,
  ChevronRight,
  Sun,
  Moon,
  ShieldCheck,
  RefreshCw,
  Home
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vehicles', icon: Car, label: 'Veículos & 3D' },
  { to: '/customers', icon: Users, label: 'Clientes' },
  { to: '/deliveries', icon: Truck, label: 'Entregas' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const navigate = useNavigate()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries()
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#080b11] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 bg-white dark:bg-[#0c121e] border-r border-slate-200 dark:border-slate-800 flex-shrink-0 transition-colors duration-200">
        {/* Brand / Logo (Clickable to return to Dashboard) */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors group"
          title="Clique para voltar ao Dashboard"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 rounded-2xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight group-hover:text-cyan-400 transition-colors">
                EV Delivery
              </span>
              <span className="text-[10px] font-mono uppercase bg-blue-100 dark:bg-cyan-950/80 border border-transparent dark:border-cyan-800/50 text-blue-700 dark:text-cyan-400 px-1.5 py-0.2 rounded font-bold">
                BYD OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">Delivery Operations</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-400 border border-blue-200/60 dark:border-blue-800/50 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Theme Toggle + Profile Footer */}
        <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          {/* Quick Theme Switcher Pill */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              {isDark ? <Moon className="w-3.5 h-3.5 text-cyan-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              {isDark ? 'Dynasty Dark' : 'Ocean Light'}
            </span>
            <button
              onClick={toggleTheme}
              className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Toggle Dark / Light Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
              {user?.email?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate">{user?.email}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span className="uppercase font-semibold tracking-wider text-[9px] text-emerald-600 dark:text-emerald-400">{user?.role}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-white/80 dark:bg-[#0c121e]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between flex-shrink-0 z-10 transition-colors duration-200">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Resilient Network Online</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Gateway 5000</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Vehicle · Customer · Delivery</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Return to Dashboard */}
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-500 hover:border-cyan-500/40 transition-colors"
              title="Voltar à tela inicial de Dashboard"
            >
              <Home className="w-3.5 h-3.5 text-cyan-500" />
              <span>Dashboard</span>
            </Link>

            {/* Reload / Refresh Telemetry Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-500 hover:border-cyan-500/40 transition-colors"
              title="Recarregar telemetria e dados de todos os microsserviços"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Atualizando...' : 'Recarregar'}</span>
            </button>

            {/* Theme switcher button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#080b11] transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
