import { FiInbox } from 'react-icons/fi';

interface ProjectEmptyStateProps {
  title: string;
  description: string;
}

export default function ProjectEmptyState({ title, description }: ProjectEmptyStateProps) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
        <FiInbox className="h-6 w-6" />
      </div>
      <h4 className="mt-4 text-lg font-semibold text-white">{title}</h4>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
