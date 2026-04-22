import { ISO_DATE_ONLY_REGEX } from './constants';

export function validateProjectCodeParam(input: string) {
  const trimmed = input.trim().toUpperCase();

  if (!trimmed || !/^PROJ-[A-Z0-9]{6,20}$/.test(trimmed)) {
    return {
      value: trimmed,
      error: 'Project code must look like PROJ-ABC12345.',
    };
  }

  return { value: trimmed };
}

export function normalizeDateInput(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || !ISO_DATE_ONLY_REGEX.test(trimmed)) {
    return null;
  }

  return trimmed;
}
