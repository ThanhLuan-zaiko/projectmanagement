'use client';

import type { ReactNode } from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';
import MagicBento, { MagicBentoCard, type MagicBentoCardProps, type MagicBentoProps } from '@/components/ui/MagicBento';

type ProjectsBentoGridProps = Omit<MagicBentoProps, 'children' | 'glowColor'> & {
  children: ReactNode;
  className?: string;
  gridClassName?: string;
};

export function ProjectsBentoGrid({
  children,
  className = '',
  gridClassName = '',
  ...props
}: ProjectsBentoGridProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <MagicBento
      textAutoHide={false}
      enableStars
      enableSpotlight
      enableBorderGlow
      enableTilt={false}
      enableMagnetism={false}
      clickEffect
      spotlightRadius={isLight ? 340 : 420}
      particleCount={isLight ? 10 : 12}
      glowColor={isLight ? '96, 118, 255' : '132, 0, 255'}
      disableAnimations={false}
      className={`projects-bento-scope ${className}`.trim()}
      gridClassName={gridClassName}
      {...props}
    >
      {children}
    </MagicBento>
  );
}

export function ProjectsBentoCard({ className = '', ...props }: MagicBentoCardProps) {
  return <MagicBentoCard {...props} className={`projects-bento-card ${className}`.trim()} />;
}
