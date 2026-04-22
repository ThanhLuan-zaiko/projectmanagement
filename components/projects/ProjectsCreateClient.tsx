'use client';

import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FiCompass, FiFolderPlus, FiLayers } from 'react-icons/fi';
import type { ProjectFormData, ProjectFormErrors } from '@/types/project';
import { validateProjectCode, validateProjectField, validateProjectFormData, type ValidatableField } from '@/lib/project-validation';
import JoinProjectCard from './JoinProjectCard';
import ProjectForm from './ProjectForm';
import ProjectsPageHeader from './ProjectsPageHeader';
import { apiFetch } from '@/utils/api-client';

const initialFormData: ProjectFormData = {
  project_name: '',
  description: '',
  status: 'planning',
  start_date: new Date().toISOString().slice(0, 10),
  target_end_date: '',
  budget: '',
  currency: 'USD',
};

export default function ProjectsCreateClient() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [projectCode, setProjectCode] = useState('');
  const [createError, setCreateError] = useState('');
  const [joinError, setJoinError] = useState('');
  const [formErrors, setFormErrors] = useState<ProjectFormErrors>({});
  const [joinValidationError, setJoinValidationError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = event.target;
    const value = name === 'currency' ? event.target.value.toUpperCase() : event.target.value;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
    setCreateError('');
    setFormErrors((current) => ({
      ...current,
      [name]: undefined,
      form: undefined,
    }));
  };

  const handleFormBlur = (
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = event.target;
    const error = validateProjectField(name as ValidatableField, formData);
    setFormErrors((current) => ({
      ...current,
      [name]: error ?? current[name as keyof ProjectFormErrors],
    }));
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError('');
    setFormErrors({});

    const validation = validateProjectFormData(formData);

    if (!validation.sanitizedData) {
      setFormErrors(validation.fieldErrors);
      return;
    }

    setIsCreating(true);

    try {
      const response = await apiFetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.sanitizedData),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.fieldErrors) {
          setFormErrors(data.fieldErrors);
        }
        setCreateError(data.error || 'Failed to create project');
        return;
      }

      router.push(`/${data.data.project_code}/dashboard`);
    } catch {
      setCreateError('An unexpected error occurred while creating the project.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setJoinError('');
    setJoinValidationError('');

    const codeValidation = validateProjectCode(projectCode);
    setProjectCode(codeValidation.value);

    if (codeValidation.error) {
      setJoinValidationError(codeValidation.error);
      return;
    }

    setIsJoining(true);

    try {
      const response = await apiFetch('/api/projects/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_code: codeValidation.value }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.fieldErrors?.project_code) {
          setJoinValidationError(data.fieldErrors.project_code);
        }
        setJoinError(data.error || 'Failed to join project');
        return;
      }

      router.push(`/${data.data.project.project_code}/dashboard`);
    } catch {
      setJoinError('An unexpected error occurred while joining the project.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <ProjectsPageHeader
        eyebrow="Create & Join"
        title="Create a fresh workspace or enter an existing one."
        description="Keep creation and access in the same hub so new work starts cleanly and existing work stays easy to reach."
        icon={FiFolderPlus}
        highlights={[
          { label: 'Validation', value: 'Live field guidance' },
          { label: 'Structure', value: 'Separate routes for CRUD and restore' },
          { label: 'Access', value: 'Owner auto-added to team' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
        <div className="space-y-4">
          {createError && (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {createError}
            </div>
          )}
          <ProjectForm
            formData={formData}
            validationErrors={formErrors}
            isSubmitting={isCreating}
            submitLabel={isCreating ? 'Creating project...' : 'Create project'}
            onChange={handleFormChange}
            onBlur={handleFormBlur}
            onSubmit={handleCreate}
          />
        </div>

        <div className="space-y-6">
          <JoinProjectCard
            projectCode={projectCode}
            isJoining={isJoining}
            error={joinError}
            validationError={joinValidationError}
            onChange={(value) => {
              setProjectCode(value.toUpperCase());
              setJoinError('');
              setJoinValidationError('');
            }}
            onSubmit={handleJoin}
          />

          <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl shadow-xl shadow-slate-950/30">
            <h3 className="text-xl font-semibold text-white">What this workspace adds</h3>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-300">
                  <FiLayers className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">Structured CRUD flow</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Active projects, analytics and trash recovery each live on their own route to keep the module maintainable.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-300">
                  <FiCompass className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">Fast project access</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Newly created projects add the owner to the team automatically, so they appear correctly across your workspace.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
