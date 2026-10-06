import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Car, Search, Plus, ChevronRight, Gauge, Zap } from 'lucide-react'
import { vehicleApi } from '../services/vehicleService'
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/ui'
import { VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS } from '../lib/utils'
import type { VehicleStatus } from '../types'

const STATUS_FILTERS: { value: VehicleStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'OrderPlaced', label: 'Order Placed' },
  { value: 'InTransit', label: 'In Transit' },
  { value: 'Received', label: 'Received' },
  { value: 'Inspection', label: 'Inspection' },
  { value: 'ReadyForDelivery', label: 'Ready' },
  { value: 'Delivered', label: 'Delivered' },
]

export default function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll(1, 100),
  })

  if (isLoading) return <LoadingSpinner text="Loading vehicles..." />
  if (error) return (
    <div className="p-8">
      <ErrorMessage message="Failed to load vehicles" onRetry={() => refetch()} />
    </div>
  )

  const vehicles = data?.items ?? []
  const filtered = vehicles.filter(v => {
    const matchSearch =
      !search ||
      `${v.make} ${v.model} ${v.vin} ${v.licensePlate ?? ''}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || v.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-500 mt-1">{data?.totalCount ?? 0} total vehicles in fleet</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by model, VIN, plate..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Car className="w-16 h-16" />}
            title="No vehicles found"
            description="Try adjusting your search or filter criteria."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">VIN</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plate</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Odometer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="w-10 px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {v.make} {v.model}
                        </p>
                        <p className="text-xs text-gray-400">{v.year} · {v.color} · {v.trimLevel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {v.vin}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gray-600">{v.licensePlate ?? '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-600">{v.odometer.toLocaleString()} km</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`status-badge ${VEHICLE_STATUS_COLORS[v.status]}`}>
                      {VEHICLE_STATUS_LABELS[v.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/vehicles/${v.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
