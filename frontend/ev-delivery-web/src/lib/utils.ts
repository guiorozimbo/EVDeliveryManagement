import type { VehicleStatus, DeliveryStatus, DeliveryMethod, ChecklistType } from '../types'

// ============================================================
// VEHICLE STATUS
// ============================================================

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

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  OrderPlaced: 'Order Placed',
  VinAssigned: 'VIN Assigned',
  InTransit: 'In Transit',
  Received: 'Received',
  Inspection: 'Inspection',
  Preparation: 'Preparation',
  ReadyForDelivery: 'Ready for Delivery',
  DeliveryScheduled: 'Delivery Scheduled',
  DeliveryInProgress: 'Delivery in Progress',
  Delivered: 'Delivered',
}

export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, string> = {
  OrderPlaced: 'bg-gray-100 text-gray-700',
  VinAssigned: 'bg-blue-100 text-blue-700',
  InTransit: 'bg-orange-100 text-orange-700',
  Received: 'bg-cyan-100 text-cyan-700',
  Inspection: 'bg-purple-100 text-purple-700',
  Preparation: 'bg-yellow-100 text-yellow-700',
  ReadyForDelivery: 'bg-green-100 text-green-700',
  DeliveryScheduled: 'bg-blue-100 text-blue-700',
  DeliveryInProgress: 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
}

export const getVehicleStatusIndex = (status: VehicleStatus) =>
  VEHICLE_STATUS_STEPS.indexOf(status)

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
  Scheduled: 'bg-blue-100 text-blue-700',
  InProgress: 'bg-orange-100 text-orange-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
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
