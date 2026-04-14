// Cost Estimate types for project cost estimation

export interface CostEstimate {
  work_item_id: string;
  project_id: string;
  estimate_id: string;
  estimate_type: 'labor' | 'material' | 'service' | 'overhead' | 'license';
  estimated_cost: number | null;
  currency: string;
  hourly_rate: number | null;
  hours: number | null;
  quantity: number | null;
  unit_cost: number | null;
  notes: string | null;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  estimated_at: string;
  estimated_by: string | null;
  approved_at: string | null;
  approved_by: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
  // Enriched fields from API
  work_item_title?: string | null;
}

export interface CostEstimateFormData {
  project_id: string;
  work_item_id: string;
  estimate_type: CostEstimate['estimate_type'];
  estimated_cost: string;
  currency: string;
  hourly_rate: string;
  hours: string;
  quantity: string;
  unit_cost: string;
  notes: string;
  status: CostEstimate['status'];
}

export type CostEstimateFilterType = 'all' | string;

export interface CostEstimateFilters {
  searchQuery: string;
  estimateType: CostEstimateFilterType;
  status: CostEstimateFilterType;
}

export interface CostEstimatePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
