import { redirect } from 'next/navigation';
import { use } from 'react';

export default function ProjectPage({ params }: { params: Promise<{ projectCode: string }> }) {
  const { projectCode } = use(params);
  redirect(`/${projectCode}/dashboard`);
}
