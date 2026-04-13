-- ============================================================
-- Project Management Database Schema
-- Database: ScyllaDB | Keyspace: project_management
-- ============================================================

-- Use the project_management keyspace
USE project_management;

-- ============================================================
-- AUTHENTICATION & AUTHORIZATION
-- ============================================================

-- User accounts
CREATE TABLE IF NOT EXISTS users (
    user_id UUID,
    email TEXT,
    username TEXT,
    password_hash TEXT,
    password_salt TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT,                 -- 'admin', 'manager', 'expert', 'member'
    status TEXT,               -- 'active', 'inactive', 'suspended'
    last_login TIMESTAMP,
    login_attempts INT,
    locked_until TIMESTAMP,
    email_verified BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (user_id)
);

-- Index for login by email/username
CREATE INDEX IF NOT EXISTS users_by_email ON users (email);
CREATE INDEX IF NOT EXISTS users_by_username ON users (username);
CREATE INDEX IF NOT EXISTS users_by_status ON users (status);

-- User sessions (for tracking active logins)
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id UUID,
    user_id UUID,
    token_hash TEXT,
    refresh_token_hash TEXT,
    device_info TEXT,
    ip_address TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP,
    last_activity TIMESTAMP,
    is_revoked BOOLEAN,
    PRIMARY KEY (user_id, session_id)
) WITH CLUSTERING ORDER BY (session_id ASC);

-- Session lookup by token (for validation)
CREATE TABLE IF NOT EXISTS sessions_by_token (
    token_hash TEXT,
    session_id UUID,
    user_id UUID,
    expires_at TIMESTAMP,
    is_revoked BOOLEAN,
    PRIMARY KEY (token_hash)
);

-- Session lookup by refresh token (for session refresh)
CREATE TABLE IF NOT EXISTS sessions_by_refresh_token (
    refresh_token_hash TEXT,
    session_id UUID,
    user_id UUID,
    expires_at TIMESTAMP,
    is_revoked BOOLEAN,
    PRIMARY KEY (refresh_token_hash)
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
    email TEXT,
    reset_token TEXT,
    user_id UUID,
    expires_at TIMESTAMP,
    is_used BOOLEAN,
    created_at TIMESTAMP,
    PRIMARY KEY (email, reset_token)
) WITH CLUSTERING ORDER BY (reset_token ASC);

-- Rate limiting (DB-backed, prevents RAM overflow)
CREATE TABLE IF NOT EXISTS rate_limits (
    rate_key TEXT,
    window_start TIMESTAMP,
    request_count INT,
    PRIMARY KEY (rate_key)
);

-- ============================================================
-- PROJECT METADATA
-- ============================================================

-- Project basic info
CREATE TABLE IF NOT EXISTS projects (
    project_id UUID,
    project_name TEXT,
    description TEXT,
    status TEXT,                 -- 'planning', 'active', 'on_hold', 'completed', 'cancelled'
    start_date TIMESTAMP,
    target_end_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    budget DECIMAL,
    currency TEXT,
    owner_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID,
    PRIMARY KEY (project_id)
);

-- Index for querying projects by status and owner
CREATE INDEX IF NOT EXISTS projects_by_status ON projects (status);
CREATE INDEX IF NOT EXISTS projects_by_owner_id ON projects (owner_id);

-- Project team members
CREATE TABLE IF NOT EXISTS project_team (
    project_id UUID,
    member_id UUID,
    role TEXT,                   -- 'owner', 'manager', 'member', 'viewer'
    permissions SET<TEXT>,
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    is_active BOOLEAN,
    added_by UUID,
    PRIMARY KEY (project_id, member_id)
);

-- Index for finding user's projects
CREATE INDEX IF NOT EXISTS project_team_by_member_id ON project_team (member_id);

-- ============================================================
-- EXPERTS & TEAM
-- ============================================================

