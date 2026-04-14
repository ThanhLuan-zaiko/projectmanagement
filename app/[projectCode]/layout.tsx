'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Project {
  project_id: string;
  project_code: string;
  project_name: string;
  description: string;
  status: string;
  project_leader_id: string | null;
  owner_id: string;
  currency: string;
  budget: number | null;
  team_members?: any[];
}

interface ProjectContextType {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextType>({
  project: null,
  isLoading: true,
  error: null,
});

export const useProject = () => useContext(ProjectContext);

interface ProjectLayoutProps {
  children: ReactNode;
}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const projectCode = params?.projectCode as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/${projectCode}/dashboard`);
    }
  }, [user, authLoading, router, projectCode]);

  // Fetch project by code
  useEffect(() => {
    if (!projectCode || !user) return;

    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First try to join/access the project
        const joinResponse = await fetch('/api/projects/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_code: projectCode }),
        });

        const joinData = await joinResponse.json();

        if (!joinResponse.ok || !joinData.success) {
          setError(joinData.error || 'Project not found');
          setProject(null);
          return;
        }

        // Fetch full project details
        const projectResponse = await fetch(`/api/projects/${joinData.data.project.project_id}`);
        const projectData = await projectResponse.json();

        if (projectData.success) {
          setProject(projectData.data);
        } else {
          setError('Failed to load project details');
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError('An error occurred while loading the project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectCode, user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <div className="text-center">
          <div className="text-white text-xl mb-2">Loading project...</div>
          <div className="text-slate-400 text-sm">Please wait</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Project Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'Unable to load project'}</p>
          <button
            onClick={() => router.push('/projects')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectContext.Provider value={{ project, isLoading, error }}>
      {children}
    </ProjectContext.Provider>
  );
}
