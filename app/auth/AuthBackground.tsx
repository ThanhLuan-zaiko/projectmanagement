'use client';

import ColorBends from '@/components/ui/ColorBends';
import { useTheme } from '@/components/theme/ThemeProvider';

const LIGHT_COLORS = ['#4338CA', '#0284C7', '#DB2777'];
const DARK_COLORS = ['#FB7185', '#A855F7', '#38BDF8'];

export default function AuthBackground() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="absolute inset-0">
      <ColorBends
        className={`absolute inset-0 h-full w-full ${
          isLight ? 'auth-bends-canvas auth-bends-canvas-light' : 'auth-bends-canvas'
        }`}
        colors={isLight ? LIGHT_COLORS : DARK_COLORS}
        rotation={isLight ? 94 : 94}
        speed={isLight ? 0.12 : 0.22}
        scale={isLight ? 0.9 : 1.04}
        frequency={isLight ? 0.96 : 1}
        warpStrength={isLight ? 1.08 : 1.1}
        mouseInfluence={isLight ? 0.12 : 0.4}
        noise={isLight ? 0.01 : 0.08}
        parallax={isLight ? 0.15 : 0.36}
        iterations={1}
        intensity={isLight ? 1.48 : 1.45}
        bandWidth={isLight ? 6.1 : 6.2}
        transparent
        autoRotate={isLight ? 0.022 : 0.03}
      />
      <div className="auth-bends-glow auth-bends-glow-primary pointer-events-none absolute" />
      <div className="auth-bends-glow auth-bends-glow-secondary pointer-events-none absolute" />
      <div className="auth-bends-glow auth-bends-glow-tertiary pointer-events-none absolute" />
      <div className="auth-bends-overlay pointer-events-none absolute inset-0" />
      <div className="auth-bends-vignette pointer-events-none absolute inset-0" />
    </div>
  );
}
