'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/app/[projectCode]/layout';
import { DashboardHeader } from '@/components/layout';
import { FiSave, FiUsers, FiSettings, FiTrash2 } from 'react-icons/fi';
import { apiFetch } from '@/utils/api-client';

interface TeamMember {
  member_id: string;
  role: 'owner' | 'manager' | 'member' | 'viewer';
  is_active: boolean;
  joined_at: string;
  full_name?: string;
  email?: string;
}

export default function ProjectSettingsPage() {
  const { user } = useAuth();
  const { project } = useProject();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('planning');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  // Initialize form with project data
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
    if (project) {
      setProjectName(project.project_name);
      setDescription(project.description);
      setStatus(project.status);
      setBudget(project.budget?.toString() || '');
      setCurrency(project.currency);
      void fetchTeamMembers();
    }
  }, [project, fetchTeamMembers]);

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setTimeout(() => setSaveMessage(''), 3000);
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
        fetchTeamMembers();
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
        fetchTeamMembers();
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
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
      />
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
        {/* Project Info Form */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiSettings /> Project Information
          </h2>

          <form onSubmit={handleSaveProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isOwner}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isOwner}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Budget
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isOwner}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isOwner}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="VND">VND</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isOwner}
              />
            </div>

            {saveMessage && (
              <div
                className={`text-sm p-3 rounded-lg ${
                  saveMessage.includes('success')
                    ? 'text-green-400 bg-green-900/20 border border-green-900/50'
                    : 'text-red-400 bg-red-900/20 border border-red-900/50'
                }`}
              >
                {saveMessage}
              </div>
            )}

            {isOwner && (
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <FiSave /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </form>
        </div>

        {/* Team Members */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiUsers /> Team Members ({teamMembers.length})
          </h2>

          {isLoadingTeam ? (
            <div className="text-slate-400 text-center py-8">Loading team...</div>
          ) : teamMembers.length === 0 ? (
            <div className="text-slate-400 text-center py-8">No team members yet</div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.member_id}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium">
                      {member.full_name || member.email || member.member_id}
                    </div>
                    <div className="text-slate-400 text-sm">{member.email}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleUpdateRole(member.member_id, e.target.value as TeamMember['role'])
                      }
                      className="px-3 py-1 bg-slate-600 border border-slate-500 rounded text-sm text-white"
                      disabled={!isOwner}
                    >
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    {isOwner && member.member_id !== user?.user_id && (
                      <button
                        onClick={() => handleRemoveMember(member.member_id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Code Display */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Project Code</h2>
          <div className="flex items-center gap-4">
            <code className="text-2xl font-mono text-blue-400 bg-slate-700 px-4 py-2 rounded-lg">
              {project.project_code}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(project.project_code)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
            >
              Copy to Clipboard
            </button>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            Share this code with team members so they can join the project.
          </p>
        </div>
      </div>
    </>
  );
}
