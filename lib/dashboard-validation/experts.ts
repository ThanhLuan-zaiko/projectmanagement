import { EXPERT_AVAILABILITY } from './constants';
import {
  finalizeValidation,
  hasValue,
  readBoolean,
  readCurrency,
  readEnumValue,
  readNullableDecimal,
  readNullableInteger,
  readNullableText,
  readOptionalUuid,
  readRequiredUuid,
  readStringArray,
  readTrimmedString,
  toRecord,
} from './shared';
import type { ExpertPayload, FieldErrors, ValidationMode, ValidationResult } from './types';

export function validateExpertPayload(
  input: unknown,
  mode: ValidationMode
): ValidationResult<ExpertPayload> {
  const data = toRecord(input);
  const fieldErrors: FieldErrors = {};
  const sanitized = {} as ExpertPayload;

  const projectId = readRequiredUuid(data, 'project_id', fieldErrors);
  if (projectId) sanitized.project_id = projectId;

  const name = readTrimmedString(data, 'name', fieldErrors, {
    required: mode === 'create',
    min: mode === 'create' ? 2 : undefined,
    max: 100,
  });
  if (name !== undefined) sanitized.name = name;

  const email = readNullableText(data, 'email', fieldErrors, 160);
  if (email !== undefined) {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = 'Must be a valid email address.';
    } else {
      sanitized.email = email;
    }
  }

  const specialization = readStringArray(data, 'specialization', fieldErrors, {
    maxItems: 10,
    maxItemLength: 50,
  });
  if (specialization !== undefined) sanitized.specialization = specialization;

  const experienceYears = readNullableInteger(data, 'experience_years', fieldErrors, {
    min: 0,
    max: 80,
  });
  if (experienceYears !== undefined) sanitized.experience_years = experienceYears;

  const hourlyRate = readNullableDecimal(data, 'hourly_rate', fieldErrors, {
    min: 0,
    max: 1000000,
  });
  if (hourlyRate !== undefined) sanitized.hourly_rate = hourlyRate;

  const currency = hasValue(data, 'currency') ? readCurrency(data, 'currency', fieldErrors) : undefined;
  if (currency !== undefined) sanitized.currency = currency;

  const availabilityStatus = readEnumValue(
    data,
    'availability_status',
    fieldErrors,
    EXPERT_AVAILABILITY,
    { required: mode === 'create' }
  );
  if (availabilityStatus !== undefined) sanitized.availability_status = availabilityStatus;

  const rating = readNullableDecimal(data, 'rating', fieldErrors, { min: 0, max: 5 });
  if (rating !== undefined) sanitized.rating = rating;

  const isActive = readBoolean(data, 'is_active', fieldErrors);
  if (isActive !== undefined) sanitized.is_active = isActive;

  const userId = readOptionalUuid(data, 'user_id', fieldErrors);
  if (userId !== undefined) sanitized.user_id = userId;

  return finalizeValidation(fieldErrors, sanitized);
}