-- Expert profiles
CREATE TABLE IF NOT EXISTS experts (
    expert_id UUID,
    user_id UUID,
    name TEXT,
    email TEXT,
    specialization SET<TEXT>,
    experience_years INT,
    hourly_rate DECIMAL,
    currency TEXT,
    availability_status TEXT,    -- 'available', 'busy', 'unavailable'
    rating DECIMAL,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (expert_id)
);

-- Index for finding experts by user and specialization
CREATE INDEX IF NOT EXISTS experts_by_user_id ON experts (user_id);
CREATE INDEX IF NOT EXISTS experts_by_availability ON experts (availability_status);

-- ============================================================
-- 1. WORK ITEM MANAGEMENT
-- ============================================================

-- Work items (tasks) for project
CREATE TABLE IF NOT EXISTS work_items (
    work_item_id UUID,
    project_id UUID,
    title TEXT,
    description TEXT,
    work_type TEXT,              -- 'task', 'subtask', 'milestone', 'bug'
    status TEXT,                 -- 'todo', 'in_progress', 'review', 'done', 'cancelled'
    priority TEXT,               -- 'low', 'medium', 'high', 'urgent'
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID,
    assigned_to UUID,
    due_date TIMESTAMP,
    estimated_hours DECIMAL,
    actual_hours DECIMAL,
    parent_work_item_id UUID,
    tags SET<TEXT>,
    attachments SET<TEXT>,
    PRIMARY KEY (project_id, work_item_id)
) WITH CLUSTERING ORDER BY (work_item_id ASC);

-- Index for querying work items by status, assignee, type, priority
CREATE INDEX IF NOT EXISTS work_items_by_status ON work_items (status);
CREATE INDEX IF NOT EXISTS work_items_by_assigned_to ON work_items (assigned_to);
CREATE INDEX IF NOT EXISTS work_items_by_work_type ON work_items (work_type);
CREATE INDEX IF NOT EXISTS work_items_by_priority ON work_items (priority);
CREATE INDEX IF NOT EXISTS work_items_by_created_by ON work_items (created_by);
CREATE INDEX IF NOT EXISTS work_items_by_due_date ON work_items (due_date);

-- Work item activity log (audit trail)
CREATE TABLE IF NOT EXISTS work_item_activity (
    work_item_id UUID,
    project_id UUID,
    activity_id TIMEUUID,
    user_id UUID,
    action TEXT,                 -- 'created', 'updated', 'status_changed', 'assigned', 'deleted'
    old_value TEXT,
    new_value TEXT,
    field_name TEXT,
    comment TEXT,
    created_at TIMESTAMP,
    PRIMARY KEY (project_id, work_item_id, activity_id)
) WITH CLUSTERING ORDER BY (work_item_id ASC, activity_id DESC);

-- Work item comments
CREATE TABLE IF NOT EXISTS work_item_comments (
    work_item_id UUID,
    project_id UUID,
    comment_id TIMEUUID,
    user_id UUID,
    content TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN,
    PRIMARY KEY (project_id, work_item_id, comment_id)
) WITH CLUSTERING ORDER BY (work_item_id ASC, comment_id DESC);

-- ============================================================
-- 2. EXPERT TIME ESTIMATION
-- ============================================================

-- Expert time estimates for work items
CREATE TABLE IF NOT EXISTS expert_time_estimates (
    work_item_id UUID,
    project_id UUID,
    expert_id UUID,
    estimate_id TIMEUUID,
    estimated_hours DECIMAL,
    confidence_level TEXT,       -- 'low', 'medium', 'high'
    estimation_method TEXT,      -- 'expert_judgment', 'planning_poker', 'three_point', 'delphi'
    optimistic_hours DECIMAL,
    most_likely_hours DECIMAL,
    pessimistic_hours DECIMAL,
    notes TEXT,
    estimated_at TIMESTAMP,
    estimated_by UUID,
    is_deleted BOOLEAN,
    deleted_at TIMESTAMP,
    deleted_by UUID,
    PRIMARY KEY (project_id, work_item_id, expert_id, estimate_id)
) WITH CLUSTERING ORDER BY (work_item_id ASC, expert_id ASC, estimate_id DESC);

