import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Car,
  Search,
  ChevronRight,
  Gauge,
  Zap,
  Layers,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Compass,
  BatteryCharging,
  Eye,
  ShieldCheck,
  Plus,
  X,
  Palette,
  CheckCircle2,
  Cpu
} from 'lucide-react'
import { vehicleApi } from '../services/vehicleService'
import { LoadingSpinner, ErrorMessage, EmptyState, StatusBadge } from '../components/ui'
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_COLORS,
  getVehicleBrand,
  getVehicleModel,
  getVehicleVersion,
  getVehicleOdometer,
  getVehicleBatteryPercentage,
  getVehicleRangeKm
} from '../lib/utils'

type CategoryFilter =
  | 'all'
  | 'ocean'
  | 'dynasty'
  | 'yangwang'
  | 'launches'
  | 'suv'
  | 'sedan'
  | 'pickup'

const CATEGORY_TABS: { id: CategoryFilter; label: string; count?: number }[] = [
  { id: 'all', label: 'Todos os Veículos' },
  { id: 'launches', label: '🚀 Lançamentos 2026/2027' },
  { id: 'ocean', label: '🌊 Linha Ocean' },
  { id: 'dynasty', label: '👑 Linha Dynasty' },
  { id: 'yangwang', label: '⚡ Supercarros Yangwang' },
  { id: 'suv', label: '🚙 SUVs Elétricos' },
  { id: 'sedan', label: '🏎️ Sedans' },
  { id: 'pickup', label: '🛻 Picapes & DMO' },
]

