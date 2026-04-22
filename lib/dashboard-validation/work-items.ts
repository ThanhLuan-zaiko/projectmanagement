import { WORK_ITEM_PRIORITIES, WORK_ITEM_STATUSES, WORK_ITEM_TYPES } from './constants';
import {
  finalizeValidation,
  readEnumValue,
  readNullableDecimal,
  readNullableText,
  readOptionalDate,
  readOptionalUuid,
  readRequiredUuid,
  readStringArray,
  readTrimmedString,
  toRecord,
} from './shared';
import type { FieldErrors, ValidationMode, ValidationResult, WorkItemPayload } from './types';

export function validateWorkItemPayload(
  input: unknown,
  mode: ValidationMode
): ValidationResult<WorkItemPayload> {
  const data = toRecord(input);
  const fieldErrors: FieldErrors = {};
  const sanitized = {} as WorkItemPayload;

  const projectId = readRequiredUuid(data, 'project_id', fieldErrors);
  if (projectId) sanitized.project_id = projectId;

  const title = readTrimmedString(data, 'title', fieldErrors, {
    required: mode === 'create',
    min: mode === 'create' ? 3 : undefined,
    max: 120,
  });
  if (title !== undefined) sanitized.title = title;

  const description = readNullableText(data, 'description', fieldErrors, 2000);
  if (description !== undefined) sanitized.description = description || '';

  const workType = readEnumValue(data, 'work_type', fieldErrors, WORK_ITEM_TYPES, {
    required: mode === 'create',
  });
  if (workType !== undefined) sanitized.work_type = workType;

  const status = readEnumValue(data, 'status', fieldErrors, WORK_ITEM_STATUSES, {
    required: mode === 'create',
  });
  if (status !== undefined) sanitized.status = status;

  const priority = readEnumValue(data, 'priority', fieldErrors, WORK_ITEM_PRIORITIES, {
    required: mode === 'create',
  });
  if (priority !== undefined) sanitized.priority = priority;

  const assignedTo = readOptionalUuid(data, 'assigned_to', fieldErrors);
  if (assignedTo !== undefined) sanitized.assigned_to = assignedTo;

  const dueDate = readOptionalDate(data, 'due_date', fieldErrors);
  if (dueDate !== undefined) sanitized.due_date = dueDate;

  const estimatedHours = readNullableDecimal(data, 'estimated_hours', fieldErrors, {
    min: 0,
    max: 100000,
  });
  if (estimatedHours !== undefined) sanitized.estimated_hours = estimatedHours;

  const actualHours = readNullableDecimal(data, 'actual_hours', fieldErrors, {
    min: 0,
    max: 100000,
  });
  if (actualHours !== undefined) sanitized.actual_hours = actualHours;

  const parentWorkItemId = readOptionalUuid(data, 'parent_work_item_id', fieldErrors);
  if (parentWorkItemId !== undefined) sanitized.parent_work_item_id = parentWorkItemId;

  const tags = readStringArray(data, 'tags', fieldErrors, { maxItems: 15, maxItemLength: 32 });
  if (tags !== undefined) sanitized.tags = tags;

  const attachments = readStringArray(data, 'attachments', fieldErrors, {
    maxItems: 10,
    maxItemLength: 255,
  });
  if (attachments !== undefined) sanitized.attachments = attachments;

  return finalizeValidation(fieldErrors, sanitized);
}
