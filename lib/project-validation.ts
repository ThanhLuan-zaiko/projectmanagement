import type { Project, ProjectFormData, ProjectFormErrors } from '@/types/project';

export const PROJECT_STATUSES: Project['status'][] = [
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
];

export interface SanitizedProjectInput {
  project_name: string;
  description: string;
  status: Project['status'];
  start_date: string | null;
  target_end_date: string | null;
  budget: number | null;
  currency: string;
}

function normalizeDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return '__invalid__';
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return '__invalid__';
  }

  return trimmed;
}

export function validateProjectFormData(
  input: Partial<ProjectFormData>
): { sanitizedData: SanitizedProjectInput | null; fieldErrors: ProjectFormErrors } {
  const fieldErrors: ProjectFormErrors = {};
  const projectName = (input.project_name || '').trim();
  const description = (input.description || '').trim();
  const status = input.status || 'planning';
  const startDate = normalizeDate(input.start_date);
  const targetEndDate = normalizeDate(input.target_end_date);
  const currency = (input.currency || 'USD').trim().toUpperCase();
  const budgetValue = input.budget === undefined ? '' : String(input.budget).trim();

  if (!projectName) {
    fieldErrors.project_name = 'Project name is required.';
  } else if (projectName.length < 3) {
    fieldErrors.project_name = 'Project name must be at least 3 characters.';
  } else if (projectName.length > 80) {
    fieldErrors.project_name = 'Project name must be 80 characters or fewer.';
  }

  if (description.length > 500) {
    fieldErrors.description = 'Description must be 500 characters or fewer.';
  }

  if (!PROJECT_STATUSES.includes(status)) {
    fieldErrors.status = 'Select a valid project status.';
  }

  if (startDate === '__invalid__') {
    fieldErrors.start_date = 'Start date is not valid.';
  } else if (startDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);

    if (startDateTime < today) {
      fieldErrors.start_date = 'Start date cannot be in the past.';
    }
  }

  if (targetEndDate === '__invalid__') {
    fieldErrors.target_end_date = 'Target end date is not valid.';
  }

  if (startDate && targetEndDate && startDate !== '__invalid__' && targetEndDate !== '__invalid__') {
    if (new Date(targetEndDate) < new Date(startDate)) {
      fieldErrors.target_end_date = 'Target end date must be on or after the start date.';
    }
  }

  let budget: number | null = null;

  if (budgetValue) {
    budget = Number(budgetValue);

    if (!Number.isFinite(budget)) {
      fieldErrors.budget = 'Budget must be a valid number.';
    } else if (budget < 0) {
      fieldErrors.budget = 'Budget cannot be negative.';
    } else if (budget > 999999999999) {
      fieldErrors.budget = 'Budget is too large.';
    }
  }

  if (!/^[A-Z]{3}$/.test(currency)) {
    fieldErrors.currency = 'Currency must be a 3-letter code like USD.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      sanitizedData: null,
      fieldErrors,
    };
  }

  return {
    sanitizedData: {
      project_name: projectName,
      description,
      status,
      start_date: startDate,
      target_end_date: targetEndDate,
      budget,
      currency,
    },
    fieldErrors,
  };
}

export function validateProjectCode(value: string): { value: string; error?: string } {
  const normalizedValue = value.trim().toUpperCase();

  if (!normalizedValue) {
    return {
      value: normalizedValue,
      error: 'Project code is required.',
    };
  }

  if (!/^PROJ-[A-Z0-9]{6,20}$/.test(normalizedValue)) {
    return {
      value: normalizedValue,
      error: 'Project code must look like PROJ-ABC12345.',
    };
  }

  return { value: normalizedValue };
}

export type ValidatableField = keyof Omit<ProjectFormData, 'project_leader_id'>;

export function validateProjectField(
  field: ValidatableField,
  formData: Partial<ProjectFormData>
): string | null {
  const validation = validateProjectFormData(formData);
  return (validation.fieldErrors as Record<string, string | undefined>)[field] ?? null;
}
