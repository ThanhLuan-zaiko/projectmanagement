'use client';

import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export type BubbleMenuItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  rotation?: number;
  isActive?: boolean;
  hoverStyles?: {
    bgColor?: string;
    textColor?: string;
  };
};

export type BubbleMenuProps = {
  logo: ReactNode | string;
  onMenuClick?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
  menuAriaLabel?: string;
  menuBg?: string;
  menuContentColor?: string;
  controlBg?: string;
  controlContentColor?: string;
  useFixedPosition?: boolean;
  overlayFixed?: boolean;
  contentMaxWidth?: string;
  pillMinHeight?: string;
  pillPadding?: string;
  pillFontSize?: string;
  items?: BubbleMenuItem[];
  activeHref?: string;
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
};

const DEFAULT_ITEMS: BubbleMenuItem[] = [
  {
    label: 'home',
    href: '#',
    ariaLabel: 'Home',
    rotation: -8,
    hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' }
  },
  {
    label: 'about',
    href: '#',
    ariaLabel: 'About',
    rotation: 8,
    hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' }
  },
  {
    label: 'projects',
    href: '#',
    ariaLabel: 'Documentation',
    rotation: 8,
    hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' }
  },
  {
    label: 'blog',
    href: '#',
    ariaLabel: 'Blog',
    rotation: 8,
    hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
  },
  {
    label: 'contact',
    href: '#',
    ariaLabel: 'Contact',
    rotation: -8,
    hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' }
  }
];

