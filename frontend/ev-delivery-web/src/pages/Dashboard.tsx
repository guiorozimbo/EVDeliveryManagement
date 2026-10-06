import { useQuery } from '@tanstack/react-query'
import { Car, Users, Truck, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import { vehicleApi } from '../services/vehicleService'
import { customerApi } from '../services/customerService'
import { deliveryApi } from '../services/deliveryService'
import { LoadingSpinner } from '../components/ui'
import { VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS, DELIVERY_STATUS_COLORS, formatDate } from '../lib/utils'
import { Link } from 'react-router-dom'
import type { VehicleSummary, DeliverySummary } from '../types'

function StatCard({ title, value, subtitle, icon: Icon, color }: {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
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

  if (vLoad || cLoad || dLoad) return <LoadingSpinner text="Loading dashboard..." />

  const vItems: VehicleSummary[] = vehicles?.items ?? []
  const dItems: DeliverySummary[] = deliveries?.items ?? []

  const inTransit = vItems.filter(v => v.status === 'InTransit').length
  const readyForDelivery = vItems.filter(v => v.status === 'ReadyForDelivery' || v.status === 'DeliveryScheduled').length
  const delivered = vItems.filter(v => v.status === 'Delivered').length
  const activeDeliveries = dItems.filter(d => d.status === 'InProgress' || d.status === 'Scheduled').length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">EV Delivery Management Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Vehicles"
          value={vehicles?.totalCount ?? 0}
          subtitle={`${inTransit} in transit`}
          icon={Car}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Customers"
          value={customers?.totalCount ?? 0}
          subtitle="Active customers"
          icon={Users}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Active Deliveries"
          value={activeDeliveries}
          subtitle={`${dItems.filter(d => d.status === 'Completed').length} completed`}
          icon={Truck}
          color="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Delivered"
          value={delivered}
          subtitle={`${readyForDelivery} ready to go`}
          icon={CheckCircle}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Vehicles */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Recent Vehicles</h2>
            </div>
            <Link to="/vehicles" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {vItems.slice(0, 6).map(v => (
              <Link
                key={v.id}
                to={`/vehicles/${v.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{v.make} {v.model} {v.year}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{v.vin}</p>
                </div>
                <span className={`status-badge ${VEHICLE_STATUS_COLORS[v.status]}`}>
                  {VEHICLE_STATUS_LABELS[v.status]}
                </span>
              </Link>
            ))}
            {vItems.length === 0 && (
              <p className="text-sm text-gray-400 px-6 py-6 text-center">No vehicles yet</p>
            )}
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-500" />
              <h2 className="font-semibold text-gray-900">Recent Deliveries</h2>
            </div>
            <Link to="/deliveries" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {dItems.slice(0, 6).map(d => (
              <Link
                key={d.id}
                to={`/deliveries/${d.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {d.vehicleModel ?? 'Unknown Vehicle'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-400">{d.customerName ?? 'Unknown Customer'}</p>
                    {d.scheduledDate && (
                      <span className="text-xs text-gray-300">•</span>
                    )}
                    {d.scheduledDate && (
                      <p className="text-xs text-gray-400">{formatDate(d.scheduledDate)}</p>
                    )}
                  </div>
                </div>
                <span className={`status-badge ${DELIVERY_STATUS_COLORS[d.status]}`}>
                  {d.status}
                </span>
              </Link>
            ))}
            {dItems.length === 0 && (
              <p className="text-sm text-gray-400 px-6 py-6 text-center">No deliveries yet</p>
            )}
          </div>
        </div>

        {/* Vehicle status breakdown */}
        <div className="card xl:col-span-2">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Fleet Status Breakdown</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(['OrderPlaced', 'InTransit', 'Inspection', 'ReadyForDelivery', 'Delivered'] as const).map(status => {
                const count = vItems.filter(v => v.status === status).length
                const pct = vItems.length > 0 ? Math.round((count / vItems.length) * 100) : 0
                return (
                  <div key={status} className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${VEHICLE_STATUS_COLORS[status]}`}>
                      <span className="text-sm font-bold">{count}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-700">{VEHICLE_STATUS_LABELS[status]}</p>
                    <p className="text-xs text-gray-400">{pct}%</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {inTransit > 0 && (
        <div className="mt-6 flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-5 py-4">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-800">{inTransit} vehicle{inTransit > 1 ? 's' : ''} in transit</p>
            <p className="text-xs text-orange-600 mt-0.5">Monitor arrival times and update vehicle status upon receipt.</p>
          </div>
          <Link to="/vehicles" className="ml-auto text-xs font-medium text-orange-700 hover:text-orange-900 whitespace-nowrap">
            View →
          </Link>
        </div>
      )}
      {readyForDelivery > 0 && (
        <div className="mt-3 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <Clock className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">{readyForDelivery} vehicle{readyForDelivery > 1 ? 's' : ''} ready for delivery</p>
            <p className="text-xs text-green-600 mt-0.5">Schedule delivery appointments for waiting customers.</p>
          </div>
          <Link to="/deliveries" className="ml-auto text-xs font-medium text-green-700 hover:text-green-900 whitespace-nowrap">
            Schedule →
          </Link>
        </div>
      )}
    </div>
  )
}
