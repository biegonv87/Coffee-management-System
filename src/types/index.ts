export type UserRole = 'Administrator' | 'Collection Officer' | 'Manager';

export interface User {
  user_id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  assigned_satellite?: string;
  phone?: string;
}

export interface Farmer {
  farmer_id: string; // Unique, e.g. K001
  farmer_name: string;
  phone: string;
  group: string; // Group Name
  satellite: string; // Satellite / Collection Centre
  farm_member_number: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at?: string;
}

export interface Harvest {
  harvest_id: string;
  receipt_number: string; // Unique e.g. CH-2026-000125
  farmer_id: string;
  farmer_name: string;
  group: string;
  satellite: string;
  collection_date: string; // YYYY-MM-DD
  cherry_heavy: number; // kg
  cherry_light: number; // kg
  mbuni: number; // kg
  total_kg: number; // CH + CL + MB
  collection_point: string;
  recorded_by: string; // User name
  remarks?: string;
  created_at: string;
  updated_at?: string;
  is_synced?: boolean; // For offline synchronization tracking
}

export interface CoffeeGroup {
  group_id: string;
  group_name: string;
  description?: string;
}

export interface Satellite {
  satellite_id: string;
  satellite_name: string;
  location?: string;
}

export interface AuditLog {
  audit_id: string;
  user_id: string;
  user_name: string;
  harvest_id: string;
  action: 'CREATE' | 'CORRECTION' | 'DELETE_ATTEMPT';
  old_value: string; // JSON string of previous state
  new_value: string; // JSON string of new state
  reason: string;
  timestamp: string;
}

export interface MonthlyFarmerSummary {
  farmer_id: string;
  farmer_name: string;
  group: string;
  satellite: string;
  heavy_total: number;
  light_total: number;
  mbuni_total: number;
  overall_total: number;
  delivery_count: number;
  deliveries: Harvest[];
}

export interface MonthlyGrandTotal {
  heavy_total: number;
  light_total: number;
  mbuni_total: number;
  grand_total: number;
  farmer_count: number;
  delivery_count: number;
}
