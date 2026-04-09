// Application constants

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Project Management';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Database
export const DB_KEYSPACE = process.env.SCYLLA_DB_KEYSPACE || 'project_management';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Date formats
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  TASKS: '/tasks',
  USERS: '/users',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;