-- Project-level expert summary
CREATE TABLE IF NOT EXISTS expert_project_summary (
    project_id UUID,
    expert_id UUID,
    total_estimated_hours DECIMAL,
    total_work_items INT,
    average_confidence TEXT,
    completed_estimates INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID,
    PRIMARY KEY (project_id, expert_id)
);

-- Index for finding expert assignments
CREATE INDEX IF NOT EXISTS expert_time_estimates_by_expert ON expert_time_estimates (expert_id);

-- Index for filtering deleted estimates
CREATE INDEX IF NOT EXISTS expert_time_estimates_by_deleted ON expert_time_estimates (is_deleted);

-- ============================================================
-- 3. COST ESTIMATION
-- ============================================================

-- Cost estimates for work items
CREATE TABLE IF NOT EXISTS cost_estimates (
    work_item_id UUID,
    project_id UUID,
    estimate_id TIMEUUID,
    estimate_type TEXT,          -- 'labor', 'material', 'service', 'overhead', 'license'
    estimated_cost DECIMAL,
    currency TEXT,
    hourly_rate DECIMAL,
    hours DECIMAL,
    quantity INT,
    unit_cost DECIMAL,
    notes TEXT,
    status TEXT,                 -- 'draft', 'submitted', 'approved', 'rejected'
    estimated_at TIMESTAMP,
    estimated_by UUID,
    approved_at TIMESTAMP,
    approved_by UUID,
    PRIMARY KEY (project_id, work_item_id, estimate_id)
) WITH CLUSTERING ORDER BY (work_item_id ASC, estimate_id DESC);

-- Index for querying cost estimates by type and status
CREATE INDEX IF NOT EXISTS cost_estimates_by_type ON cost_estimates (estimate_type);
CREATE INDEX IF NOT EXISTS cost_estimates_by_status ON cost_estimates (status);

-- Project cost summary
CREATE TABLE IF NOT EXISTS project_cost_summary (
    project_id UUID,
    estimate_type TEXT,
    total_cost DECIMAL,
    currency TEXT,
    labor_cost DECIMAL,
    material_cost DECIMAL,
    overhead_cost DECIMAL,
    license_cost DECIMAL,
    contingency DECIMAL,
    calculated_at TIMESTAMP,
    calculated_by UUID,
    PRIMARY KEY (project_id, estimate_type)
);

-- ============================================================
-- 4. PROJECT SCHEDULE
-- ============================================================

-- Project schedules/phases
CREATE TABLE IF NOT EXISTS project_schedules (
    project_id UUID,
    schedule_id UUID,
    schedule_name TEXT,
    schedule_type TEXT,          -- 'phase', 'milestone', 'sprint', 'release'
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    planned_duration_days INT,
    actual_duration_days INT,
    status TEXT,                 -- 'planned', 'active', 'completed', 'cancelled'
    progress_percentage DECIMAL,
    parent_schedule_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID,
    PRIMARY KEY (project_id, schedule_id)
) WITH CLUSTERING ORDER BY (schedule_id ASC);

-- Index for querying schedules by status and type
CREATE INDEX IF NOT EXISTS project_schedules_by_status ON project_schedules (status);
CREATE INDEX IF NOT EXISTS project_schedules_by_type ON project_schedules (schedule_type);

-- Project schedule timeline
CREATE TABLE IF NOT EXISTS project_timeline (
    project_id UUID,
    scheduled_date TIMESTAMP,
    event_id UUID,
    event_name TEXT,
    event_type TEXT,             -- 'kickoff', 'review', 'delivery', 'milestone', 'deadline'
    actual_date TIMESTAMP,
    description TEXT,
    is_milestone BOOLEAN,
    status TEXT,                 -- 'scheduled', 'in_progress', 'completed', 'delayed', 'cancelled'
    schedule_id UUID,
    created_at TIMESTAMP,
    created_by UUID,
    PRIMARY KEY (project_id, scheduled_date, event_id)
) WITH CLUSTERING ORDER BY (scheduled_date ASC, event_id ASC);