export default function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    brand: 'BYD',
    model: 'Dolphin Mini',
    version: 'EV 75hp',
    year: 2026,
    color: 'Rosa Dolphin',
    vin: 'LC0C74C4XR9' + Math.floor(100000 + Math.random() * 900000),
    batteryCapacityKwh: 38.0,
    batteryLevelPercentage: 100,
    estimatedRangeKm: 380,
    odometerKm: 0.0,
    licensePlate: '',
    deliveryCenter: 'São Paulo - SP',
  })

  const queryClient = useQueryClient()

  const generateRandomVin = () => {
    const chars = '0123456789ABCDEFGHJKLMNPRSTUVWXYZ'
    let rand = ''
    for (let i = 0; i < 7; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewVehicle(prev => ({
      ...prev,
      vin: `LC0C74C4XR${rand}`
    }))
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll(1, 100),
  })

  const createVehicleMutation = useMutation({
    mutationFn: vehicleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setIsAddModalOpen(false)
      alert('Novo veículo cadastrado com sucesso e integrado ao modelo 3D!')
    },
    onError: (err: any) => {
      alert(`Erro ao cadastrar veículo: ${err?.message || 'Verifique os dados informados.'}`)
    }
  })

  const vehicles = useMemo(() => data?.items ?? [], [data])

  // Helper to categorize vehicles
  const matchCategory = (v: any, cat: CategoryFilter): boolean => {
    if (cat === 'all') return true
    const model = (getVehicleModel(v) || '').toLowerCase()
    const brand = (getVehicleBrand(v) || '').toLowerCase()
    const version = (getVehicleVersion(v) || '').toLowerCase()

    if (cat === 'launches') {
      return (
        v.year >= 2026 ||
        model.includes('yangwang') ||
        model.includes('u9') ||
        model.includes('u8') ||
        model.includes('shark') ||
        model.includes('bao') ||
        model.includes('sea lion')
      )
    }

    if (cat === 'yangwang') {
      return model.includes('yangwang') || model.includes('u9') || model.includes('u8')
    }

    if (cat === 'ocean') {
      return (
        model.includes('seal') ||
        model.includes('dolphin') ||
        model.includes('sea lion') ||
        model.includes('seagull')
      )
    }

    if (cat === 'dynasty') {
      return (
        model.includes('han') ||
        model.includes('tang') ||
        model.includes('song') ||
        model.includes('yuan')
      )
    }

    if (cat === 'suv') {
      return (
        model.includes('song') ||
        model.includes('yuan') ||
        model.includes('tang') ||
        model.includes('u8') ||
        model.includes('bao') ||
        model.includes('sea lion')
      )
    }

    if (cat === 'sedan') {
      return model.includes('seal') || model.includes('han') || model.includes('u9')
    }

    if (cat === 'pickup') {
      return model.includes('shark') || model.includes('bao')
    }

    return true
  }

  const filtered = useMemo(() => {
    return vehicles.filter(v => {
      const brand = getVehicleBrand(v)
      const model = getVehicleModel(v)
      const vin = v.vin ?? ''
      const plate = v.licensePlate ?? ''

      const matchSearch =
        !search ||
        `${brand} ${model} ${vin} ${plate}`.toLowerCase().includes(search.toLowerCase())

      const matchCat = matchCategory(v, category)
      const matchStatus = statusFilter === 'all' || v.status === statusFilter

      return matchSearch && matchCat && matchStatus
    })
  }, [vehicles, search, category, statusFilter])

  if (isLoading) return <LoadingSpinner text="Carregando inventário de frotas e lançamentos BYD..." />
  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <ErrorMessage
          title="Erro ao Conectar à API de Veículos"
          message="Não foi possível recuperar os veículos da frota. Verifique se o Gateway está em execução na porta 5000."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-[1550px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-semibold">
              BYD DiLink Fleet Control
            </span>
            <span className="text-xs text-slate-400">· e-Platform 3.0 & DMO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Catálogo & Categorias de Veículos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Gerenciamento de frotas, inspeção 3D de chassi, telemetria da bateria Blade e lançamentos oficiais.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Veículo & 3D</span>
          </button>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title="Visualização em Cards 3D"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title="Visualização em Tabela"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation (Substitui as categorias antigas) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {CATEGORY_TABS.map(tab => {
          const isActive = category === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-cyan-500/40 hover:text-cyan-600 dark:hover:text-cyan-400'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Search and Secondary Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Modelo (ex: Yangwang, Seal, Han), Chassi ou Placa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-sm"
          />
        </div>

        {/* Counter Badge */}
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>Mostrando <strong className="text-slate-900 dark:text-white font-bold">{filtered.length}</strong> de {vehicles.length} veículos cadastrados</span>
        </div>
      </div>

      {/* Main Content: Grid vs Table */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <EmptyState
            icon={<Car className="w-16 h-16 text-slate-400" />}
            title="Nenhum veículo encontrado nesta categoria"
            description="Tente alterar a categoria selecionada acima ou limpar o campo de busca."
          />
        </div>
      ) : viewMode === 'grid' ? (
        /* 3D CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(v => {
            const brand = getVehicleBrand(v)
            const model = getVehicleModel(v)
            const version = getVehicleVersion(v)
            const odo = getVehicleOdometer(v)
            const soc = getVehicleBatteryPercentage(v)
            const range = getVehicleRangeKm(v)
            const statusLabel = VEHICLE_STATUS_LABELS[v.status]
            const statusColor = VEHICLE_STATUS_COLORS[v.status]

            const isLaunch =
              v.year >= 2026 ||
              model.toLowerCase().includes('yangwang') ||
              model.toLowerCase().includes('shark') ||
              model.toLowerCase().includes('bao')

            return (
              <div
                key={v.id}
                className="group rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/60 dark:hover:border-cyan-500/50 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Vehicle Banner with Glow */}
                <div className="relative h-44 bg-gradient-to-br from-slate-900 via-[#0a0f1d] to-slate-950 p-5 flex flex-col justify-between overflow-hidden">
                  {/* Ambient Glow */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 z-10">
                    <span className={`status-badge text-[10px] font-semibold ${statusColor}`}>
                      {statusLabel}
                    </span>

                    {isLaunch && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        Lançamento {v.year}
                      </span>
                    )}
                  </div>

                  {/* Title & Version */}
                  <div className="z-10 mt-auto">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-cyan-400">
                      {brand}
                    </p>
                    <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug group-hover:text-cyan-300 transition-colors">
                      {model}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                      {version} · {v.color}
                    </p>
                  </div>
                </div>

                {/* Card Body - Telemetry & Specs */}
                <div className="p-5 space-y-4 flex-1">
                  {/* Battery SoC & Range Bar */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                        <Zap className="w-3.5 h-3.5 text-cyan-500" />
                        Bateria Blade (SoC)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-extrabold ${soc >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {soc}%
                        </span>
                        {soc === 100 && (
                          <span className="text-[9px] uppercase font-bold text-emerald-400 px-1 rounded bg-emerald-950 border border-emerald-800/40">
                            100% Carga
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Battery Bar */}
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          soc >= 80
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        }`}
                        style={{ width: `${soc}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>Autonomia: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{range} km</strong></span>
                      <span>Capacidade: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{v.batteryCapacityKwh ?? 82} kWh</strong></span>
                    </div>
                  </div>

                  {/* Chassis VIN & Odometer */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Chassi (VIN)</p>
                      <p className="font-mono text-slate-700 dark:text-slate-300 font-semibold truncate mt-0.5" title={v.vin}>
                        {v.vin}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Odômetro</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                        {odo.toLocaleString()} km
                      </p>
                    </div>
                  </div>

                  {v.deliveryCenter && (
                    <p className="text-[11px] text-slate-400 truncate">
                      📍 Centro: <span className="text-slate-600 dark:text-slate-300 font-medium">{v.deliveryCenter}</span>
                    </p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-0">
                  <Link
                    to={`/vehicles/${v.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-cyan-600 dark:bg-slate-800/80 dark:hover:bg-cyan-600 text-slate-800 dark:text-slate-200 hover:text-white dark:hover:text-white font-bold text-xs transition-all shadow-sm group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 group-hover:text-white"
                  >
                    <Layers className="w-4 h-4 text-cyan-400 group-hover:text-white transition-colors" />
                    <span>Ver Modelo 3D & Chassi</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="card overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Modelo</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Chassi (VIN)</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Bateria (SoC)</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Autonomia</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="w-12 px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map(v => {
                const brand = getVehicleBrand(v)
                const model = getVehicleModel(v)
                const soc = getVehicleBatteryPercentage(v)
                const range = getVehicleRangeKm(v)
                const statusLabel = VEHICLE_STATUS_LABELS[v.status]
                const statusColor = VEHICLE_STATUS_COLORS[v.status]

                return (
                  <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-cyan-500">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <Link
                            to={`/vehicles/${v.id}`}
                            className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors"
                          >
                            {brand} {model}
                          </Link>
                          <p className="text-xs text-slate-400">{v.year} · {v.color}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {v.vin}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${soc >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {soc}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${soc >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${soc}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {range} km
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-badge text-[10px] ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/vehicles/${v.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Ver 3D & Detalhes"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white space-y-5 my-8 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Cadastrar Novo Veículo na Frota
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    O veículo será inserido na base e renderizado automaticamente no motor 3D.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={e => {
                e.preventDefault()
                createVehicleMutation.mutate(newVehicle)
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Marca / Divisão</label>
                  <select
                    value={newVehicle.brand}
                    onChange={e => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
                  >
                    <option value="BYD">BYD (Geral)</option>
                    <option value="Yangwang">Yangwang (Supercarros & Luxo)</option>
                    <option value="Fangchengbao">Fangchengbao (DMO Off-road)</option>
                    <option value="Denza">Denza (Executivos & Minivans)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dolphin Mini, Shark, Denza Z9 GT"
                    value={newVehicle.model}
                    onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Versão / Powertrain</label>
                  <input
                    type="text"
                    placeholder="Ex: EV AWD 530hp, DM-i Premium"
                    value={newVehicle.version}
                    onChange={e => setNewVehicle({ ...newVehicle, version: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Ano Modelo</label>
                  <select
                    value={newVehicle.year}
                    onChange={e => setNewVehicle({ ...newVehicle, year: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026 (Lançamento)</option>
                    <option value={2027}>2027 (Protótipo Homologado)</option>
                  </select>
                </div>
              </div>

              {/* VIN / Chassi with Auto Generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Chassi Identificador (VIN de 17 caracteres) *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomVin}
                    className="text-[11px] text-cyan-500 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Cpu className="w-3 h-3" />
                    Gerar Chassi Automático
                  </button>
                </div>
                <input
                  type="text"
                  required
                  maxLength={17}
                  placeholder="LC0C74C4XR1234567"
                  value={newVehicle.vin}
                  onChange={e => setNewVehicle({ ...newVehicle, vin: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono font-bold tracking-wider"
                />
              </div>

              {/* Cor com seletor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Nome da Cor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rosa Dolphin, Verde Montanha"
                    value={newVehicle.color}
                    onChange={e => setNewVehicle({ ...newVehicle, color: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Placa (Opcional)</label>
                  <input
                    type="text"
                    placeholder="BRA2E26"
                    value={newVehicle.licensePlate}
                    onChange={e => setNewVehicle({ ...newVehicle, licensePlate: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Bateria & Autonomia */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Capacidade (kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVehicle.batteryCapacityKwh}
                    onChange={e => setNewVehicle({ ...newVehicle, batteryCapacityKwh: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Carga Inicial (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newVehicle.batteryLevelPercentage}
                    onChange={e => setNewVehicle({ ...newVehicle, batteryLevelPercentage: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Autonomia (km)</label>
                  <input
                    type="number"
                    value={newVehicle.estimatedRangeKm}
                    onChange={e => setNewVehicle({ ...newVehicle, estimatedRangeKm: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Centro de Entrega</label>
                <input
                  type="text"
                  value={newVehicle.deliveryCenter}
                  onChange={e => setNewVehicle({ ...newVehicle, deliveryCenter: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createVehicleMutation.isPending}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{createVehicleMutation.isPending ? 'Salvando na Base...' : 'Cadastrar e Abrir no 3D'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
