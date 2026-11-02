import { useQuery } from '@tanstack/react-query'
import { Car, Users, Truck, CheckCircle, Clock, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react'
import { vehicleApi } from '../services/vehicleService'
import { customerApi } from '../services/customerService'
import { deliveryApi } from '../services/deliveryService'
import { LoadingSpinner } from '../components/ui'
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_COLORS,
  DELIVERY_STATUS_COLORS,
  formatDate,
  getVehicleBrand,
  getVehicleModel,
  normalizeVehicleStatus
} from '../lib/utils'
import { Link } from 'react-router-dom'
import type { VehicleSummary, DeliverySummary } from '../types'

function StatCard({ title, value, subtitle, icon: Icon, color, glow }: {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ElementType
  color: string
  glow?: string
}) {
  return (
    <div className={`card p-6 relative overflow-hidden group hover:border-blue-500/50 dark:hover:border-cyan-500/50 transition-all ${glow ?? ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shadow-sm transition-transform group-hover:scale-105`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: vehicles, isLoading: vLoad } = useQuery({
    queryKey: ['vehicles', 'all'],
    queryFn: () => vehicleApi.getAll(1, 100),
  })

  const { data: customers, isLoading: cLoad } = useQuery({
    queryKey: ['customers', 'all'],
    queryFn: () => customerApi.getAll(1, 100),
  })

  const { data: deliveries, isLoading: dLoad } = useQuery({
    queryKey: ['deliveries', 'all'],
    queryFn: () => deliveryApi.getAll(1, 100),
  })

  if (vLoad || cLoad || dLoad) return <LoadingSpinner text="Connecting to vehicle fleet telemetry..." />

  const vItems: VehicleSummary[] = vehicles?.items ?? []
  const dItems: DeliverySummary[] = deliveries?.items ?? []

  const inTransit = vItems.filter(v => normalizeVehicleStatus(v.status) === 'InTransit').length
  const readyForDelivery = vItems.filter(v => {
    const s = normalizeVehicleStatus(v.status)
    return s === 'ReadyForDelivery' || s === 'DeliveryScheduled'
  }).length
  const delivered = vItems.filter(v => normalizeVehicleStatus(v.status) === 'Delivered').length
  const activeDeliveries = dItems.filter(d => d.status === 'InProgress' || d.status === 'Scheduled').length

  return (
    <div className="p-8 max-w-[1500px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Fleet Operations Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time electric vehicle distribution & pre-delivery inspection hub</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/vehicles" className="btn-primary text-xs flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5" />
            <span>View All Fleet</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Fleet"
          value={vehicles?.totalCount ?? 0}
          subtitle={`${inTransit} currently in transit`}
          icon={Car}
          color="bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 border border-transparent dark:border-blue-800/40"
        />
        <StatCard
          title="Active Customers"
          value={customers?.totalCount ?? 0}
          subtitle="Orders awaiting delivery"
          icon={Users}
          color="bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-transparent dark:border-purple-800/40"
        />
        <StatCard
          title="Active Handover Orders"
          value={activeDeliveries}
          subtitle={`${dItems.filter(d => d.status === 'Completed').length} completed handovers`}
          icon={Truck}
          color="bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-transparent dark:border-amber-800/40"
        />
        <StatCard
          title="Handed Over (Delivered)"
          value={delivered}
          subtitle={`${readyForDelivery} ready for customer pickup`}
          icon={CheckCircle}
          color="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-transparent dark:border-emerald-800/40"
        />
      </div>

      {/* Main Grid: Vehicles & Deliveries */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Vehicles */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Recent Vehicles</h2>
            </div>
            <Link to="/vehicles" className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-medium flex items-center gap-0.5">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {vItems.slice(0, 5).map(v => (
              <Link
                key={v.id}
                to={`/vehicles/${v.id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {getVehicleBrand(v)} {getVehicleModel(v)}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {v.year}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{v.vin}</p>
                </div>
                <span className={`status-badge ${VEHICLE_STATUS_COLORS[v.status]}`}>
                  {VEHICLE_STATUS_LABELS[v.status]}
                </span>
              </Link>
            ))}
            {vItems.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500 px-6 py-8 text-center">No vehicles in fleet</p>
            )}
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Delivery Appointments</h2>
            </div>
            <Link to="/deliveries" className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-medium flex items-center gap-0.5">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {dItems.slice(0, 5).map(d => (
              <Link
                key={d.id}
                to={`/deliveries`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {d.vehicleModel ?? 'Vehicle'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    <span>{d.customerName ?? 'Customer'}</span>
                    {d.scheduledDate && (
                      <>
                        <span>•</span>
                        <span>{formatDate(d.scheduledDate)}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`status-badge ${DELIVERY_STATUS_COLORS[d.status]}`}>
                  {d.status}
                </span>
              </Link>
            ))}
            {dItems.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500 px-6 py-8 text-center">No delivery records</p>
            )}
          </div>
        </div>

        {/* Fleet Distribution by Status */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Lifecycle Pipeline Distribution</h2>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{vItems.length} vehicles total</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(['OrderPlaced', 'InTransit', 'Inspection', 'ReadyForDelivery', 'Delivered'] as const).map(status => {
                const count = vItems.filter(v => v.status === status).length
                const pct = vItems.length > 0 ? Math.round((count / vItems.length) * 100) : 0
                return (
                  <div key={status} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-center">
                    <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-2.5 ${VEHICLE_STATUS_COLORS[status]}`}>
                      <span className="text-sm font-bold">{count}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{VEHICLE_STATUS_LABELS[status]}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 dark:bg-cyan-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Attention Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inTransit > 0 && (
          <div className="flex items-start gap-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/70 dark:border-orange-800/40 rounded-xl px-5 py-4">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">{inTransit} vehicle{inTransit > 1 ? 's' : ''} in transit</p>
              <p className="text-xs text-orange-700 dark:text-orange-300/80 mt-0.5">Maritime / trailer convoy active. Yard check-in required upon arrival at delivery center.</p>
            </div>
            <Link to="/vehicles" className="ml-auto text-xs font-semibold text-orange-800 dark:text-orange-300 hover:underline whitespace-nowrap">
              Review →
            </Link>
          </div>
        )}
        {readyForDelivery > 0 && (
          <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/40 rounded-xl px-5 py-4">
            <Clock className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">{readyForDelivery} vehicle{readyForDelivery > 1 ? 's' : ''} ready for delivery</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300/80 mt-0.5">All mandatory PDI inspection items signed off. Ready for appointment scheduling.</p>
            </div>
            <Link to="/deliveries" className="ml-auto text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:underline whitespace-nowrap">
              Schedule →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
