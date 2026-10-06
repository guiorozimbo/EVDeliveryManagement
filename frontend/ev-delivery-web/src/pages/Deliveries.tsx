import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Truck, Search, ChevronRight, Play, CheckCircle2, XCircle,
  Calendar, Building2, Car
} from 'lucide-react'
import { deliveryApi } from '../services/deliveryService'
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/ui'
import {
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
  DELIVERY_METHOD_LABELS,
  formatDate,
} from '../lib/utils'
import type { DeliveryStatus } from '../types'

const STATUS_FILTERS: { value: DeliveryStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
]

export default function DeliveriesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all')
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['deliveries'],
    queryFn: () => deliveryApi.getAll(1, 100),
  })

  const startMutation = useMutation({
    mutationFn: deliveryApi.start,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  })

  const completeMutation = useMutation({
    mutationFn: deliveryApi.complete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => deliveryApi.cancel(id, 'Cancelled by operator'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  })

  if (isLoading) return <LoadingSpinner text="Loading deliveries..." />
  if (error)
    return (
      <div className="p-8">
        <ErrorMessage message="Failed to load deliveries" onRetry={() => refetch()} />
      </div>
    )

  const deliveries = data?.items ?? []
  const filtered = deliveries.filter(d => {
    const matchSearch =
      !search ||
      `${d.vehicleModel ?? ''} ${d.customerName ?? ''} ${d.vehicleVin ?? ''} ${d.deliveryCenter}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
          <p className="text-gray-500 mt-1">{data?.totalCount ?? 0} total deliveries</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search deliveries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1.5">
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

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Truck className="w-16 h-16" />}
            title="No deliveries found"
            description="Try adjusting your search or filter."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => (
            <div key={d.id} className="card p-5">
              <div className="flex items-center gap-5">
                {/* Icon */}
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-orange-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Vehicle</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{d.vehicleModel ?? 'Unknown'}</p>
                    <p className="text-xs text-gray-400 font-mono">{d.vehicleVin ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Customer</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{d.customerName ?? '—'}</p>
                    <p className="text-xs text-gray-400">{DELIVERY_METHOD_LABELS[d.method]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Delivery Center</p>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-gray-400" />
                      <p className="text-sm text-gray-700 truncate">{d.deliveryCenter}</p>
                    </div>
                    {d.scheduledDate && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-400">{formatDate(d.scheduledDate)}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Status</p>
                    <span className={`status-badge ${DELIVERY_STATUS_COLORS[d.status]}`}>
                      {DELIVERY_STATUS_LABELS[d.status]}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {d.status === 'Scheduled' && (
                    <button
                      onClick={() => startMutation.mutate(d.id)}
                      disabled={startMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                      <Play className="w-3 h-3" />
                      Start
                    </button>
                  )}
                  {d.status === 'InProgress' && (
                    <button
                      onClick={() => completeMutation.mutate(d.id)}
                      disabled={completeMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Complete
                    </button>
                  )}
                  {(d.status === 'Scheduled' || d.status === 'InProgress') && (
                    <button
                      onClick={() => { if (confirm('Cancel this delivery?')) cancelMutation.mutate(d.id) }}
                      disabled={cancelMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-60"
                    >
                      <XCircle className="w-3 h-3" />
                      Cancel
                    </button>
                  )}
                  <Link
                    to={`/vehicles/${d.vehicleId}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View Vehicle"
                  >
                    <Car className="w-4 h-4" />
                  </Link>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
