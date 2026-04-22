import { PROJECT_ROLES } from './constants';
import { finalizeValidation, readEnumValue, readRequiredUuid, readStringArray, toRecord } from './shared';
import type {
  FieldErrors,
  TeamMemberPayload,
  TeamMemberValidationMode,
  ValidationResult,
} from './types';

export function validateTeamMemberPayload(
  input: unknown,
  _mode: TeamMemberValidationMode
): ValidationResult<TeamMemberPayload> {
  const data = toRecord(input);
  const fieldErrors: FieldErrors = {};
  const sanitized = {} as TeamMemberPayload;

  const memberId = readRequiredUuid(data, 'member_id', fieldErrors);
  if (memberId) sanitized.member_id = memberId;

  const role = readEnumValue(data, 'role', fieldErrors, PROJECT_ROLES, { required: true });
  if (role !== undefined) sanitized.role = role;

  const permissions = readStringArray(data, 'permissions', fieldErrors, {
    maxItems: 20,
    maxItemLength: 50,
  });
  if (permissions !== undefined) sanitized.permissions = permissions;

  return finalizeValidation(fieldErrors, sanitized);
}
