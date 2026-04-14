import { redirect } from 'next/navigation';

export default function ProjectPage({ params }: { params: Promise<{ projectCode: string }> }) {
  // Redirect to dashboard by default
  params.then((p) => {
    redirect(`/${p.projectCode}/dashboard`);
  });

  return null;
}
