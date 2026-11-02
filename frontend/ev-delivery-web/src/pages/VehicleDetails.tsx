import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Gauge,
  Zap,
  Clock,
  ChevronRight,
  CheckCircle2,
  Circle,
  CalendarDays,
  Navigation,
  Building2,
  Settings,
  Car,
  FileText,
  Code2,
  ClipboardCheck,
  RefreshCw,
  Battery,
  Layers,
  Wrench,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { vehicleApi } from '../services/vehicleService'
import { deliveryApi } from '../services/deliveryService'
import { LoadingSpinner, ErrorMessage, StatusBadge } from '../components/ui'
import Vehicle3DViewer from '../components/vehicle/Vehicle3DViewer'
import VehicleRevisionsTracker from '../components/vehicle/VehicleRevisionsTracker'
import VehicleCheckoutModal from '../components/vehicle/VehicleCheckoutModal'
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_COLORS,
  VEHICLE_STATUS_STEPS,
  DELIVERY_METHOD_LABELS,
  CHECKLIST_LABELS,
  formatDate,
  formatDateTime,
  formatRelative,
  getVehicleBrand,
  getVehicleModel,
  getVehicleVersion,
  getVehicleOdometer,
  getVehicleBatteryPercentage,
  getVehicleBatteryCapacity,
  getVehicleRangeKm,
  normalizeVehicleStatus
} from '../lib/utils'
import type { Delivery, DeliveryChecklistItem } from '../types'

// ============================================================
// TIMELINE STEPS
// ============================================================
const TIMELINE_STEPS = [
  'OrderPlaced',
  'VinAssigned',
  'InTransit',
  'ReadyForDelivery',
  'Delivered',
]

