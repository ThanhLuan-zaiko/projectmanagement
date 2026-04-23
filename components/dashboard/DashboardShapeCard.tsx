'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';
import ShapeBlur from '@/components/ui/ShapeBlur';

interface DashboardShapeCardProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  muted?: boolean;
  compact?: boolean;
  variation?: number;
}

export default function DashboardShapeCard({
  children,
  className = '',
  contentClassName = '',
  muted = false,
  compact = false,
  variation = 0,
}: DashboardShapeCardProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const cardRef = useRef<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);
  const radiusClassName = compact ? 'rounded-[22px]' : 'rounded-[28px]';
  const panelRadiusClassName = compact ? 'rounded-[16px]' : 'rounded-[20px]';
  const crispScaleX = Math.max(aspectRatio * (compact ? 0.98 : 1.05), compact ? 1.7 : 2.7);
  const crispScaleY = compact ? 1.28 : 1.52;
  const smokeScaleX = crispScaleX * 1.14;
  const smokeScaleY = crispScaleY * 1.2;
  const panelInsetClassName = compact ? 'inset-[8px]' : 'inset-[12px]';
  const shellClassName = isLight
    ? 'border-slate-200/70 bg-white/72 shadow-[0_22px_52px_-30px_rgba(148,163,184,0.3),0_14px_32px_-28px_rgba(96,165,250,0.16),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-[22px] backdrop-saturate-160'
    : 'border-white/12 bg-white/[0.045] shadow-[0_24px_58px_-34px_rgba(2,6,23,0.96),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[24px] backdrop-saturate-160';
  const hoverClassName = isLight
    ? 'hover:border-slate-200/90 hover:bg-white/84 hover:shadow-[0_30px_68px_-34px_rgba(148,163,184,0.34),0_18px_42px_-28px_rgba(96,165,250,0.22),inset_0_1px_0_rgba(255,255,255,0.92)]'
    : 'hover:border-white/18 hover:bg-white/[0.06] hover:shadow-[0_32px_74px_-34px_rgba(59,130,246,0.2),0_0_42px_rgba(129,140,248,0.08),inset_0_1px_0_rgba(255,255,255,0.13)]';
  const baseGradientClassName = isLight
    ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.66),rgba(255,255,255,0.42)_12%,rgba(248,250,252,0.34)_40%,rgba(226,232,240,0.18)_100%)]'
    : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)_12%,rgba(15,23,42,0.08)_40%,rgba(2,6,23,0.22)_100%)]';
  const glossGradientClassName = isLight
    ? 'bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.82),transparent_24%),radial-gradient(circle_at_100%_100%,rgba(96,165,250,0.14),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.38),transparent_18%,rgba(99,102,241,0.08)_54%,transparent_75%)]'
    : 'bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.18),transparent_22%),radial-gradient(circle_at_100%_100%,rgba(96,165,250,0.08),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_18%,rgba(99,102,241,0.05)_54%,transparent_75%)]';
  const panelClassName = isLight
    ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.9)_24%,rgba(241,245,249,0.86)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]'
    : 'bg-[linear-gradient(180deg,rgba(7,13,28,0.97),rgba(8,15,31,0.955)_20%,rgba(10,18,38,0.92)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]';
  const overlayClassName = isLight
    ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.3),transparent_16%,transparent_74%,rgba(226,232,240,0.18))]'
    : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.072),transparent_16%,transparent_74%,rgba(255,255,255,0.018))]';

  useEffect(() => {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    const updateAspectRatio = () => {
      const nextWidth = card.clientWidth;
      const nextHeight = card.clientHeight;

      if (nextWidth === 0 || nextHeight === 0) {
        return;
      }

      setAspectRatio(nextWidth / nextHeight);
    };

    updateAspectRatio();

    const observer = new ResizeObserver(updateAspectRatio);
    observer.observe(card);

    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      className={`group relative isolate overflow-hidden transition-all duration-300 ease-out ${radiusClassName} ${shellClassName} ${
        muted
          ? 'opacity-65'
          : `hover:-translate-y-1 ${hoverClassName}`
      } ${className}`}
      onPointerEnter={() => {
        setIsHovered(true);
        setHasActivated(true);
      }}
      onPointerLeave={() => setIsHovered(false)}
      onFocusCapture={() => {
        setIsHovered(true);
        setHasActivated(true);
      }}
      onBlurCapture={() => setIsHovered(false)}
    >
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden ${radiusClassName}`}
      >
        <div className={`absolute inset-0 ${baseGradientClassName}`} />
        <div className={`absolute inset-0 opacity-90 ${glossGradientClassName}`} />

        {hasActivated ? (
          <>
            <div
              className={`absolute inset-[-22%] transition-opacity duration-300 ease-out ${
                isLight ? 'mix-blend-normal' : 'mix-blend-screen'
              } ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: `scale(${smokeScaleX}, ${smokeScaleY})`,
                transformOrigin: 'center',
                filter: isLight
                  ? 'blur(18px) brightness(1.08) saturate(0.86) drop-shadow(0 0 14px rgba(129,140,248,0.18))'
                  : 'blur(20px) brightness(2) saturate(0.72)',
              }}
            >
              <ShapeBlur
                variation={variation}
                pixelRatioProp={typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1}
                shapeSize={compact ? 1.56 : 1.78}
                roundness={compact ? 0.54 : 0.62}
                borderSize={compact ? 0.06 : 0.068}
                circleSize={0.34}
                circleEdge={1.18}
              />
            </div>

            <div
              className={`absolute inset-[-18%] transition-opacity duration-300 ease-out ${
                isLight ? 'mix-blend-normal' : 'mix-blend-screen'
              } ${
                isHovered ? 'opacity-96' : 'opacity-0'
              }`}
              style={{
                transform: `scale(${crispScaleX}, ${crispScaleY})`,
                transformOrigin: 'center',
                filter: isLight
                  ? 'blur(0.4px) brightness(1.02) drop-shadow(0 0 8px rgba(129,140,248,0.16))'
                  : 'blur(0.35px) brightness(1.22)',
              }}
            >
              <ShapeBlur
                variation={variation}
                pixelRatioProp={typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1}
                shapeSize={compact ? 1.44 : 1.64}
                roundness={compact ? 0.52 : 0.6}
                borderSize={compact ? 0.046 : 0.05}
                circleSize={0.26}
                circleEdge={0.92}
              />
            </div>
          </>
        ) : null}

        <div
          className={`absolute ${panelInsetClassName} ${panelRadiusClassName} ${panelClassName}`}
        />
        <div className={`absolute inset-0 ${overlayClassName} opacity-80 transition-opacity duration-300 group-hover:opacity-100`} />
        <div className={`absolute left-6 right-6 top-[1px] h-px bg-gradient-to-r from-transparent ${isLight ? 'via-white/90' : 'via-white/75'} to-transparent opacity-55 blur-[1px]`} />
        <div className={`absolute left-8 top-0 h-8 w-28 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_72%)] blur-md ${isLight ? 'opacity-75' : 'opacity-55'}`} />
        <div className={`absolute -left-8 top-0 h-full w-20 bg-[linear-gradient(90deg,rgba(255,255,255,0.05),transparent)] blur-xl ${isLight ? 'opacity-28' : 'opacity-20'}`} />
        <div className={`absolute -right-10 top-6 h-[75%] w-24 bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.08))] blur-xl ${isLight ? 'opacity-24' : 'opacity-18'}`} />
      </div>

      <div
        className={`pointer-events-none absolute inset-[1px] border ${
          isLight ? 'border-slate-200/70' : 'border-white/7'
        } ${compact ? 'rounded-[21px]' : 'rounded-[27px]'}`}
      />

      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </article>
  );
}
