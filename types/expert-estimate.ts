// Expert Estimate types

export interface ExpertTimeEstimate {
  estimate_id: string;
  work_item_id: string;
  project_id: string;
  expert_id: string;
  estimated_hours: number | null;
  confidence_level: 'low' | 'medium' | 'high' | null;
  estimation_method: 'expert_judgment' | 'planning_poker' | 'three_point' | 'delphi' | null;
  optimistic_hours: number | null;
  most_likely_hours: number | null;
  pessimistic_hours: number | null;
  notes: string | null;
  estimated_at: string;
  updated_at?: string;
  estimated_by: string | null;
  expert_name?: string;
  work_item_title?: string;
  // Soft delete fields
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface ExpertEstimateFormData {
  project_id: string;
  work_item_id: string;
  expert_id: string;
  estimated_hours: string;
  confidence_level: string;
  estimation_method: string;
  optimistic_hours: string;
  most_likely_hours: string;
  pessimistic_hours: string;
  notes: string;
}

export interface ExpertProjectSummary {
  project_id: string;
  expert_id: string;
  total_estimated_hours: number | null;
  total_work_items: number | null;
  average_confidence: string | null;
  completed_estimates: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  expert_name?: string;
}

export interface ExpertEstimateStatistics {
  totalEstimates: number;
  totalHours: number;
  averageConfidence: string;
  estimatesByMethod: Record<string, number>;
  estimatesByConfidence: Record<string, number>;
}

export interface ExpertEstimateSummary {
  statistics: ExpertEstimateStatistics;
  expertSummaries: ExpertProjectSummary[];
}

export type FilterType = 'all' | string;

export interface ExpertEstimateFilters {
  projectId: string;
  workItemId: string;
  expertId: string;
  confidence: FilterType;
  method: FilterType;
}
