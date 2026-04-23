import { BsShieldLock } from 'react-icons/bs';
import { FiLayers, FiShield, FiUsers } from 'react-icons/fi';

const highlights = [
  {
    icon: FiLayers,
    title: 'Timeline clarity',
    description: 'Keep milestones, dependencies, and delivery scope aligned from the start.',
  },
  {
    icon: FiUsers,
    title: 'Team alignment',
    description: 'Give every contributor the same current view of ownership, workload, and status.',
  },
  {
    icon: FiShield,
    title: 'Protected access',
    description: 'Move approvals and updates through role-aware workflows instead of scattered links.',
  },
] as const;

const signals = [
  {
    value: 'Single view',
    label: 'Projects, estimates, and schedules live in one shared workspace.',
  },
  {
    value: 'Role-aware',
    label: 'Secure entry paths for members, leads, and reviewers without extra friction.',
  },
  {
    value: 'Fewer gaps',
    label: 'Handoffs stay clear across planning, execution, and reporting cycles.',
  },
  {
    value: 'Fast setup',
    label: 'Get new teams started in minutes instead of rebuilding the same setup each time.',
  },
] as const;

export default function AuthBranding() {
  return (
    <div className="hidden lg:flex flex-col gap-8 pr-4 xl:pr-10">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="auth-logo-mark flex h-16 w-16 items-center justify-center rounded-[1.5rem]">
            <BsShieldLock className="h-8 w-8" />
          </div>
          <div>
            <p className="auth-kicker">ProjectHub Workspace</p>
            <p className="auth-copy mt-2 max-w-sm text-sm leading-6">
              Delivery planning, staffing, and status updates in one focused place.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="auth-heading max-w-2xl text-4xl font-semibold leading-tight xl:text-5xl">
            Keep every project stream visible from kickoff to handoff.
          </h1>
          <p className="auth-copy max-w-xl text-base leading-7 xl:text-lg">
            Sign in to coordinate timelines, estimates, and assignments without bouncing
            between spreadsheets, chat, and status decks.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <article key={title} className="auth-feature-card rounded-[1.5rem] p-5">
              <div className="auth-feature-icon flex h-11 w-11 items-center justify-center rounded-2xl">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="auth-heading mt-4 text-lg font-semibold">{title}</h2>
              <p className="auth-copy mt-2 text-sm leading-6">{description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="auth-brand-panel rounded-[1.75rem] p-6 xl:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="auth-kicker">Operational snapshot</p>
            <h2 className="auth-heading mt-3 text-2xl font-semibold leading-tight">
              Built for teams that need steady delivery, not noisy dashboards.
            </h2>
          </div>
          <span className="auth-stat-chip rounded-full px-3 py-1.5 text-xs font-semibold">
            Ready
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {signals.map(({ value, label }) => (
            <article key={value} className="auth-stat-card rounded-[1.35rem] p-5">
              <p className="auth-stat-value text-sm font-semibold uppercase tracking-[0.22em]">
                {value}
              </p>
              <p className="auth-copy mt-3 text-sm leading-6">{label}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