export default function BubbleMenu({
  logo,
  onMenuClick,
  className,
  style,
  overlayClassName,
  overlayStyle,
  menuAriaLabel = 'Toggle menu',
  menuBg = '#fff',
  menuContentColor = '#111',
  controlBg,
  controlContentColor,
  useFixedPosition = false,
  overlayFixed,
  contentMaxWidth = '1600px',
  pillMinHeight = '160px',
  pillPadding = 'clamp(1.5rem, 3vw, 8rem) 0',
  pillFontSize = 'clamp(1.5rem, 4vw, 4rem)',
  items,
  activeHref,
  animationEase = 'back.out(1.5)',
  animationDuration = 0.5,
  staggerDelay = 0.12
}: BubbleMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<HTMLAnchorElement[]>([]);
  const labelRefs = useRef<HTMLSpanElement[]>([]);

  const menuItems = items?.length ? items : DEFAULT_ITEMS;
  const shouldUseFixedOverlay = overlayFixed ?? useFixedPosition;
  const resolvedControlBg = controlBg ?? menuBg;
  const resolvedControlContentColor = controlContentColor ?? menuContentColor;

  const containerClassName = [
    'bubble-menu',
    useFixedPosition ? 'fixed' : 'absolute',
    'left-0 right-0 top-8',
    'flex items-center justify-between',
    'gap-4 px-8',
    'pointer-events-none',
    'z-[1001]',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const handleToggle = () => {
    const nextState = !isMenuOpen;
    if (nextState) setShowOverlay(true);
    setIsMenuOpen(nextState);
    onMenuClick?.(nextState);
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);
    if (!overlay || !bubbles.length) return;

    if (isMenuOpen) {
      gsap.set(overlay, { display: 'flex' });
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(labels, { y: 24, autoAlpha: 0 });

      bubbles.forEach((bubble, i) => {
        const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05);
        const tl = gsap.timeline({ delay });
        tl.to(bubble, {
          scale: 1,
          duration: animationDuration,
          ease: animationEase
        });
        if (labels[i]) {
          tl.to(
            labels[i],
            {
              y: 0,
              autoAlpha: 1,
              duration: animationDuration,
              ease: 'power3.out'
            },
            '-=' + animationDuration * 0.9
          );
        }
      });
    } else if (showOverlay) {
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.to(labels, {
        y: 24,
        autoAlpha: 0,
        duration: 0.2,
        ease: 'power3.in'
      });
      gsap.to(bubbles, {
        scale: 0,
        duration: 0.2,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(overlay, { display: 'none' });
          setShowOverlay(false);
        }
      });
    }
  }, [isMenuOpen, showOverlay, animationEase, animationDuration, staggerDelay]);

  useEffect(() => {
    const handleResize = () => {
      if (isMenuOpen) {
        const bubbles = bubblesRef.current.filter(Boolean);
        const isDesktop = window.innerWidth >= 900;
        bubbles.forEach((bubble, i) => {
          const item = menuItems[i];
          if (bubble && item) {
            const rotation = isDesktop ? (item.rotation ?? 0) : 0;
            gsap.set(bubble, { rotation });
          }
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen, menuItems]);

  return (
    <>
      {/* Workaround for silly Tailwind capabilities */}
      <style>{`
        .bubble-menu .menu-line {
          transition: transform 0.3s ease, opacity 0.3s ease;
          transform-origin: center;
        }
        .bubble-menu-items .pill-link[data-active='true'] {
          animation: bubble-active-bob 2.2s ease-in-out infinite;
          box-shadow: 0 18px 38px rgba(15, 23, 42, 0.22);
        }
        .bubble-menu-items .pill-link[data-active='true'] .pill-label {
          transform: scale(1.02);
        }
        .bubble-menu-items .pill-list .pill-col:nth-child(4):nth-last-child(2) {
          margin-left: calc(100% / 6);
        }
        .bubble-menu-items .pill-list .pill-col:nth-child(4):last-child {
          margin-left: calc(100% / 3);
        }
        @media (min-width: 900px) {
          .bubble-menu-items .pill-link {
            transform: rotate(var(--item-rot));
          }
          .bubble-menu-items .pill-link:hover {
            transform: rotate(var(--item-rot)) scale(1.06);
            background: var(--hover-bg) !important;
            color: var(--hover-color) !important;
          }
          .bubble-menu-items .pill-link:active {
            transform: rotate(var(--item-rot)) scale(.94);
          }
          .bubble-menu-items .pill-link[data-active='true']:hover {
            transform: rotate(var(--item-rot)) scale(1.08);
          }
        }
        @media (max-width: 899px) {
          .bubble-menu-items .pill-list {
            row-gap: 16px;
          }
          .bubble-menu-items .pill-list .pill-col {
            flex: 0 0 100% !important;
            margin-left: 0 !important;
            overflow: visible;
          }
          .bubble-menu-items .pill-link {
            font-size: clamp(1.2rem, 3vw, 4rem);
            padding: clamp(1rem, 2vw, 2rem) 0;
            min-height: 80px !important;
          }
          .bubble-menu-items .pill-link:hover {
            transform: scale(1.06);
            background: var(--hover-bg);
            color: var(--hover-color);
          }
          .bubble-menu-items .pill-link:active {
            transform: scale(.94);
          }
        }
        @keyframes bubble-active-bob {
          0%, 100% {
            transform: rotate(var(--item-rot)) scale(1.03) translateY(0);
          }
          50% {
            transform: rotate(var(--item-rot)) scale(1.06) translateY(-6px);
          }
        }
      `}</style>

      <nav className={containerClassName} style={style} aria-label="Main navigation">
        <div
          className={[
            'bubble logo-bubble',
            'inline-flex items-center justify-center',
            'rounded-full',
            'bg-white',
            'shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
            'pointer-events-auto',
            'h-12 md:h-14',
            'px-4 md:px-8',
            'gap-2',
            'will-change-transform'
          ].join(' ')}
          aria-label="Logo"
          style={{
            background: resolvedControlBg,
            color: resolvedControlContentColor,
            minHeight: '48px',
            borderRadius: '9999px'
          }}
        >
          <span
            className={['logo-content', 'inline-flex min-w-[120px] items-center justify-center px-1 h-full'].join(' ')}
            style={
              {
                ['--logo-max-height']: '60%',
                ['--logo-max-width']: '100%'
              } as CSSProperties
            }
          >
            {typeof logo === 'string' ? (
              <img src={logo} alt="Logo" className="bubble-logo max-h-[60%] max-w-full object-contain block" />
            ) : (
              logo
            )}
          </span>
        </div>

        <button
          type="button"
          className={[
            'bubble toggle-bubble menu-btn',
            isMenuOpen ? 'open' : '',
            'inline-flex flex-col items-center justify-center',
            'rounded-full',
            'bg-white',
            'shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
            'pointer-events-auto',
            'w-12 h-12 md:w-14 md:h-14',
            'border-0 cursor-pointer p-0',
            'will-change-transform'
          ].join(' ')}
          onClick={handleToggle}
          aria-label={menuAriaLabel}
          aria-pressed={isMenuOpen}
          style={{ background: resolvedControlBg }}
        >
          <span
            className="menu-line block mx-auto rounded-[2px]"
            style={{
              width: 26,
              height: 2,
              background: resolvedControlContentColor,
              transform: isMenuOpen ? 'translateY(4px) rotate(45deg)' : 'none'
            }}
          />
          <span
            className="menu-line short block mx-auto rounded-[2px]"
            style={{
              marginTop: '6px',
              width: 26,
              height: 2,
              background: resolvedControlContentColor,
              transform: isMenuOpen ? 'translateY(-4px) rotate(-45deg)' : 'none'
            }}
          />
        </button>
      </nav>

      {showOverlay && (
        <div
          ref={overlayRef}
          className={[
            'bubble-menu-items',
            shouldUseFixedOverlay ? 'fixed' : 'absolute',
            'inset-0',
            'flex items-start justify-center overflow-y-auto px-4 py-24 md:px-6 md:py-28',
            'pointer-events-none',
            'z-[1000]',
            overlayClassName
          ].join(' ')}
          style={overlayStyle}
          aria-hidden={!isMenuOpen}
        >
          <ul
            className={[
              'pill-list',
              'list-none m-0 px-2 md:px-6',
              'w-full mx-auto',
              'flex flex-wrap',
              'gap-x-0 gap-y-3 md:gap-y-4',
              'relative z-[1]',
              'pointer-events-auto'
            ].join(' ')}
            role="menu"
            aria-label="Menu links"
            style={{ maxWidth: contentMaxWidth }}
          >
            {menuItems.map((item, idx) => (
              <li
                key={item.href}
                role="none"
                className={[
                  'pill-col',
                  'flex justify-center items-stretch',
                  '[flex:0_0_calc(100%/3)]',
                  'box-border'
                ].join(' ')}
              >
                <Link
                  role="menuitem"
                  href={item.href}
                  prefetch={true}
                  aria-label={item.ariaLabel || item.label}
                  aria-current={item.isActive || item.href === activeHref ? 'page' : undefined}
                  data-active={item.isActive || item.href === activeHref ? 'true' : 'false'}
                  className={[
                    'pill-link',
                    'w-full',
                    'rounded-[999px]',
                    'no-underline',
                    'bg-white',
                    'text-inherit',
                    'shadow-[0_4px_14px_rgba(0,0,0,0.10)]',
                    'flex items-center justify-center',
                    'relative',
                    'transition-[background,color] duration-300 ease-in-out',
                    'box-border',
                    'whitespace-nowrap overflow-hidden',
                    item.isActive || item.href === activeHref ? 'ring-2 ring-white/70' : ''
                  ].join(' ')}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onMenuClick?.(false);
                  }}
                  style={
                    {
                      ['--item-rot']: `${item.rotation ?? 0}deg`,
                      ['--pill-bg']:
                        item.isActive || item.href === activeHref
                          ? item.hoverStyles?.bgColor || menuBg
                          : menuBg,
                      ['--pill-color']:
                        item.isActive || item.href === activeHref
                          ? item.hoverStyles?.textColor || menuContentColor
                          : menuContentColor,
                      ['--hover-bg']: item.hoverStyles?.bgColor || '#f3f4f6',
                      ['--hover-color']: item.hoverStyles?.textColor || menuContentColor,
                      background: 'var(--pill-bg)',
                      color: 'var(--pill-color)',
                      minHeight: `var(--pill-min-h, ${pillMinHeight})`,
                      padding: pillPadding,
                      fontSize: pillFontSize,
                      fontWeight: 400,
                      lineHeight: 0,
                      willChange: 'transform',
                      height: 10,
                      boxShadow:
                        item.isActive || item.href === activeHref
                          ? '0 16px 36px rgba(15, 23, 42, 0.18)'
                          : undefined
                    } as CSSProperties
                  }
                  ref={el => {
                    if (el) bubblesRef.current[idx] = el;
                  }}
                >
                  <span
                    className="pill-label inline-block"
                    style={{
                      willChange: 'transform, opacity',
                      height: '1.2em',
                      lineHeight: 1.2
                    }}
                    ref={el => {
                      if (el) labelRefs.current[idx] = el;
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
