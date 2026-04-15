import { ProjectEditClient } from '@/components/projects';

interface ProjectEditPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const { projectId } = await params;

  return <ProjectEditClient projectId={projectId} />;
}