function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const normalized = normalizeVehicleStatus(currentStatus)
  const currentIdx = VEHICLE_STATUS_STEPS.indexOf(normalized)

  const isStepDone = (step: string) =>
    VEHICLE_STATUS_STEPS.indexOf(step as any) < currentIdx
  const isStepActive = (step: string) => step === normalized

  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto py-2 no-scrollbar">
      {TIMELINE_STEPS.map((step, i) => {
        const done = isStepDone(step)
        const active = isStepActive(step)
        return (
          <div key={step} className="flex items-center flex-1 min-w-[120px]">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? 'bg-blue-600 dark:bg-cyan-500 border-blue-600 dark:border-cyan-500 text-white dark:text-slate-950 shadow-sm'
                    : active
                    ? 'bg-white dark:bg-slate-900 border-blue-600 dark:border-cyan-400 ring-4 ring-blue-100 dark:ring-cyan-500/20'
                    : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-white dark:text-slate-950 font-bold" />
                ) : active ? (
                  <div className="w-3 h-3 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300 dark:text-slate-600" />
                )}
              </div>
              <span
                className={`text-xs font-medium text-center leading-tight whitespace-nowrap ${
                  done || active ? 'text-blue-700 dark:text-cyan-400 font-semibold' : 'text-gray-400 dark:text-slate-500'
                }`}
              >
                {VEHICLE_STATUS_LABELS[step]}
              </span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 ${done ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-gray-200 dark:bg-slate-800'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ChecklistPanel({
  delivery,
  onToggle,
}: {
  delivery: Delivery
  onToggle: (item: DeliveryChecklistItem) => void
}) {
  const checklist = delivery.checklist ?? []
  const completed = checklist.filter(i => i.isCompleted).length
  const total = checklist.length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">PDI Checklist Oficial BYD</h3>
        <span className="text-xs font-medium text-blue-700 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-950/50 border border-blue-100 dark:border-cyan-800/40 px-2.5 py-0.5 rounded-full">
          {completed}/{total} checados
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-600 dark:bg-cyan-500 rounded-full transition-all duration-300"
          style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
        />
      </div>
      <div className="space-y-2">
        {checklist.map(item => (
          <button
            key={item.id}
            onClick={() => onToggle(item)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-colors ${
              item.isCompleted
                ? 'bg-green-50 dark:bg-emerald-950/30 border-green-200 dark:border-emerald-800/40'
                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-cyan-500/40 hover:bg-blue-50/50 dark:hover:bg-slate-800/60'
            }`}
          >
            {item.isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400 dark:text-slate-600 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${item.isCompleted ? 'text-green-800 dark:text-emerald-300' : 'text-gray-700 dark:text-slate-200'}`}>
                {CHECKLIST_LABELS[item.type] || item.type}
              </p>
              {!item.isMandatory && (
                <p className="text-[11px] text-gray-400 dark:text-slate-500">Opcional</p>
              )}
            </div>
            {!item.isCompleted && !item.isMandatory && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded font-medium">Pendente</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function InfoField({ label, value, icon: Icon }: {
  label: string
  value?: string
  icon?: React.ElementType
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />}
        <p className="text-[11px] text-gray-400 dark:text-slate-400 font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{value ?? '—'}</p>
    </div>
  )
}

type Tab = '3d' | 'details' | 'revisions' | 'checklist' | 'tasks' | 'json'

export default function VehicleDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('3d')
  const [scheduleModal, setScheduleModal] = useState(false)
  const [checkoutModal, setCheckoutModal] = useState(false)

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
        completedBy: 'Técnico DiLink',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', fullDelivery?.id] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      vehicleApi.updateStatus(id!, newStatus, 'Status atualizado pelo checkout de entrega.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    }
  })

  if (isLoading) return <LoadingSpinner text="Carregando telemetria e modelo 3D do veículo..." />
  if (error || !vehicle) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <ErrorMessage
          title="Veículo Não Encontrado"
          message="Não foi possível recuperar os dados do veículo informado."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const brand = getVehicleBrand(vehicle)
  const model = getVehicleModel(vehicle)
  const version = getVehicleVersion(vehicle)
  const odo = getVehicleOdometer(vehicle)
  const soc = getVehicleBatteryPercentage(vehicle)
  const batteryCap = getVehicleBatteryCapacity(vehicle)
  const rangeKm = getVehicleRangeKm(vehicle)
  const statusLabel = VEHICLE_STATUS_LABELS[vehicle.status]
  const statusColorClass = VEHICLE_STATUS_COLORS[vehicle.status]

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-[#080b11]">
      {/* Top Breadcrumb Bar */}
      <div className="flex-shrink-0 bg-white dark:bg-[#0c121e] border-b border-gray-200 dark:border-slate-800 px-6 sm:px-8 py-4 transition-colors flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/vehicles"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar aos Veículos</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" />
          <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-bold">
            {brand} {model} ({vehicle.year})
          </span>
        </div>

        {/* Action Button: Checkout Handover */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCheckoutModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-extrabold shadow-md hover:from-emerald-400 hover:to-teal-500 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Fazer Checkout & Entrega</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-8 py-6 space-y-6">

          {/* ── Order Progress Timeline Card ── */}
          <div className="card p-5 border border-gray-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pipeline de Entrega DiLink
              </span>
              <StatusBadge label={statusLabel} colorClass={statusColorClass} />
            </div>
            <OrderTimeline currentStatus={vehicle.status} />
          </div>

          {/* ── Tabs Navigation ── */}
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
            {[
              { id: '3d', label: 'Visualizador 3D & Chassi', icon: Layers },
              { id: 'revisions', label: 'Revisões & Manutenção', icon: Wrench },
              { id: 'details', label: 'Especificações do Chassi', icon: FileText },
              { id: 'checklist', label: 'PDI Checklist', icon: ClipboardCheck },
              { id: 'tasks', label: 'Tarefas de Oficina', icon: Settings },
              { id: 'json', label: 'Payload JSON', icon: Code2 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 -mb-px transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          {activeTab === '3d' && (
            <div className="space-y-6">
              {/* 3D Visualizer Component */}
              <Vehicle3DViewer
                modelName={`${brand} ${model} ${version}`}
                colorName={vehicle.color}
                batteryPercentage={soc}
                batteryCapacityKwh={batteryCap || 82}
                rangeKm={rangeKm || 450}
                vin={vehicle.vin}
              />
            </div>
          )}

          {activeTab === 'revisions' && (
            <VehicleRevisionsTracker
              vin={vehicle.vin}
              currentOdometerKm={odo}
              modelName={`${brand} ${model}`}
            />
          )}

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Details */}
              <div className="lg:col-span-2 card p-6 border border-gray-200/80 dark:border-slate-800 space-y-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Dados Técnicos do Chassi & Homologação
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  <InfoField label="Número do Chassi (VIN)" value={vehicle.vin} icon={Car} />
                  <InfoField
                    label="ETA Centro de Distribuição"
                    value={fullDelivery?.eta ? formatRelative(fullDelivery.eta) : 'Homologado'}
                    icon={Clock}
                  />
                  <InfoField label="Placa de Identificação" value={vehicle.licensePlate ?? 'Em Emplacamento'} icon={FileText} />
                  <InfoField
                    label="Método de Entrega"
                    value={fullDelivery?.method ? DELIVERY_METHOD_LABELS[fullDelivery.method] : 'Transporte Fechado Cegonha'}
                    icon={Car}
                  />
                  <InfoField
                    label="Centro de Entrega"
                    value={vehicle.deliveryCenter ?? fullDelivery?.deliveryCenter ?? 'São Paulo - SP'}
                    icon={Building2}
                  />
                  <InfoField
                    label="Odômetro de Entrega"
                    value={`${odo.toLocaleString()} km`}
                    icon={Gauge}
                  />
                  <InfoField
                    label="Localização Atual do Pátio"
                    value={vehicle.location ?? 'Pátio Principal de Desembarque'}
                    icon={MapPin}
                  />
                  <InfoField
                    label="Data de Cadastro no Sistema"
                    value={formatDate(vehicle.createdAt)}
                    icon={Calendar}
                  />
                </div>

                {/* Chassis Architecture Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs uppercase font-bold text-cyan-500">
                    Arquitetura e-Platform 3.0 & Especificações BYD
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Arquitetura de Bateria:</span>
                      <strong className="text-slate-800 dark:text-slate-200">CTB (Cell-to-Body) LFP Blade 800V</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Sistema de Suspensão:</span>
                      <strong className="text-slate-800 dark:text-slate-200">BYD DiSus Intelligent Body Control</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Trem de Força:</span>
                      <strong className="text-slate-800 dark:text-slate-200">Sistema 8 em 1 com Inversor SiC</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Software de Bordo:</span>
                      <strong className="text-slate-800 dark:text-slate-200">BYD DiLink OS v2.4 (5G OTA)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Battery Gauge & Status History */}
              <div className="space-y-6">
                {/* Battery Card */}
                <div className="card p-5 border border-gray-200/80 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Battery className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Diagnóstico da Bateria Blade</h3>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Nível de Carga (SoC):</span>
                      <span className={`font-bold ${soc >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{soc}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          soc >= 80
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        }`}
                        style={{ width: `${soc}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Capacidade:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{batteryCap || 82} kWh</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Autonomia:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{rangeKm || 450} km</span>
                    </div>
                  </div>
                </div>

                {/* Lifecycle History */}
                <div className="card p-5 border border-gray-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <RefreshCw className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Linha do Tempo de Status</h3>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {(vehicle.history ?? vehicle.statusHistory ?? []).map((h: any, idx: number) => (
                      <div key={h.id ?? idx} className="flex gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {VEHICLE_STATUS_LABELS[h.toStatus || h.status]}
                          </p>
                          <p className="text-[11px] text-slate-400">{formatDateTime(h.changedAt)}</p>
                          {h.notes && <p className="text-[11px] text-slate-500 italic mt-0.5">{h.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="card p-6 border border-gray-200/80 dark:border-slate-800">
              {fullDelivery ? (
                <ChecklistPanel
                  delivery={fullDelivery}
                  onToggle={item => toggleMutation.mutate({ item })}
                />
              ) : (
                <p className="text-sm text-gray-400 text-center py-12">
                  Nenhum registro de entrega vinculado a este veículo no momento.
                </p>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="card p-6 border border-gray-200/80 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tarefas da Oficina & PDI</h3>
              <p className="text-xs text-slate-400">
                Ações pendentes para liberação e transporte do veículo:
              </p>
              <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40 text-xs text-cyan-900 dark:text-cyan-300">
                Veículo com checklist em andamento. Todas as revisões preliminares de fábrica foram realizadas com sucesso.
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 overflow-x-auto">
              <pre className="text-xs text-cyan-400 font-mono leading-relaxed">
                {JSON.stringify({ vehicle, delivery: fullDelivery ?? null }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <VehicleCheckoutModal
        isOpen={checkoutModal}
        onClose={() => setCheckoutModal(false)}
        vehicle={vehicle}
        onCompleteCheckout={() => {
          statusMutation.mutate('DELIVERED')
          alert('Checkout concluído com sucesso! Veículo entregue ao cliente.')
        }}
      />
    </div>
  )
}
