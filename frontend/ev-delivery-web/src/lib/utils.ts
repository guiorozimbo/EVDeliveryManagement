import type { VehicleStatus, DeliveryStatus, DeliveryMethod, ChecklistType } from '../types'

// ============================================================
// VEHICLE STATUS NORMALIZATION & LABELS
// ============================================================

export const normalizeVehicleStatus = (status?: string): VehicleStatus => {
  if (!status) return 'OrderPlaced'
  const s = status.toUpperCase().replace(/\s+/g, '_')
  switch (s) {
    case 'ORDERED':
    case 'ORDERPLACED':
    case 'ORDER_PLACED':
      return 'OrderPlaced'
    case 'VIN_ASSIGNED':
    case 'VINASSIGNED':
      return 'VinAssigned'
    case 'IN_TRANSIT':
    case 'INTRANSIT':
      return 'InTransit'
    case 'RECEIVED':
      return 'Received'
    case 'INSPECTION':
      return 'Inspection'
    case 'PREPARATION':
      return 'Preparation'
    case 'READY_FOR_DELIVERY':
    case 'READYFORDELIVERY':
      return 'ReadyForDelivery'
    case 'DELIVERY_SCHEDULED':
    case 'DELIVERYSCHEDULED':
      return 'DeliveryScheduled'
    case 'DELIVERY_IN_PROGRESS':
    case 'DELIVERYINPROGRESS':
      return 'DeliveryInProgress'
    case 'DELIVERED':
      return 'Delivered'
    default:
      return (status as VehicleStatus) || 'OrderPlaced'
  }
}

export const VEHICLE_STATUS_STEPS: VehicleStatus[] = [
  'OrderPlaced',
  'VinAssigned',
  'InTransit',
  'Received',
  'Inspection',
  'Preparation',
  'ReadyForDelivery',
  'DeliveryScheduled',
  'DeliveryInProgress',
  'Delivered',
]

const RAW_STATUS_LABELS: Record<string, string> = {
  OrderPlaced: 'Order Placed',
  VinAssigned: 'VIN Assigned',
  InTransit: 'In Transit',
  Received: 'Received',
  Inspection: 'PDI Inspection',
  Preparation: 'Preparation',
  ReadyForDelivery: 'Ready for Delivery',
  DeliveryScheduled: 'Delivery Scheduled',
  DeliveryInProgress: 'Delivery in Progress',
  Delivered: 'Delivered',
  ORDERED: 'Order Placed',
  VIN_ASSIGNED: 'VIN Assigned',
  IN_TRANSIT: 'In Transit',
  RECEIVED: 'Received',
  INSPECTION: 'PDI Inspection',
  PREPARATION: 'Preparation',
  READY_FOR_DELIVERY: 'Ready for Delivery',
  DELIVERY_SCHEDULED: 'Delivery Scheduled',
  DELIVERY_IN_PROGRESS: 'Delivery in Progress',
  DELIVERED: 'Delivered',
}

const RAW_STATUS_COLORS: Record<string, string> = {
  OrderPlaced: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  VinAssigned: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800/40',
  InTransit: 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-transparent dark:border-orange-800/40',
  Received: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-transparent dark:border-cyan-800/40',
  Inspection: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-transparent dark:border-purple-800/40',
  Preparation: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-transparent dark:border-amber-800/40',
  ReadyForDelivery: 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 border border-transparent dark:border-green-800/40',
  DeliveryScheduled: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800/40',
  DeliveryInProgress: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-transparent dark:border-indigo-800/40',
  Delivered: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40',
  ORDERED: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  VIN_ASSIGNED: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800/40',
  IN_TRANSIT: 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-transparent dark:border-orange-800/40',
  RECEIVED: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-transparent dark:border-cyan-800/40',
  INSPECTION: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-transparent dark:border-purple-800/40',
  PREPARATION: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-transparent dark:border-amber-800/40',
  READY_FOR_DELIVERY: 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 border border-transparent dark:border-green-800/40',
  DELIVERY_SCHEDULED: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800/40',
  DELIVERY_IN_PROGRESS: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-transparent dark:border-indigo-800/40',
  DELIVERED: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40',
}

export const VEHICLE_STATUS_LABELS: Record<string, string> = new Proxy(RAW_STATUS_LABELS, {
  get: (target, prop: string) => target[prop] || RAW_STATUS_LABELS[normalizeVehicleStatus(prop)] || prop || 'Status',
})

export const VEHICLE_STATUS_COLORS: Record<string, string> = new Proxy(RAW_STATUS_COLORS, {
  get: (target, prop: string) => target[prop] || RAW_STATUS_COLORS[normalizeVehicleStatus(prop)] || 'bg-slate-100 text-slate-700',
})

export const getVehicleStatusIndex = (status?: string) => {
  const normalized = normalizeVehicleStatus(status)
  return VEHICLE_STATUS_STEPS.indexOf(normalized)
}

// Helpers for unified access across vehicle shapes
export const getVehicleBrand = (v: any) => v?.brand || v?.make || 'BYD'
export const getVehicleModel = (v: any) => v?.model || 'Modelo'
export const getVehicleVersion = (v: any) => v?.version || v?.trimLevel || 'Standard'
export const getVehicleOdometer = (v: any) => Number(v?.odometerKm ?? v?.odometer ?? 0)
export const getVehicleBatteryPercentage = (v: any) => Number(v?.batteryLevelPercentage ?? v?.batteryInfo?.levelPercentage ?? 100)
export const getVehicleBatteryCapacity = (v: any) => Number(v?.batteryCapacityKwh ?? v?.batteryInfo?.capacityKwh ?? 0)
export const getVehicleRangeKm = (v: any) => Number(v?.estimatedRangeKm ?? v?.batteryInfo?.rangeKm ?? 0)

// Customer helpers
export const getCustomerFullName = (c: any): string => {
  if (!c) return 'Cliente'
  if (c.name && typeof c.name === 'string' && c.name.trim()) return c.name.trim()
  if (c.fullName && typeof c.fullName === 'string' && c.fullName.trim()) return c.fullName.trim()
  const first = c.firstName || ''
  const last = c.lastName || ''
  const combined = `${first} ${last}`.trim()
  return combined || c.email?.split('@')[0] || 'Cliente BYD'
}

export const getCustomerInitials = (c: any): string => {
  const name = getCustomerFullName(c)
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  if (parts.length === 1 && parts[0].length >= 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return 'CL'
}

// ============================================================
// DELIVERY STATUS
// ============================================================

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  Scheduled: 'Scheduled',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
}

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  Scheduled: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300',
  InProgress: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300',
  Completed: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300',
  Cancelled: 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300',
}

// ============================================================
// DELIVERY METHOD
// ============================================================

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  HomeDelivery: 'Home Delivery',
  DealerPickup: 'Dealer Pickup',
  AutoTransport: 'Auto Transport',
}

// ============================================================
// CHECKLIST
// ============================================================

export const CHECKLIST_LABELS: Record<ChecklistType, string> = {
  Battery: 'Battery Inspection',
  Tires: 'Tires & Wheels',
  Lights: 'Lights & Signals',
  Multimedia: 'Multimedia System',
  ADAS: 'ADAS & Safety Systems',
  Accessories: 'Accessories & Keys',
  Documentation: 'Documentation',
  Cleaning: 'Final Cleaning',
}

// ============================================================
// DATE FORMATTING
// ============================================================

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatRelative = (dateStr?: string): string => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0) return `In ${diffDays} days`
  return `${Math.abs(diffDays)} days ago`
}

// ============================================================
// MISC
// ============================================================

export const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(' ')
