import { UUID_REGEX } from './constants';
import type { FieldErrors, ValidationResult } from './types';

export function hasValue(input: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(input, key);
}

export function toRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  return input as Record<string, unknown>;
}

export function readTrimmedString(
  input: Record<string, unknown>,
  key: string,
  fieldErrors: FieldErrors,
  options: { required?: boolean; min?: number; max?: number } = {}
) {
  if (!hasValue(input, key)) {
    if (options.required) {
      fieldErrors[key] = 'This field is required.';
    }
    return undefined;
  }

  const rawValue = input[key];

  if (rawValue === null || rawValue === undefined) {
    if (options.required) {
      fieldErrors[key] = 'This field is required.';
    }
    return undefined;
  }

  const value = String(rawValue).trim();

  if (!value) {
    if (options.required) {
      fieldErrors[key] = 'This field is required.';
    }
    return undefined;
  }

  if (options.min && value.length < options.min) {
    fieldErrors[key] = `Must be at least ${options.min} characters.`;
    return undefined;
  }

  if (options.max && value.length > options.max) {
    fieldErrors[key] = `Must be ${options.max} characters or fewer.`;
    return undefined;
  }

  return value;
}

export function readNullableText(
  input: Record<string, unknown>,
  key: string,
  fieldErrors: FieldErrors,
  max: number
) {
  if (!hasValue(input, key)) {
    return undefined;
  }

  const rawValue = input[key];

  if (rawValue === null || rawValue === undefined) {
    return null;
  }

  const value = String(rawValue).trim();

  if (!value) {
    return null;
  }

  if (value.length > max) {
    fieldErrors[key] = `Must be ${max} characters or fewer.`;
    return undefined;
  }

  return value;
}

export function readRequiredUuid(
  input: Record<string, unknown>,
  key: string,
  fieldErrors: FieldErrors
) {
  const value = readTrimmedString(input, key, fieldErrors, { required: true });

  if (!value) {
    return undefined;
  }

  if (!UUID_REGEX.test(value)) {
    fieldErrors[key] = 'Must be a valid UUID.';
    return undefined;
  }

  return value;
}

export function readOptionalUuid(
  input: Record<string, unknown>,
  key: string,
  fieldErrors: FieldErrors
) {
  if (!hasValue(input, key)) {
    return undefined;
  }

  const rawValue = input[key];

  if (rawValue === null || rawValue === undefined) {
    return null;
  }

  const value = String(rawValue).trim();

  if (!value) {
    return null;
  }

  if (!UUID_REGEX.test(value)) {
    fieldErrors[key] = 'Must be a valid UUID.';
    return undefined;
  }

  return value;
}

export function readCurrency(
  input: Record<string, unknown>,
  key: string,
  fieldErrors: FieldErrors
) {
  const value = readTrimmedString(input, key, fieldErrors, { required: true, min: 3, max: 3 });

  if (!value) {
    return undefined;
  }

  const normalized = value.toUpperCase();

  if (!/^[A-Z]{3}$/.test(normalized)) {
    fieldErrors[key] = 'Must be a 3-letter currency code.';
    return undefined;
  }

  return normalized;
}

export function readEnumValue<T extends string>(
  input: Record<string, unknown>,
  key: string,
  fieldErrors: FieldErrors,
  allowed: readonly T[],
  options: { required?: boolean } = {}
) {
  const value = readTrimmedString(input, key, fieldErrors, { required: options.required });

  if (!value) {
    return undefined;
  }

  if (!(allowed as readonly string[]).includes(value)) {
    fieldErrors[key] = 'Contains an unsupported value.';
    return undefined;
  }

  return value as T;
}

export function readNullableEnumValue<T extends string>(
  input: Record<string, unknown>,
  key: string,
  fieldErrors: FieldErrors,
  allowed: readonly T[]
) {
  if (!hasValue(input, key)) {
    return undefined;
  }

  const rawValue = input[key];

  if (rawValue === null || rawValue === undefined) {
    return null;
  }

  const value = String(rawValue).trim();

  if (!value) {
    return null;
  }

  if (!(allowed as readonly string[]).includes(value)) {
    fieldErrors[key] = 'Contains an unsupported value.';
    return undefined;
  }

  return value as T;
}

