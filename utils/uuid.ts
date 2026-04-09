// UUID v7 utility

import { v7 as uuidv7 } from 'uuid';

export function generateUUIDv7(): string {
  return uuidv7();
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
