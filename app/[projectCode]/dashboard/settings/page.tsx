'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  FiCheck,
  FiCopy,
  FiDollarSign,
  FiFolder,
  FiSave,
  FiSettings,
  FiShield,
  FiTrash2,
  FiUsers,
} from 'react-icons/fi';
import { DashboardExportButton, DashboardTabs } from '@/components/dashboard';
import { DashboardHeader } from '@/components/layout';
import CustomSelect from '@/components/ui/CustomSelect';
import { useProject } from '@/app/[projectCode]/layout';
import { useAuth } from '@/hooks/useAuth';
import { getStatusLabel, getStatusTone } from '@/components/projects/project-utils';
import { apiFetch } from '@/utils/api-client';
import type { Project } from '@/types/project';
import {
  buildDashboardCsvFilename,
  exportDashboardSettingsCsv,
} from '@/components/dashboard/dashboardCsv';

interface TeamMember {
  member_id: string;
  role: 'owner' | 'manager' | 'member' | 'viewer';
  is_active: boolean;
  joined_at: string;
  full_name?: string;
  email?: string;
}

const statusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

const currencyOptions = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'VND', label: 'VND' },
  { value: 'THB', label: 'THB' },
] as const;

const roleOptions = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
] as const;

export default function ProjectSettingsPage() {
  const { user } = useAuth();
  const { project } = useProject();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('planning');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchTeamMembers = useCallback(async () => {
    if (!project) return;

    try {
      const response = await apiFetch(`/api/projects/${project.project_id}/team`);
      const data = await response.json();

      if (data.success) {
        setTeamMembers(data.data);
      }
    } catch (err) {
      console.error('Error fetching team:', err);
    } finally {
      setIsLoadingTeam(false);
    }
  }, [project]);

  useEffect(() => {
    if (!project) {
      return;
    }

    setProjectName(project.project_name);
    setDescription(project.description || '');
    setStatus(project.status);
    setBudget(project.budget?.toString() || '');
    setCurrency(project.currency || 'USD');
    void fetchTeamMembers();
  }, [project, fetchTeamMembers]);

  const handleSaveProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!project) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await apiFetch(`/api/projects/${project.project_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: projectName,
          description,
          status,
          budget: budget ? parseFloat(budget) : null,
          currency,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveMessage('Project updated successfully');
        window.setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage(data.error || 'Failed to update project');
      }
    } catch {
      setSaveMessage('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!project) return;

    try {
      const response = await apiFetch(
        `/api/projects/${project.project_id}/team?member_id=${memberId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await fetchTeamMembers();
      }
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  const handleUpdateRole = async (memberId: string, role: TeamMember['role']) => {
    if (!project) return;

    try {
      const response = await apiFetch(`/api/projects/${project.project_id}/team`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId, role }),
      });

      if (response.ok) {
        await fetchTeamMembers();
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleCopyCode = async () => {
    if (!project) {
      return;
    }

    await navigator.clipboard.writeText(project.project_code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleExport = async () => {
    if (!project) {
      return;
    }

    exportDashboardSettingsCsv(
      buildDashboardCsvFilename(project.project_code, 'dashboard-settings'),
      project,
      teamMembers
    );
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const isOwner = project.owner_id === user?.user_id;

  return (
    <>
      <DashboardHeader
        title="Project Settings"
        subtitle={`Manage ${project.project_code}`}
      >
        <DashboardExportButton
          onExport={handleExport}
          disabled={isLoadingTeam || !project}
        />
      </DashboardHeader>

      <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <DashboardTabs />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
          <form
            onSubmit={handleSaveProject}
            className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.92))] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8"
          >
            <div className="mb-8 grid gap-4 rounded-[24px] border border-cyan-400/12 bg-cyan-400/[0.03] p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Control</p>
                <p className="mt-2 text-sm text-slate-200">Project metadata feeds workspace filters and reporting.</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Ownership</p>
                <p className="mt-2 text-sm text-slate-200">
                  {isOwner ? 'You can update project settings and team roles.' : 'You can review settings but only the owner can change them.'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Status</p>
                <p className="mt-2 text-sm text-slate-200">Use status deliberately so portfolio analytics stay trustworthy.</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                  <FiFolder className="h-4 w-4 text-cyan-300" />
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  disabled={!isOwner}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.03] disabled:text-slate-500"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                  <FiSettings className="h-4 w-4 text-cyan-300" />
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={!isOwner}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.03] disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                  <FiShield className="h-4 w-4 text-cyan-300" />
                  Status
                </label>
                <CustomSelect
                  name="status"
                  value={status}
                  options={statusOptions.map((option) => ({ value: option.value, label: option.label }))}
                  onChange={(event) => setStatus(event.target.value as Project['status'])}
                  usePortal
                  disabled={!isOwner}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                  <FiDollarSign className="h-4 w-4 text-cyan-300" />
                  Currency
                </label>
                <CustomSelect
                  name="currency"
                  value={currency}
                  options={currencyOptions.map((option) => ({ value: option.value, label: option.label }))}
                  onChange={(event) => setCurrency(event.target.value)}
                  usePortal
                  disabled={!isOwner}
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                  <FiDollarSign className="h-4 w-4 text-cyan-300" />
                  Budget
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="25000"
                  disabled={!isOwner}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.03] disabled:text-slate-500"
                />
                <p className="mt-2 text-xs text-slate-500">Leave empty if this project has no fixed budget yet.</p>
              </div>
            </div>

            {saveMessage && (
              <div
                className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                  saveMessage.includes('success')
                    ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                    : 'border-rose-400/20 bg-rose-500/10 text-rose-200'
                }`}
              >
                {saveMessage}
              </div>
            )}

            {isOwner && (
              <button
                type="submit"
                disabled={isSaving}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-3 font-medium text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FiSave className={`h-4 w-4 ${isSaving ? 'animate-pulse' : ''}`} />
                <span>{isSaving ? 'Saving changes...' : 'Save changes'}</span>
              </button>
            )}
          </form>

          <div className="space-y-6">
            <section className="rounded-[30px] border border-white/10 bg-slate-950/55 p-6 shadow-xl shadow-slate-950/30 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Project snapshot</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border px-4 py-3 text-sm font-medium capitalize text-white bg-white/[0.03] border-white/10">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusTone(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Owner Control</p>
                  <p className="mt-2 text-sm text-white">{isOwner ? 'Full settings access' : 'Read-only access'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Team Members</p>
                  <p className="mt-2 text-sm text-white">{teamMembers.length} active collaborators</p>
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/10 bg-slate-950/55 p-6 shadow-xl shadow-slate-950/30 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Project code</p>
              <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.05] p-4">
                <code className="block text-xl font-semibold tracking-[0.22em] text-cyan-200">
                  {project.project_code}
                </code>
                <p className="mt-2 text-sm text-slate-300">
                  Share this code with team members so they can join the project.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5"
              >
                {copied ? <FiCheck className="h-4 w-4 text-emerald-300" /> : <FiCopy className="h-4 w-4" />}
                <span>{copied ? 'Copied' : 'Copy project code'}</span>
              </button>
            </section>
          </div>
        </div>

        <section className="rounded-[30px] border border-white/10 bg-slate-950/55 p-6 shadow-xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                <FiUsers className="h-5 w-5 text-cyan-300" />
                Team Members
              </h2>
              <p className="mt-2 text-sm text-slate-400">Control member roles directly from the project workspace.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-slate-200">
              {teamMembers.length} member{teamMembers.length === 1 ? '' : 's'}
            </span>
          </div>

          {isLoadingTeam ? (
            <div className="py-8 text-center text-slate-400">Loading team...</div>
          ) : teamMembers.length === 0 ? (
            <div className="py-8 text-center text-slate-400">No team members yet</div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => {
                const displayName = member.full_name || member.email || member.member_id;
                const initials = displayName
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <article
                    key={member.member_id}
                    className="flex flex-col gap-4 rounded-[26px] border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/80 to-sky-500 text-sm font-semibold text-slate-950">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                        <p className="truncate text-sm text-slate-400">{member.email || 'No email available'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:min-w-[230px] sm:flex-row sm:items-center sm:justify-end">
                      <div className="min-w-[170px]">
                        <CustomSelect
                          name={`role-${member.member_id}`}
                          value={member.role}
                          options={roleOptions.map((option) => ({ value: option.value, label: option.label }))}
                          onChange={(event) =>
                            handleUpdateRole(member.member_id, event.target.value as TeamMember['role'])
                          }
                          usePortal
                          disabled={!isOwner}
                        />
                      </div>

                      {isOwner && member.member_id !== user?.user_id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.member_id)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/20 px-4 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/10"
                        >
                          <FiTrash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
