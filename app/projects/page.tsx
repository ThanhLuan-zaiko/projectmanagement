'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Project {
  project_id: string;
  project_code: string;
  project_name: string;
  status: string;
  role: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading: isLoading } = useAuth();
  const [projectCode, setProjectCode] = useState('');
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [error, setError] = useState('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/projects');
    }
  }, [user, isLoading, router]);

  // Fetch user's projects
  useEffect(() => {
    if (user) {
      fetchMyProjects();
    }
  }, [user]);

  const fetchMyProjects = async () => {
    try {
      const response = await fetch('/api/projects/my-projects');
      const data = await response.json();

      if (data.success) {
        setMyProjects(data.data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleJoinProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsJoining(true);

    try {
      const response = await fetch('/api/projects/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_code: projectCode.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to project dashboard
        router.push(`/${data.data.project.project_code}/dashboard`);
      } else {
        setError(data.error || 'Failed to join project');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: newProjectName.trim(),
          description: newProjectDesc.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to new project dashboard
        router.push(`/${data.data.project_code}/dashboard`);
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectProject = (project: Project) => {
    router.push(`/${project.project_code}/dashboard`);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Project Management</h1>
          <p className="text-slate-400">
            Create a new project, join an existing one, or select from your projects.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create New Project */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Project</h2>
            
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all shadow-lg shadow-green-500/20"
              >
                + Create Project
              </button>
            ) : (
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="My Awesome Project"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="Brief description..."
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isCreating || !newProjectName.trim()}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    {isCreating ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewProjectName('');
                      setNewProjectDesc('');
                    }}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Join Project Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Join a Project</h2>
            <form onSubmit={handleJoinProject} className="space-y-4">
              <div>
                <label htmlFor="projectCode" className="block text-sm font-medium text-slate-300 mb-2">
                  Project Code
                </label>
                <input
                  id="projectCode"
                  type="text"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  placeholder="e.g., PROJ-M5XK9A2B"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isJoining}
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/50 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isJoining || !projectCode.trim()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isJoining ? 'Joining...' : 'Join Project'}
              </button>
            </form>
          </div>

          {/* My Projects Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">My Projects</h2>

            {isLoadingProjects ? (
              <div className="text-slate-400 text-center py-8">Loading projects...</div>
            ) : myProjects.length === 0 ? (
              <div className="text-slate-400 text-center py-8">
                <p className="text-sm">You haven't joined any projects yet.</p>
                <p className="text-xs mt-2 text-slate-500">Create or join a project to get started.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {myProjects.map((project) => (
                  <button
                    key={project.project_id}
                    onClick={() => handleSelectProject(project)}
                    className="w-full p-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <h3 className="text-white font-medium truncate">{project.project_name}</h3>
                        <p className="text-slate-400 text-xs font-mono">{project.project_code}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded-full">
                          {project.role}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User info & Quick link to old dashboard */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-slate-400 text-sm">
            Logged in as <span className="text-white">{user.full_name || user.email}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors border border-slate-600 rounded-lg hover:bg-slate-700/50"
            >
              Use Default Dashboard
            </button>
            <button
              onClick={() => router.push('/auth/logout')}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
