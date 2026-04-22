import {
  CONFIDENCE_LEVELS,
  COST_ESTIMATE_STATUSES,
  COST_ESTIMATE_TYPES,
  ESTIMATION_METHODS,
} from './constants';
import {
  finalizeValidation,
  hasValue,
  readCurrency,
  readEnumValue,
  readNullableDecimal,
  readNullableEnumValue,
  readNullableInteger,
  readNullableText,
  readRequiredUuid,
  toRecord,
} from './shared';
import type {
  CostEstimatePayload,
  ExpertEstimatePayload,
  FieldErrors,
  ValidationMode,
  ValidationResult,
} from './types';

export function validateCostEstimatePayload(
  input: unknown,
  mode: ValidationMode
): ValidationResult<CostEstimatePayload> {
  const data = toRecord(input);
  const fieldErrors: FieldErrors = {};
  const sanitized = {} as CostEstimatePayload;

  const projectId = readRequiredUuid(data, 'project_id', fieldErrors);
  if (projectId) sanitized.project_id = projectId;

  const workItemId = readRequiredUuid(data, 'work_item_id', fieldErrors);
  if (workItemId) sanitized.work_item_id = workItemId;

  const estimateType = readEnumValue(data, 'estimate_type', fieldErrors, COST_ESTIMATE_TYPES, {
    required: mode === 'create',
  });
  if (estimateType !== undefined) sanitized.estimate_type = estimateType;

  const estimatedCost = readNullableDecimal(data, 'estimated_cost', fieldErrors, {
    min: 0,
    max: 1000000000,
  });
  if (estimatedCost !== undefined) sanitized.estimated_cost = estimatedCost;

  const currency = hasValue(data, 'currency') ? readCurrency(data, 'currency', fieldErrors) : undefined;
  if (currency !== undefined) sanitized.currency = currency;

  const hourlyRate = readNullableDecimal(data, 'hourly_rate', fieldErrors, {
    min: 0,
    max: 1000000,
  });
  if (hourlyRate !== undefined) sanitized.hourly_rate = hourlyRate;

  const hours = readNullableDecimal(data, 'hours', fieldErrors, { min: 0, max: 100000 });
  if (hours !== undefined) sanitized.hours = hours;

  const quantity = readNullableInteger(data, 'quantity', fieldErrors, { min: 0, max: 1000000 });
  if (quantity !== undefined) sanitized.quantity = quantity;

  const unitCost = readNullableDecimal(data, 'unit_cost', fieldErrors, {
    min: 0,
    max: 1000000,
  });
  if (unitCost !== undefined) sanitized.unit_cost = unitCost;

  const notes = readNullableText(data, 'notes', fieldErrors, 1000);
  if (notes !== undefined) sanitized.notes = notes;

  const status = readEnumValue(data, 'status', fieldErrors, COST_ESTIMATE_STATUSES, {
    required: mode === 'create',
  });
  if (status !== undefined) sanitized.status = status;

  return finalizeValidation(fieldErrors, sanitized);
}

export function validateExpertEstimatePayload(
  input: unknown,
  _mode: ValidationMode
): ValidationResult<ExpertEstimatePayload> {
  const data = toRecord(input);
  const fieldErrors: FieldErrors = {};
  const sanitized = {} as ExpertEstimatePayload;

  const projectId = readRequiredUuid(data, 'project_id', fieldErrors);
  if (projectId) sanitized.project_id = projectId;

  const workItemId = readRequiredUuid(data, 'work_item_id', fieldErrors);
  if (workItemId) sanitized.work_item_id = workItemId;

  const expertId = readRequiredUuid(data, 'expert_id', fieldErrors);
  if (expertId) sanitized.expert_id = expertId;

  const estimatedHours = readNullableDecimal(data, 'estimated_hours', fieldErrors, {
    min: 0,
    max: 100000,
  });
  if (estimatedHours !== undefined) sanitized.estimated_hours = estimatedHours;

  const confidenceLevel = readNullableEnumValue(data, 'confidence_level', fieldErrors, CONFIDENCE_LEVELS);
  if (confidenceLevel !== undefined) sanitized.confidence_level = confidenceLevel;

  const estimationMethod = readNullableEnumValue(data, 'estimation_method', fieldErrors, ESTIMATION_METHODS);
  if (estimationMethod !== undefined) sanitized.estimation_method = estimationMethod;

  const optimisticHours = readNullableDecimal(data, 'optimistic_hours', fieldErrors, {
    min: 0,
    max: 100000,
  });
  if (optimisticHours !== undefined) sanitized.optimistic_hours = optimisticHours;

  const mostLikelyHours = readNullableDecimal(data, 'most_likely_hours', fieldErrors, {
    min: 0,
    max: 100000,
  });
  if (mostLikelyHours !== undefined) sanitized.most_likely_hours = mostLikelyHours;

  const pessimisticHours = readNullableDecimal(data, 'pessimistic_hours', fieldErrors, {
    min: 0,
    max: 100000,
  });
  if (pessimisticHours !== undefined) sanitized.pessimistic_hours = pessimisticHours;

  const notes = readNullableText(data, 'notes', fieldErrors, 1000);
  if (notes !== undefined) sanitized.notes = notes;

  if (
    sanitized.estimation_method === 'three_point' &&
    (sanitized.optimistic_hours === null ||
      sanitized.most_likely_hours === null ||
      sanitized.pessimistic_hours === null)
  ) {
    fieldErrors.estimation_method =
      'Three-point estimation requires optimistic, most likely, and pessimistic hours.';
  }

  return finalizeValidation(fieldErrors, sanitized);
}
