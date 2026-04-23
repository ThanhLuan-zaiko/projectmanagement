'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
  type ReactNode,
} from 'react';
import { gsap } from 'gsap';

export interface MagicBentoCardProps {
  color?: string;
  title?: string;
  description?: string;
  label?: string;
  textAutoHide?: boolean;
  disableAnimations?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export interface MagicBentoProps {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
  children?: ReactNode;
  className?: string;
  gridClassName?: string;
  style?: CSSProperties;
  cards?: MagicBentoCardProps[];
}

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

const defaultCardData: MagicBentoCardProps[] = [
  {
    color: '#120F17',
    title: 'Analytics',
    description: 'Track user behavior',
    label: 'Insights',
  },
  {
    color: '#120F17',
    title: 'Dashboard',
    description: 'Centralized data view',
    label: 'Overview',
  },
  {
    color: '#120F17',
    title: 'Collaboration',
    description: 'Work together seamlessly',
    label: 'Teamwork',
  },
  {
    color: '#120F17',
    title: 'Automation',
    description: 'Streamline workflows',
    label: 'Efficiency',
  },
  {
    color: '#120F17',
    title: 'Integration',
    description: 'Connect favorite tools',
    label: 'Connectivity',
  },
  {
    color: '#120F17',
    title: 'Security',
    description: 'Enterprise-grade protection',
    label: 'Protection',
  },
];

interface MagicBentoContextValue {
  textAutoHide: boolean;
  enableStars: boolean;
  enableBorderGlow: boolean;
  disableAnimations: boolean;
  particleCount: number;
  glowColor: string;
  enableTilt: boolean;
  clickEffect: boolean;
  enableMagnetism: boolean;
}

const MagicBentoContext = createContext<MagicBentoContextValue | null>(null);

const createParticleElement = (x: number, y: number, glowColor: string): HTMLDivElement => {
  const element = document.createElement('div');
  element.className = 'magic-bento-particle';
  element.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 9999px;
    background: rgba(${glowColor}, 1);
    box-shadow: 0 0 6px rgba(${glowColor}, 0.72);
    pointer-events: none;
    z-index: 30;
    left: ${x}px;
    top: ${y}px;
  `;
  return element;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.52,
  fadeDistance: radius * 0.82,
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glowIntensity: number,
  radius: number
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glowIntensity.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}

function ParticleCard({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
}: {
  children: ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const particleTemplatesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);
  const particlesInitialized = useRef(false);
  const isHoveredRef = useRef(false);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) {
      return;
    }

    const { width, height } = cardRef.current.getBoundingClientRect();
    particleTemplatesRef.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [glowColor, particleCount]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.24,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.remove();
        },
      });
    });

    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) {
      return;
    }

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    particleTemplatesRef.current.forEach((template, index) => {
      const timeoutId = setTimeout(() => {
        if (!cardRef.current || !isHoveredRef.current) {
          return;
        }

        const particle = template.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(particle);
        particlesRef.current.push(particle);

        gsap.fromTo(
          particle,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.26, ease: 'back.out(1.7)' }
        );

        gsap.to(particle, {
          x: (Math.random() - 0.5) * 90,
          y: (Math.random() - 0.5) * 90,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 1.8,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });

        gsap.to(particle, {
          opacity: 0.28,
          duration: 1.4,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true,
        });
      }, index * 90);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) {
      return;
    }

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 4,
          rotateY: 4,
          duration: 0.24,
          ease: 'power2.out',
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.24,
          ease: 'power2.out',
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.24,
          ease: 'power2.out',
        });
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        magnetismAnimationRef.current = gsap.to(element, {
          x: (x - centerX) * 0.045,
          y: (y - centerY) * 0.045,
          duration: 0.24,
          ease: 'power2.out',
        });
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!clickEffect) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 9999px;
        background: radial-gradient(circle, rgba(${glowColor}, 0.3) 0%, rgba(${glowColor}, 0.16) 30%, transparent 72%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 40;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.72,
          ease: 'power2.out',
          onComplete: () => ripple.remove(),
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, clickEffect, disableAnimations, enableMagnetism, enableTilt, glowColor]);

  return (
    <div
      ref={cardRef}
      className={`${className} relative overflow-hidden`.trim()}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
    >
      {children}
    </div>
  );
}

function GlobalSpotlight({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}: {
  gridRef: RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}) {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef.current || !enabled) {
      return;
    }

    const spotlight = document.createElement('div');
    spotlight.className = 'magic-bento-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 760px;
      height: 760px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.14) 0%,
        rgba(${glowColor}, 0.08) 16%,
        rgba(${glowColor}, 0.04) 30%,
        rgba(${glowColor}, 0.015) 45%,
        transparent 72%
      );
      z-index: 150;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;

    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (event: MouseEvent) => {
      if (!gridRef.current || !spotlightRef.current) {
        return;
      }

      const scope = gridRef.current.closest('.magic-bento-scope');
      const bounds = scope?.getBoundingClientRect();
      const isInside =
        !!bounds &&
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      const cards = gridRef.current.querySelectorAll<HTMLElement>('.card');

      if (!isInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
        cards.forEach((card) => {
          card.style.setProperty('--glow-intensity', '0');
        });
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance =
          Math.hypot(event.clientX - centerX, event.clientY - centerY) - Math.max(rect.width, rect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(card, event.clientX, event.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, {
        left: event.clientX,
        top: event.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.78
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.78
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.18 : 0.42,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gridRef.current?.querySelectorAll<HTMLElement>('.card').forEach((card) => {
        card.style.setProperty('--glow-intensity', '0');
      });

      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.24,
          ease: 'power2.out',
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.remove();
    };
  }, [disableAnimations, enabled, glowColor, gridRef, spotlightRadius]);

  return null;
}

export function MagicBentoCard({
  color,
  title,
  description,
  label,
  textAutoHide,
  disableAnimations,
  className = '',
  style,
  children,
}: MagicBentoCardProps) {
  const context = useContext(MagicBentoContext);

  const resolvedTextAutoHide = textAutoHide ?? context?.textAutoHide ?? true;
  const resolvedDisableAnimations = disableAnimations ?? context?.disableAnimations ?? false;
  const enableStars = context?.enableStars ?? true;
  const enableBorderGlow = context?.enableBorderGlow ?? true;
  const particleCount = context?.particleCount ?? DEFAULT_PARTICLE_COUNT;
  const glowColor = context?.glowColor ?? DEFAULT_GLOW_COLOR;
  const enableTilt = context?.enableTilt ?? false;
  const clickEffect = context?.clickEffect ?? true;
  const enableMagnetism = context?.enableMagnetism ?? false;

  const content = children ?? (
    <>
      {(label || title || description) && (
        <>
          <div className="magic-bento-card__header relative z-10 flex justify-between gap-3">
            {label ? <span className="magic-bento-card__label text-base">{label}</span> : <span />}
          </div>
          <div className="magic-bento-card__content relative z-10 flex flex-col">
            {title ? (
              <h3 className={`magic-bento-card__title m-0 mb-1 font-normal ${resolvedTextAutoHide ? 'magic-bento-text-clamp-1' : ''}`}>
                {title}
              </h3>
            ) : null}
            {description ? (
              <p
                className={`magic-bento-card__description leading-5 opacity-90 ${resolvedTextAutoHide ? 'magic-bento-text-clamp-2' : ''}`}
              >
                {description}
              </p>
            ) : null}
          </div>
        </>
      )}
    </>
  );

  const cardClassName = `magic-bento-card card flex min-h-[200px] flex-col justify-between gap-6 rounded-[28px] border p-5 sm:p-6 ${
    enableBorderGlow ? 'magic-bento-card--border-glow' : ''
  } ${className}`.trim();

  const cardStyle: CSSProperties = {
    background: color || 'var(--magic-bento-card-bg, #120F17)',
    borderColor: 'var(--magic-bento-border, #2F293A)',
    color: 'var(--magic-bento-text, hsl(0 0% 100%))',
    ...style,
  };

  if (enableStars) {
    return (
      <ParticleCard
        className={cardClassName}
        style={cardStyle}
        disableAnimations={resolvedDisableAnimations}
        particleCount={particleCount}
        glowColor={glowColor}
        enableTilt={enableTilt}
        clickEffect={clickEffect}
        enableMagnetism={enableMagnetism}
      >
        <div className="relative z-10 flex h-full flex-col justify-between gap-6">{content}</div>
      </ParticleCard>
    );
  }

  return (
    <div className={cardClassName} style={cardStyle}>
      <div className="relative z-10 flex h-full flex-col justify-between gap-6">{content}</div>
    </div>
  );
}

export default function MagicBento({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
  children,
  className = '',
  gridClassName = '',
  style,
  cards,
}: MagicBentoProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  const providerValue = useMemo<MagicBentoContextValue>(
    () => ({
      textAutoHide,
      enableStars,
      enableBorderGlow,
      disableAnimations: shouldDisableAnimations,
      particleCount,
      glowColor,
      enableTilt,
      clickEffect,
      enableMagnetism,
    }),
    [
      clickEffect,
      enableBorderGlow,
      enableMagnetism,
      enableStars,
      enableTilt,
      glowColor,
      particleCount,
      shouldDisableAnimations,
      textAutoHide,
    ]
  );

  const fallbackCards = cards ?? defaultCardData;
  const hasCustomChildren = Boolean(children);

  return (
    <MagicBentoContext.Provider value={providerValue}>
      <div className={`magic-bento-scope relative ${className}`.trim()} style={style}>
        <style>
          {`
            .magic-bento-scope {
              --glow-x: 50%;
              --glow-y: 50%;
              --glow-intensity: 0;
              --glow-radius: 200px;
              --magic-bento-glow-color: ${glowColor};
              --magic-bento-border: #2F293A;
              --magic-bento-card-bg: #120F17;
              --magic-bento-text: hsl(0 0% 100%);
              --magic-bento-shadow: 0 24px 56px rgba(2, 6, 23, 0.24);
            }

            .magic-bento-grid {
              display: grid;
              width: 100%;
              gap: 0.75rem;
            }

            .magic-bento-grid--demo {
              grid-template-columns: 1fr;
              padding: 0.75rem;
            }

            @media (min-width: 640px) {
              .magic-bento-grid--demo {
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }
            }

            @media (min-width: 1280px) {
              .magic-bento-grid--demo {
                grid-template-columns: repeat(4, minmax(0, 1fr));
              }

              .magic-bento-grid--demo > :nth-child(3) {
                grid-column: span 2 / span 2;
                grid-row: span 2 / span 2;
              }

              .magic-bento-grid--demo > :nth-child(4) {
                grid-column: 1 / span 2;
                grid-row: 2 / span 2;
              }

              .magic-bento-grid--demo > :nth-child(6) {
                grid-column: 4;
                grid-row: 3;
              }
            }

            .magic-bento-card {
              position: relative;
              overflow: hidden;
              transition:
                transform 180ms ease,
                box-shadow 180ms ease,
                background-color 180ms ease,
                border-color 180ms ease;
              box-shadow: var(--magic-bento-shadow);
              isolation: isolate;
            }

            .magic-bento-card:hover {
              transform: translateY(-2px);
            }

            .magic-bento-card--border-glow::after {
              content: '';
              position: absolute;
              inset: 0;
              padding: 1.25px;
              background:
                radial-gradient(
                  var(--glow-radius) circle at var(--glow-x) var(--glow-y),
                  rgba(${glowColor}, calc(var(--glow-intensity) * 0.8)) 0%,
                  rgba(${glowColor}, calc(var(--glow-intensity) * 0.36)) 30%,
                  transparent 62%
                );
              border-radius: inherit;
              -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor;
              mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              mask-composite: exclude;
              pointer-events: none;
              opacity: 1;
              z-index: 2;
            }

            .magic-bento-card__label {
              letter-spacing: 0.18em;
              text-transform: uppercase;
              opacity: 0.8;
            }

            .magic-bento-card__title {
              font-size: clamp(1.15rem, 0.95rem + 0.45vw, 1.55rem);
              line-height: 1.08;
            }

            .magic-bento-card__description {
              font-size: 0.85rem;
            }

            .magic-bento-particle::before {
              content: '';
              position: absolute;
              inset: -2px;
              border-radius: inherit;
              background: rgba(${glowColor}, 0.18);
              z-index: -1;
            }

            .magic-bento-text-clamp-1 {
              display: -webkit-box;
              overflow: hidden;
              text-overflow: ellipsis;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1;
              line-clamp: 1;
            }

            .magic-bento-text-clamp-2 {
              display: -webkit-box;
              overflow: hidden;
              text-overflow: ellipsis;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              line-clamp: 2;
            }
          `}
        </style>

        {enableSpotlight ? (
          <GlobalSpotlight
            gridRef={gridRef}
            disableAnimations={shouldDisableAnimations}
            enabled={enableSpotlight}
            spotlightRadius={spotlightRadius}
            glowColor={glowColor}
          />
        ) : null}

        <div
          ref={gridRef}
          className={`magic-bento-grid ${hasCustomChildren ? '' : 'magic-bento-grid--demo'} ${gridClassName}`.trim()}
        >
          {hasCustomChildren
            ? children
            : fallbackCards.map((card, index) => <MagicBentoCard key={`${card.title || 'card'}-${index}`} {...card} />)}
        </div>
      </div>
    </MagicBentoContext.Provider>
  );
}
