// Expert types

export interface Expert {
  expert_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  specialization: string[];
  experience_years: number | null;
  hourly_rate: number | null;
  currency: string | null;
  availability_status: 'available' | 'busy' | 'unavailable' | null;
  rating: number | null;
  is_active: boolean | null;
  created_at: string;
}

export interface ExpertFormData {
  name: string;
  email: string;
  specialization: string;
  experience_years: string;
  hourly_rate: string;
  currency: string;
  availability_status: string;
  is_active: boolean;
}

export type ExpertFilterType = 'all' | string;

export interface ExpertFilters {
  search: string;
  availabilityStatus: ExpertFilterType;
  isActive: ExpertFilterType;
}
