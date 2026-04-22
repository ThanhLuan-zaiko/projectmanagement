export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const ISO_DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const WORK_ITEM_TYPES = ['task', 'subtask', 'milestone', 'bug'] as const;
export const WORK_ITEM_STATUSES = ['todo', 'in_progress', 'review', 'done', 'cancelled'] as const;
export const WORK_ITEM_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

export const EXPERT_AVAILABILITY = ['available', 'busy', 'unavailable'] as const;

export const COST_ESTIMATE_TYPES = ['labor', 'material', 'service', 'overhead', 'license'] as const;
export const COST_ESTIMATE_STATUSES = ['draft', 'submitted', 'approved', 'rejected'] as const;

export const CONFIDENCE_LEVELS = ['low', 'medium', 'high'] as const;
export const ESTIMATION_METHODS = ['expert_judgment', 'planning_poker', 'three_point', 'delphi'] as const;

export const PROJECT_SCHEDULE_TYPES = ['phase', 'milestone', 'sprint', 'release'] as const;
export const PROJECT_SCHEDULE_STATUSES = ['planned', 'active', 'completed', 'cancelled'] as const;

export const WORK_SCHEDULE_STATUSES = ['not_started', 'in_progress', 'completed', 'delayed', 'blocked'] as const;

export const PROJECT_ROLES = ['owner', 'manager', 'member', 'viewer'] as const;
