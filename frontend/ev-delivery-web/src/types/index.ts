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
  | 'Delivered'
  | 'ORDERED'
  | 'VIN_ASSIGNED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'INSPECTION'
  | 'PREPARATION'
  | 'READY_FOR_DELIVERY'
  | 'DELIVERY_SCHEDULED'
  | 'DELIVERY_IN_PROGRESS'
  | 'DELIVERED';

export interface BatteryInfo {
  capacityKwh: number;
  rangeKm: number;
  chargingSpeedKw: number;
  healthSohPercentage?: number;
  temperatureCelsius?: number;
  voltageVolts?: number;
}

export interface VehicleStatusHistoryEntry {
  id: string;
  status: VehicleStatus | string;
  changedAt: string;
  changedBy: string;
  notes?: string;
}

export interface VehicleRevision {
  id: string;
  revisionNumber: number;
  name: string;
  recommendedKm: number;
  performedKm?: number;
  performedAt?: string;
  technicianName?: string;
  isCompleted: boolean;
  notes?: string;
  checklistPassedCount: number;
  checklistTotalCount: number;
}

export interface VehicleChassisInfo {
  platform: string; // e.g., "e-Platform 3.0 Evo"
  architecture: string; // e.g., "CTB (Cell-to-Body) 800V"
  motorConfiguration: string; // e.g., "Dual-Motor AWD (Dianteiro + Traseiro 530cv)"
  suspensionType: string; // e.g., "BYD DiSus Intelligent Body Control"
  brakes: string; // e.g., "Discos Ventilados Brembo com Recuperação Regenerativa CRBS"
  chassisVinMatch: boolean;
  batteryCellTechnology: string; // e.g., "LFP Blade Battery Ultra-Segura"
  curbWeightKg: number;
  maxTowingKg?: number;
}

export interface Vehicle {
  id: string;
  vin: string;
  brand?: string;
  make?: string;
  model: string;
  year: number;
  color: string;
  version?: string;
  trimLevel?: string;
  licensePlate?: string;
  status: VehicleStatus | string;
  batteryInfo?: BatteryInfo;
  batteryCapacityKwh?: number;
  batteryLevelPercentage?: number;
  estimatedRangeKm?: number;
  odometer?: number;
  odometerKm?: number;
  location?: string;
  deliveryCenter?: string;
  imageUrl?: string;
  category?: 'Ocean' | 'Dynasty' | 'Yangwang' | 'Fangchengbao' | 'Lançamentos' | string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: VehicleStatusHistoryEntry[];
  history?: Array<{
    id: string;
    vehicleId: string;
    fromStatus: string;
    toStatus: string;
    changedAt: string;
    changedBy: string;
    notes?: string;
  }>;
  revisions?: VehicleRevision[];
  chassisInfo?: VehicleChassisInfo;
}

export interface VehicleSummary {
  id: string;
  vin: string;
  brand?: string;
  make?: string;
  model: string;
  year: number;
  color: string;
  version?: string;
  trimLevel?: string;
  licensePlate?: string;
  status: VehicleStatus | string;
  odometer?: number;
  odometerKm?: number;
  batteryCapacityKwh?: number;
  batteryLevelPercentage?: number;
  estimatedRangeKm?: number;
  location?: string;
  deliveryCenter?: string;
  imageUrl?: string;
  createdAt: string;
}

// ============================================================
// CUSTOMER TYPES
// ============================================================

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  postalCode?: string;
  country?: string;
}

export interface Customer {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  phone: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  documentNumber?: string;
  address?: Address;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerSummary {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  phone: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  documentNumber?: string;
  createdAt?: string;
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
