import { FiArrowRight, FiLoader, FiLink } from 'react-icons/fi';

interface JoinProjectCardProps {
  projectCode: string;
  isJoining?: boolean;
  error?: string;
  validationError?: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function JoinProjectCard({
  projectCode,
  isJoining = false,
  error,
  validationError,
  onChange,
  onSubmit,
}: JoinProjectCardProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="projects-bento-panel rounded-[28px] p-6 backdrop-blur-xl sm:p-8"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
          <FiLink className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Join an existing project</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Paste a project code to enter the workspace immediately and add yourself as a member if needed.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-slate-200">Project code</label>
        <input
          value={projectCode}
          onChange={(event) => onChange(event.target.value)}
          placeholder="PROJ-M5XK9A2B"
          className={`projects-bento-input w-full rounded-2xl px-4 py-3 font-mono text-white outline-none transition placeholder:text-slate-500 ${
            validationError
              ? 'border-rose-400/40 bg-rose-500/10 focus:border-rose-300'
              : 'focus:border-emerald-400/60'
          }`}
        />
        <p className={`mt-2 text-xs ${validationError ? 'text-rose-200' : 'text-slate-500'}`}>
          {validationError || 'Project codes use the format PROJ-XXXXXXXX.'}
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isJoining || !projectCode.trim()}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-3 font-medium text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isJoining ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiArrowRight className="h-4 w-4" />}
        <span>{isJoining ? 'Joining...' : 'Join project'}</span>
      </button>
    </form>
  );
}
