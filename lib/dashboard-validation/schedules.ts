import {
  PROJECT_SCHEDULE_STATUSES,
  PROJECT_SCHEDULE_TYPES,
  WORK_SCHEDULE_STATUSES,
} from './constants';
import {
  finalizeValidation,
  hasValue,
  readBoolean,
  readEnumValue,
  readNullableDecimal,
  readOptionalDate,
  readOptionalUuid,
  readRequiredDate,
  readRequiredUuid,
  readStringArray,
  readTrimmedString,
  toRecord,
} from './shared';
import type {
  FieldErrors,
  ProjectSchedulePayload,
  ValidationMode,
  ValidationResult,
  WorkSchedulePayload,
} from './types';

export function validateProjectSchedulePayload(
  input: unknown,
  mode: ValidationMode
): ValidationResult<ProjectSchedulePayload> {
  const data = toRecord(input);
  const fieldErrors: FieldErrors = {};
  const sanitized = {} as ProjectSchedulePayload;

  const projectId = readRequiredUuid(data, 'project_id', fieldErrors);
  if (projectId) sanitized.project_id = projectId;

  const scheduleName = readTrimmedString(data, 'schedule_name', fieldErrors, {
    required: mode === 'create',
    min: mode === 'create' ? 2 : undefined,
    max: 120,
  });
  if (scheduleName !== undefined) sanitized.schedule_name = scheduleName;

  const scheduleType = readEnumValue(data, 'schedule_type', fieldErrors, PROJECT_SCHEDULE_TYPES, {
    required: mode === 'create',
  });
  if (scheduleType !== undefined) sanitized.schedule_type = scheduleType;

  const startDate =
    mode === 'create'
      ? readRequiredDate(data, 'start_date', fieldErrors)
      : hasValue(data, 'start_date')
        ? readOptionalDate(data, 'start_date', fieldErrors)
        : undefined;
  if (startDate !== undefined) sanitized.start_date = startDate;

  const endDate =
    mode === 'create'
      ? readRequiredDate(data, 'end_date', fieldErrors)
      : hasValue(data, 'end_date')
        ? readOptionalDate(data, 'end_date', fieldErrors)
        : undefined;
  if (endDate !== undefined) sanitized.end_date = endDate;

  const status = readEnumValue(data, 'status', fieldErrors, PROJECT_SCHEDULE_STATUSES);
  if (status !== undefined) sanitized.status = status;

  const progressPercentage = readNullableDecimal(data, 'progress_percentage', fieldErrors, {
    min: 0,
    max: 100,
  });
  if (progressPercentage !== undefined) sanitized.progress_percentage = progressPercentage;

  const parentScheduleId = readOptionalUuid(data, 'parent_schedule_id', fieldErrors);
  if (parentScheduleId !== undefined) sanitized.parent_schedule_id = parentScheduleId;

  if (
    sanitized.start_date instanceof Date &&
    sanitized.end_date instanceof Date &&
    sanitized.end_date < sanitized.start_date
  ) {
    fieldErrors.end_date = 'End date must be on or after the start date.';
  }

  return finalizeValidation(fieldErrors, sanitized);
}

export function validateWorkSchedulePayload(
  input: unknown,
  mode: ValidationMode
): ValidationResult<WorkSchedulePayload> {
  const data = toRecord(input);
  const fieldErrors: FieldErrors = {};
  const sanitized = {} as WorkSchedulePayload;

  const projectId = readRequiredUuid(data, 'project_id', fieldErrors);
  if (projectId) sanitized.project_id = projectId;

  const workItemId =
    mode === 'create'
      ? readRequiredUuid(data, 'work_item_id', fieldErrors)
      : hasValue(data, 'work_item_id')
        ? readOptionalUuid(data, 'work_item_id', fieldErrors)
        : undefined;
  if (workItemId !== undefined) sanitized.work_item_id = workItemId;

  const scheduleId = readOptionalUuid(data, 'schedule_id', fieldErrors);
  if (scheduleId !== undefined) sanitized.schedule_id = scheduleId;

  const plannedStartDate =
    mode === 'create'
      ? readRequiredDate(data, 'planned_start_date', fieldErrors)
      : hasValue(data, 'planned_start_date')
        ? readOptionalDate(data, 'planned_start_date', fieldErrors)
        : undefined;
  if (plannedStartDate !== undefined) sanitized.planned_start_date = plannedStartDate;

  const plannedEndDate =
    mode === 'create'
      ? readRequiredDate(data, 'planned_end_date', fieldErrors)
      : hasValue(data, 'planned_end_date')
        ? readOptionalDate(data, 'planned_end_date', fieldErrors)
        : undefined;
  if (plannedEndDate !== undefined) sanitized.planned_end_date = plannedEndDate;

  const actualStartDate = readOptionalDate(data, 'actual_start_date', fieldErrors);
  if (actualStartDate !== undefined) sanitized.actual_start_date = actualStartDate;

  const actualEndDate = readOptionalDate(data, 'actual_end_date', fieldErrors);
  if (actualEndDate !== undefined) sanitized.actual_end_date = actualEndDate;

  const plannedHours = readNullableDecimal(data, 'planned_hours', fieldErrors, {
    min: 0,
    max: 100000,
  });
  if (plannedHours !== undefined) sanitized.planned_hours = plannedHours;

  const actualHours = readNullableDecimal(data, 'actual_hours', fieldErrors, { min: 0, max: 100000 });
  if (actualHours !== undefined) sanitized.actual_hours = actualHours;

  const status = readEnumValue(data, 'status', fieldErrors, WORK_SCHEDULE_STATUSES);
  if (status !== undefined) sanitized.status = status;

  const completionPercentage = readNullableDecimal(data, 'completion_percentage', fieldErrors, {
    min: 0,
    max: 100,
  });
  if (completionPercentage !== undefined) sanitized.completion_percentage = completionPercentage;

  const isCriticalPath = readBoolean(data, 'is_critical_path', fieldErrors);
  if (isCriticalPath !== undefined) sanitized.is_critical_path = isCriticalPath;

  const dependencies = readStringArray(data, 'dependencies', fieldErrors, {
    maxItems: 20,
    uuidItems: true,
  });
  if (dependencies !== undefined) sanitized.dependencies = dependencies;

  if (
    sanitized.planned_start_date instanceof Date &&
    sanitized.planned_end_date instanceof Date &&
    sanitized.planned_end_date < sanitized.planned_start_date
  ) {
    fieldErrors.planned_end_date = 'End date must be on or after the start date.';
  }

  if (
    sanitized.actual_start_date instanceof Date &&
    sanitized.actual_end_date instanceof Date &&
    sanitized.actual_end_date < sanitized.actual_start_date
  ) {
    fieldErrors.actual_end_date = 'Actual end date must be on or after the actual start date.';
  }

  return finalizeValidation(fieldErrors, sanitized);
}
