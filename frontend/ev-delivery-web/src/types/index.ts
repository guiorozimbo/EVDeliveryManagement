// ============================================================
// VEHICLE TYPES
// ============================================================

export type VehicleStatus =
  | 'OrderPlaced'
  | 'VinAssigned'
  | 'InTransit'
  | 'Received'
  | 'Inspection'
  | 'Preparation'
  | 'ReadyForDelivery'
  | 'DeliveryScheduled'
  | 'DeliveryInProgress'
  | 'Delivered';

export interface BatteryInfo {
  capacityKwh: number;
  rangeKm: number;
  chargingSpeedKw: number;
}

export interface VehicleStatusHistoryEntry {
  id: string;
  status: VehicleStatus;
  changedAt: string;
  changedBy: string;
  notes?: string;
}

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  trimLevel: string;
  licensePlate?: string;
  status: VehicleStatus;
  batteryInfo: BatteryInfo;
  odometer: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: VehicleStatusHistoryEntry[];
}

export interface VehicleSummary {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  trimLevel: string;
  licensePlate?: string;
  status: VehicleStatus;
  odometer: number;
  createdAt: string;
}

// ============================================================
// CUSTOMER TYPES
// ============================================================

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSummary {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
}

// ============================================================
// DELIVERY TYPES
// ============================================================

export type DeliveryStatus =
  | 'Scheduled'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled';

export type DeliveryMethod =
  | 'HomeDelivery'
  | 'DealerPickup'
  | 'AutoTransport';

export type ChecklistType =
  | 'Battery'
  | 'Tires'
  | 'Lights'
  | 'Multimedia'
  | 'ADAS'
  | 'Accessories'
  | 'Documentation'
  | 'Cleaning';

export interface DeliveryChecklistItem {
  id: string;
  type: ChecklistType;
  description: string;
  isCompleted: boolean;
  isMandatory: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface Delivery {
  id: string;
  vehicleId: string;
  vehicleVin?: string;
  vehicleModel?: string;
  customerId: string;
  customerName?: string;
  status: DeliveryStatus;
  method: DeliveryMethod;
  deliveryCenter: string;
  scheduledDate?: string;
  deliveryWindowStart?: string;
  deliveryWindowEnd?: string;
  appointmentDate?: string;
  eta?: string;
  vehicleLocation?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  notes?: string;
  checklist: DeliveryChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliverySummary {
  id: string;
  vehicleId: string;
  vehicleVin?: string;
  vehicleModel?: string;
  customerId: string;
  customerName?: string;
  status: DeliveryStatus;
  method: DeliveryMethod;
  deliveryCenter: string;
  scheduledDate?: string;
  createdAt: string;
}

// ============================================================
// AUTH TYPES
// ============================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  expiresAt: string;
}

export interface AuthUser {
  email: string;
  role: string;
  token: string;
}

// ============================================================
// API TYPES
// ============================================================

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