export function readNullableDecimal(
  input: Record<string, unknown>,
  key: string,
  fieldErrors: FieldErrors,
  options: { min?: number; max?: number } = {}
) {
  if (!hasValue(input, key)) {
    return undefined;
  }

  const rawValue = input[key];

  if (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') {
    return null;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value)) {
    fieldErrors[key] = 'Must be a valid number.';
    return undefined;
  }

  if (options.min !== undefined && value < options.min) {
    fieldErrors[key] = `Must be at least ${options.min}.`;
    return undefined;
  }

  if (options.max !== undefined && value > options.max) {
    fieldErrors[key] = `Must be ${options.max} or less.`;
    return undefined;
  }

  return value;
}

export function readNullableInteger(
  input: Record<string, unknown>,
  key: string,
  fieldErrors: FieldErrors,
  options: { min?: number; max?: number } = {}
) {
  const value = readNullableDecimal(input, key, fieldErrors, options);

  if (value === undefined || value === null) {
    return value;
  }

  if (!Number.isInteger(value)) {
    fieldErrors[key] = 'Must be a whole number.';
    return undefined;
  }

  return value;
}

function parseDateValue(rawValue: unknown) {
  if (rawValue instanceof Date) {
    return rawValue;
  }

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();

    if (!trimmed) {
      return null;
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  if (rawValue === null || rawValue === undefined) {
    return null;
  }

  const parsed = new Date(String(rawValue));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function readRequiredDate(
  input: Record<string, unknown>,
  key: string,
  fieldErrors: FieldErrors
) {
  if (!hasValue(input, key)) {
    fieldErrors[key] = 'This field is required.';
    return undefined;
  }

  const parsed = parseDateValue(input[key]);

  if (parsed === null) {
    fieldErrors[key] = 'This field is required.';
    return undefined;
  }

  if (!parsed) {
    fieldErrors[key] = 'Must be a valid date.';
    return undefined;
  }

  return parsed;
}

export function readOptionalDate(
  input: Record<string, unknown>,
  key: string,
  fieldErrors: FieldErrors
) {
  if (!hasValue(input, key)) {
    return undefined;
  }

  const parsed = parseDateValue(input[key]);

  if (parsed === undefined) {
    fieldErrors[key] = 'Must be a valid date.';
    return undefined;
  }

  return parsed;
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function readStringArray(
  input: Record<string, unknown>,
  key: string,
  fieldErrors: FieldErrors,
  options: { maxItems?: number; maxItemLength?: number; uuidItems?: boolean } = {}
) {
  if (!hasValue(input, key)) {
    return undefined;
  }

  const items = [...new Set(normalizeStringArray(input[key]))];
  const maxItems = options.maxItems ?? 20;
  const maxItemLength = options.maxItemLength ?? 60;

  if (items.length > maxItems) {
    fieldErrors[key] = `Must contain ${maxItems} items or fewer.`;
    return undefined;
  }

  if (
    items.some((item) => item.length > maxItemLength || (options.uuidItems && !UUID_REGEX.test(item)))
  ) {
    fieldErrors[key] = options.uuidItems
      ? 'Contains an invalid UUID.'
      : `Each item must be ${maxItemLength} characters or fewer.`;
    return undefined;
  }

  return items;
}

export function readBoolean(
  input: Record<string, unknown>,
  key: string,
  fieldErrors: FieldErrors
) {
  if (!hasValue(input, key)) {
    return undefined;
  }

  const rawValue = input[key];

  if (typeof rawValue === 'boolean') {
    return rawValue;
  }

  if (rawValue === 'true') {
    return true;
  }

  if (rawValue === 'false') {
    return false;
  }

  fieldErrors[key] = 'Must be a boolean value.';
  return undefined;
}

export function finalizeValidation<T>(
  fieldErrors: FieldErrors,
  sanitizedData: T
): ValidationResult<T> {
  if (Object.keys(fieldErrors).length > 0) {
    return { sanitizedData: null, fieldErrors };
  }

  return { sanitizedData, fieldErrors };
}