-- Index for timeline events by status
CREATE INDEX IF NOT EXISTS project_timeline_by_status ON project_timeline (status);

-- ============================================================
-- 5. WORK ITEM SCHEDULE
-- ============================================================

-- Work item schedules (task scheduling within project)
CREATE TABLE IF NOT EXISTS work_item_schedules (
    work_item_id UUID,
    project_id UUID,
    schedule_id UUID,
    planned_start_date TIMESTAMP,
    planned_end_date TIMESTAMP,
    actual_start_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    planned_hours DECIMAL,
    actual_hours DECIMAL,
    dependencies SET<UUID>,      -- dependent work_item_ids
    is_critical_path BOOLEAN,
    status TEXT,                 -- 'not_started', 'in_progress', 'completed', 'delayed', 'blocked'
    completion_percentage DECIMAL,
    scheduled_by UUID,
    scheduled_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (project_id, work_item_id)
) WITH CLUSTERING ORDER BY (work_item_id ASC);

-- Index for querying scheduled work items by status and schedule
CREATE INDEX IF NOT EXISTS work_item_schedules_by_status ON work_item_schedules (status);
CREATE INDEX IF NOT EXISTS work_item_schedules_by_schedule ON work_item_schedules (schedule_id);

-- Schedule assignments (who is working on what, when)
CREATE TABLE IF NOT EXISTS schedule_assignments (
    schedule_id UUID,
    project_id UUID,
    work_item_id UUID,
    assigned_to UUID,
    assignment_id TIMEUUID,
    role TEXT,
    allocated_hours DECIMAL,
    assigned_at TIMESTAMP,
    assigned_by UUID,
    PRIMARY KEY (schedule_id, work_item_id, assigned_to, assignment_id)
) WITH CLUSTERING ORDER BY (work_item_id ASC, assigned_to ASC, assignment_id DESC);

-- Index for finding user's assignments
CREATE INDEX IF NOT EXISTS schedule_assignments_by_assigned_to ON schedule_assignments (assigned_to);

-- ============================================================
-- NOTIFICATIONS & AUDIT
-- ============================================================

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
    user_id UUID,
    notification_id TIMEUUID,
    title TEXT,
    message TEXT,
    notification_type TEXT,      -- 'task_assigned', 'deadline', 'comment', 'mention', 'status_change'
    is_read BOOLEAN,
    related_entity_type TEXT,
    related_entity_id UUID,
    created_at TIMESTAMP,
    PRIMARY KEY (user_id, notification_id)
) WITH CLUSTERING ORDER BY (notification_id DESC);

-- Index for unread notifications count
CREATE INDEX IF NOT EXISTS notifications_by_read ON notifications (is_read);
CREATE INDEX IF NOT EXISTS notifications_by_type ON notifications (notification_type);

-- Global activity log (audit trail for all actions)
CREATE TABLE IF NOT EXISTS activity_log (
    project_id UUID,
    activity_id TIMEUUID,
    user_id UUID,
    entity_type TEXT,            -- 'project', 'work_item', 'schedule', 'cost', 'team'
    entity_id UUID,
    action TEXT,                 -- 'create', 'update', 'delete', 'assign', 'status_change'
    old_data TEXT,
    new_data TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP,
    PRIMARY KEY (project_id, activity_id)
) WITH CLUSTERING ORDER BY (activity_id DESC);

-- Index for activity by user and entity type
CREATE INDEX IF NOT EXISTS activity_log_by_user ON activity_log (user_id);
CREATE INDEX IF NOT EXISTS activity_log_by_entity_type ON activity_log (entity_type);
