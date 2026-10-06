import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, MapPin, Calendar, Gauge, Zap, Clock,
  ChevronRight, CheckCircle2, Circle, CalendarDays,
  Navigation, Building2, Settings, Car, FileText,
  Code2, ClipboardCheck, RefreshCw, Battery
} from 'lucide-react'
import { vehicleApi } from '../services/vehicleService'
import { deliveryApi } from '../services/deliveryService'
import { LoadingSpinner, ErrorMessage, StatusBadge } from '../components/ui'
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_COLORS,
  VEHICLE_STATUS_STEPS,
  DELIVERY_METHOD_LABELS,
  CHECKLIST_LABELS,
  formatDate,
  formatDateTime,
  formatRelative,
} from '../lib/utils'
import type { VehicleStatus, Delivery, DeliveryChecklistItem } from '../types'

// ============================================================
// ORDER PROGRESS TIMELINE
// ============================================================
const TIMELINE_STEPS: VehicleStatus[] = [
  'OrderPlaced',
  'VinAssigned',
  'InTransit',
  'ReadyForDelivery',
  'Delivered',
]

function OrderTimeline({ currentStatus }: { currentStatus: VehicleStatus }) {
  const currentIdx = VEHICLE_STATUS_STEPS.indexOf(currentStatus)

  const isStepDone = (step: VehicleStatus) =>
    VEHICLE_STATUS_STEPS.indexOf(step) < currentIdx
  const isStepActive = (step: VehicleStatus) => step === currentStatus
  const isStepPending = (step: VehicleStatus) =>
    VEHICLE_STATUS_STEPS.indexOf(step) > currentIdx

  return (
    <div className="flex items-center gap-0 w-full">
      {TIMELINE_STEPS.map((step, i) => {
        const done = isStepDone(step)
        const active = isStepActive(step)
        const pending = isStepPending(step)
        return (
          <div key={step} className="flex items-center flex-1">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? 'bg-blue-600 border-blue-600'
                    : active
                    ? 'bg-white border-blue-600 ring-4 ring-blue-100'
                    : 'bg-white border-gray-300'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : active ? (
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300" />
                )}
              </div>
              <span
                className={`text-xs font-medium text-center leading-tight whitespace-nowrap ${
                  done || active ? 'text-blue-700' : 'text-gray-400'
                }`}
              >
                {VEHICLE_STATUS_LABELS[step]}
              </span>
            </div>
            {/* Connector */}
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 ${done ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================================
// CHECKLIST PANEL
// ============================================================
function ChecklistPanel({
  delivery,
  onToggle,
}: {
  delivery: Delivery
  onToggle: (item: DeliveryChecklistItem) => void
}) {
  const completed = delivery.checklist.filter(i => i.isCompleted).length
  const total = delivery.checklist.length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">PDI Checklist</h3>
        <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
          {completed}/{total} completed
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
        />
      </div>
      <div className="space-y-2">
        {delivery.checklist.map(item => (
          <button
            key={item.id}
            onClick={() => onToggle(item)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${
              item.isCompleted
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50'
            }`}
          >
            {item.isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${item.isCompleted ? 'text-green-800' : 'text-gray-700'}`}>
                {CHECKLIST_LABELS[item.type]}
              </p>
              {!item.isMandatory && (
                <p className="text-xs text-gray-400">Optional</p>
              )}
            </div>
            {!item.isCompleted && !item.isMandatory && (
              <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Pending</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// INFO FIELD
// ============================================================
function InfoField({ label, value, icon: Icon }: {
  label: string
  value?: string
  icon?: React.ElementType
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 text-gray-400" />}
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-medium text-gray-900">{value ?? '—'}</p>
    </div>
  )
}

// ============================================================
// TABS
// ============================================================
type Tab = 'details' | 'tasks' | 'checklist' | 'json'

// ============================================================
// MAIN PAGE
// ============================================================
export default function VehicleDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('details')
  const [scheduleModal, setScheduleModal] = useState(false)

  const { data: vehicle, isLoading, error, refetch } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehicleApi.getById(id!),
    enabled: !!id,
  })

  const { data: deliveriesResult } = useQuery({
    queryKey: ['deliveries', 'vehicle', id],
    queryFn: () => deliveryApi.getAll(1, 100),
    enabled: !!id,
  })

  const delivery = deliveriesResult?.items.find(d => d.vehicleId === id) as Delivery | undefined

  const { data: fullDelivery } = useQuery({
    queryKey: ['delivery', delivery?.id],
    queryFn: () => deliveryApi.getById(delivery!.id),
    enabled: !!delivery?.id,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ item }: { item: DeliveryChecklistItem }) =>
      deliveryApi.updateChecklistItem(fullDelivery!.id, item.id, {
        isCompleted: !item.isCompleted,
        completedBy: 'Technician',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', fullDelivery?.id] })
    },
  })

  if (isLoading) return <LoadingSpinner text="Loading vehicle details..." />
  if (error || !vehicle)
    return (
      <div className="p-8">
        <ErrorMessage
          title="Vehicle Not Found"
          message="The requested vehicle could not be found."
          onRetry={() => refetch()}
        />
      </div>
    )

  const statusColorClass = VEHICLE_STATUS_COLORS[vehicle.status]
  const statusLabel = VEHICLE_STATUS_LABELS[vehicle.status]

  const vehicleImageUrl = `/vehicles/${vehicle.make.toLowerCase()}-${vehicle.model.toLowerCase().replace(/\s+/g, '-')}.jpg`

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-3">
          <Link
            to="/vehicles"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Vehicles</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-sm text-gray-900 font-medium">
            {vehicle.make} {vehicle.model} {vehicle.year}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-8 py-6 space-y-6">

          {/* ── Hero Card ── */}
          <div className="card overflow-hidden">
            {/* Vehicle image banner */}
            <div className="relative h-56 bg-gradient-to-br from-slate-800 via-slate-700 to-blue-900 overflow-hidden">
              <img
                src={vehicleImageUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-60"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <StatusBadge label={statusLabel} colorClass={statusColorClass} />
                  {vehicle.licensePlate && (
                    <span className="bg-white/20 text-white text-xs font-mono px-2 py-0.5 rounded">
                      {vehicle.licensePlate}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white leading-tight">
                  {vehicle.make} {vehicle.model} {vehicle.year}
                </h1>
                <p className="text-blue-200 text-sm mt-1">
                  {vehicle.trimLevel} · {vehicle.color} · {vehicle.batteryInfo.rangeKm} km range
                </p>
              </div>
              {/* EV badge */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Zap className="w-3 h-3" />
                  Electric
                </div>
              </div>
            </div>

            {/* Order Progress Timeline */}
            <div className="px-8 py-6 border-b border-gray-100">
              <OrderTimeline currentStatus={vehicle.status} />
            </div>

            {/* Schedule Delivery Appointment */}
            {(vehicle.status === 'ReadyForDelivery' || vehicle.status === 'DeliveryScheduled') && (
              <div className="px-8 py-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Schedule Delivery Appointment</p>
                    <p className="text-xs text-blue-600">Vehicle is ready — confirm date and time with customer</p>
                  </div>
                </div>
                <button
                  onClick={() => setScheduleModal(true)}
                  className="btn-primary text-sm"
                >
                  Schedule Now
                </button>
              </div>
            )}
          </div>

          {/* ── Main Content ── */}
          <div className="flex gap-6">
            {/* Left column — Tabs + Info */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* Tabs */}
              <div className="card">
                <div className="flex border-b border-gray-100">
                  {([
                    { id: 'details', label: 'Order Details', icon: FileText },
                    { id: 'tasks', label: 'App Tasks', icon: Settings },
                    { id: 'checklist', label: 'Delivery Checklist', icon: ClipboardCheck },
                    { id: 'json', label: 'Full JSON', icon: Code2 },
                  ] as { id: Tab; label: string; icon: React.ElementType }[]).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-700'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* ORDER DETAILS TAB */}
                  {activeTab === 'details' && (
                    <div className="grid grid-cols-2 gap-x-12 gap-y-5">
                      <InfoField label="VIN" value={vehicle.vin} icon={Car} />
                      <InfoField
                        label="ETA to Delivery Center"
                        value={fullDelivery?.eta ? formatRelative(fullDelivery.eta) : 'Pending'}
                        icon={Clock}
                      />
                      <InfoField label="License Plate" value={vehicle.licensePlate} icon={FileText} />
                      <InfoField
                        label="Delivery Method"
                        value={fullDelivery?.method ? DELIVERY_METHOD_LABELS[fullDelivery.method] : '—'}
                        icon={Car}
                      />
                      <InfoField
                        label="Delivery Window"
                        value={
                          fullDelivery?.deliveryWindowStart && fullDelivery?.deliveryWindowEnd
                            ? `${formatDate(fullDelivery.deliveryWindowStart)} – ${formatDate(fullDelivery.deliveryWindowEnd)}`
                            : '—'
                        }
                        icon={Calendar}
                      />
                      <InfoField
                        label="Delivery Center"
                        value={fullDelivery?.deliveryCenter}
                        icon={Building2}
                      />
                      <InfoField
                        label="Delivery Appointment"
                        value={fullDelivery?.appointmentDate ? formatDateTime(fullDelivery.appointmentDate) : '—'}
                        icon={CalendarDays}
                      />
                      <InfoField
                        label="Odometer"
                        value={`${vehicle.odometer.toLocaleString()} km`}
                        icon={Gauge}
                      />
                      <InfoField
                        label="Vehicle Location"
                        value={fullDelivery?.vehicleLocation ?? 'In Transit'}
                        icon={MapPin}
                      />
                      <InfoField
                        label="Order Booked Date"
                        value={formatDate(vehicle.createdAt)}
                        icon={Calendar}
                      />
                    </div>
                  )}

                  {/* APP TASKS TAB */}
                  {activeTab === 'tasks' && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500 mb-4">Pending actions for this vehicle:</p>
                      {vehicle.status === 'Received' && (
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <Settings className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-sm font-semibold text-purple-900">Start PDI Inspection</p>
                            <p className="text-xs text-purple-600">Vehicle received — begin pre-delivery inspection</p>
                          </div>
                        </div>
                      )}
                      {vehicle.status === 'Inspection' && (
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                          <ClipboardCheck className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="text-sm font-semibold text-yellow-900">Complete Inspection</p>
                            <p className="text-xs text-yellow-600">Fill in the PDI checklist before proceeding</p>
                          </div>
                        </div>
                      )}
                      {vehicle.status === 'DeliveryInProgress' && (
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <Navigation className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900">Delivery in Progress</p>
                            <p className="text-xs text-blue-600">Vehicle is being delivered to the customer</p>
                          </div>
                        </div>
                      )}
                      {vehicle.status === 'Delivered' && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm font-semibold text-green-900">Delivery Completed</p>
                            <p className="text-xs text-green-600">Vehicle successfully delivered to the customer</p>
                          </div>
                        </div>
                      )}
                      {!['Received', 'Inspection', 'DeliveryInProgress', 'Delivered'].includes(vehicle.status) && (
                        <p className="text-sm text-gray-400 text-center py-8">No pending tasks at this stage.</p>
                      )}
                    </div>
                  )}

                  {/* CHECKLIST TAB */}
                  {activeTab === 'checklist' && (
                    <div>
                      {fullDelivery ? (
                        <ChecklistPanel
                          delivery={fullDelivery}
                          onToggle={item => toggleMutation.mutate({ item })}
                        />
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-8">
                          No delivery record linked to this vehicle yet.
                        </p>
                      )}
                    </div>
                  )}

                  {/* JSON TAB */}
                  {activeTab === 'json' && (
                    <div className="bg-gray-950 rounded-xl p-5 overflow-x-auto">
                      <pre className="text-xs text-green-400 leading-relaxed">
                        {JSON.stringify({ vehicle, delivery: fullDelivery ?? null }, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column — Battery + Status History */}
            <div className="w-72 flex-shrink-0 space-y-5">
              {/* Battery Card */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Battery className="w-4 h-4 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Battery & Range</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Capacity</p>
                    <p className="text-sm font-bold text-gray-900">{vehicle.batteryInfo.capacityKwh} kWh</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Range (WLTP)</p>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-gray-900">{vehicle.batteryInfo.rangeKm} km</p>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                        style={{ width: `${Math.min((vehicle.batteryInfo.rangeKm / 700) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Max Charging Speed</p>
                    <p className="text-sm font-bold text-gray-900">{vehicle.batteryInfo.chargingSpeedKw} kW</p>
                  </div>
                </div>
              </div>

              {/* Status History */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Status History</h3>
                  </div>
                  <span className="text-xs text-gray-400">{vehicle.statusHistory.length} events</span>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {vehicle.statusHistory.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No history yet</p>
                  )}
                  {[...vehicle.statusHistory].reverse().map((h, idx) => (
                    <div key={h.id ?? idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
                        {idx < vehicle.statusHistory.length - 1 && (
                          <div className="w-px flex-1 bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="pb-3 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">
                          {VEHICLE_STATUS_LABELS[h.status]}
                        </p>
                        <p className="text-xs text-gray-400">{formatDateTime(h.changedAt)}</p>
                        {h.notes && (
                          <p className="text-xs text-gray-500 mt-0.5 italic">{h.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal (simple) */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-1">Schedule Delivery Appointment</h2>
            <p className="text-sm text-gray-500 mb-5">
              {vehicle.make} {vehicle.model} — {vehicle.vin}
            </p>
            {fullDelivery ? (
              <p className="text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200 mb-4">
                A delivery record already exists for this vehicle. Go to the Deliveries page to manage it.
              </p>
            ) : (
              <p className="text-sm text-gray-500">Use the Deliveries page to create and schedule a delivery for this vehicle.</p>
            )}
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setScheduleModal(false)} className="btn-secondary text-sm">
                Close
              </button>
              <Link to="/deliveries" className="btn-primary text-sm">
                Go to Deliveries
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
