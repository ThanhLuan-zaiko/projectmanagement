'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit2 } from 'react-icons/fi';
import type { Project, ProjectFormData, ProjectFormErrors } from '@/types/project';
import { validateProjectFormData } from '@/lib/project-validation';
import ProjectForm from './ProjectForm';
import ProjectsPageHeader from './ProjectsPageHeader';
import { formatProjectBudget, formatProjectDate, getStatusLabel } from './project-utils';

interface ProjectEditClientProps {
  projectId: string;
}

export default function ProjectEditClient({ projectId }: ProjectEditClientProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    project_name: '',
    description: '',
    status: 'planning',
    start_date: '',
    target_end_date: '',
    budget: '',
    currency: 'USD',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<ProjectFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/projects/${projectId}`, {
          cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || 'Failed to load project');
          return;
        }

        const nextProject = data.data as Project;
        setProject(nextProject);
        setFormData({
          project_name: nextProject.project_name,
          description: nextProject.description || '',
          status: nextProject.status,
          start_date: nextProject.start_date ? nextProject.start_date.slice(0, 10) : '',
          target_end_date: nextProject.target_end_date ? nextProject.target_end_date.slice(0, 10) : '',
          budget: nextProject.budget ? String(nextProject.budget) : '',
          currency: nextProject.currency || 'USD',
        });
      } catch {
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = event.target;
    const value = name === 'currency' ? event.target.value.toUpperCase() : event.target.value;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
    setError('');
    setFormErrors((current) => ({
      ...current,
      [name]: undefined,
      form: undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setFormErrors({});

    const validation = validateProjectFormData(formData);

    if (!validation.sanitizedData) {
      setFormErrors(validation.fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.sanitizedData),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.fieldErrors) {
          setFormErrors(data.fieldErrors);
        }
        setError(data.error || 'Failed to update project');
        return;
      }

      router.push('/projects/workspace');
    } catch {
      setError('An unexpected error occurred while updating the project.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-44 animate-pulse rounded-[28px] bg-white/5" />;
  }

  if (!project || error) {
    return (
      <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-6 text-rose-100">
        {error || 'Project not found'}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <ProjectsPageHeader
        eyebrow="Edit project"
        title={`Refine ${project.project_name}`}
        description="Keep project metadata accurate so your portfolio analytics and workspace filters stay trustworthy."
        icon={FiEdit2}
        highlights={[
          { label: 'Status', value: getStatusLabel(project.status) },
          { label: 'Budget', value: formatProjectBudget(project) },
          { label: 'Updated', value: formatProjectDate(project.updated_at) },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
          <ProjectForm
            formData={formData}
            validationErrors={formErrors}
            projectCode={project.project_code}
            isSubmitting={submitting}
            submitLabel={submitting ? 'Saving changes...' : 'Save changes'}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/projects/workspace')}
          />
        </div>

        <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl shadow-xl shadow-slate-950/30">
          <h3 className="text-xl font-semibold text-white">Project snapshot</h3>
          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
              <p className="mt-2 text-white capitalize">{getStatusLabel(project.status)}</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Budget</p>
              <p className="mt-2 text-white">{formatProjectBudget(project)}</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Created</p>
              <p className="mt-2 text-white">{formatProjectDate(project.created_at)}</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Updated</p>
              <p className="mt-2 text-white">{formatProjectDate(project.updated_at)}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
