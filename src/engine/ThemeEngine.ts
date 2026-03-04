import type { ThemeConfig, ThemeMode } from '../types';
import { DEFAULT_THEME } from '../defaults';

const DARK_THEME_COLORS: ThemeConfig['colors'] = {
  primary: '#818cf8',
  background: 'rgba(0, 0, 0, 0.3)',
  surface: 'rgba(255, 255, 255, 0.05)',
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  border: 'rgba(255, 255, 255, 0.08)',
  success: '#4ade80',
  error: '#f87171',
};

const DARK_THEME_GLASS: ThemeConfig['glass'] = {
  blur: '12px',
  opacity: 0.1,
  gradient: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)'],
  shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
};

/**
 * Returns a complete default ThemeConfig for the given mode.
 */
export function getDefaultTheme(mode: ThemeMode): ThemeConfig {
  if (mode === 'dark') {
    return {
      ...DEFAULT_THEME,
      mode: 'dark',
      colors: { ...DARK_THEME_COLORS },
      glass: { ...DARK_THEME_GLASS },
    };
  }
  return { ...DEFAULT_THEME };
}

/**
 * Merges a partial consumer theme with the appropriate mode defaults,
 * producing a fully resolved ThemeConfig.
 */
export function resolveTokens(theme: Partial<ThemeConfig>): ThemeConfig {
  const mode = theme.mode ?? DEFAULT_THEME.mode;
  const base = getDefaultTheme(mode);

  return {
    mode,
    colors: theme.colors ? { ...base.colors, ...theme.colors } : { ...base.colors },
    spacing: theme.spacing ? { ...base.spacing, ...theme.spacing } : { ...base.spacing },
    radius: theme.radius ? { ...base.radius, ...theme.radius } : { ...base.radius },
    glass: theme.glass ? { ...base.glass, ...theme.glass } : { ...base.glass },
    motion: theme.motion ? { ...base.motion, ...theme.motion } : { ...base.motion },
    button: theme.button ? { ...base.button, ...theme.button } : { ...base.button },
  };
}

/**
 * Converts a resolved ThemeConfig into a flat map of CSS custom properties
 * following the naming convention: --soci-{category}-{token}
 */
export function toCSSProperties(resolved: ThemeConfig): Record<string, string> {
  const props: Record<string, string> = {};

  // Colors
  for (const [key, value] of Object.entries(resolved.colors)) {
    props[`--soci-color-${camelToKebab(key)}`] = value;
  }

  // Spacing
  for (const [key, value] of Object.entries(resolved.spacing)) {
    props[`--soci-spacing-${key}`] = value;
  }

  // Radius
  for (const [key, value] of Object.entries(resolved.radius)) {
    props[`--soci-radius-${key}`] = value;
  }

  // Glass
  props['--soci-glass-blur'] = resolved.glass.blur;
  props['--soci-glass-opacity'] = String(resolved.glass.opacity);
  props['--soci-glass-shadow'] = resolved.glass.shadow;
  props['--soci-glass-gradient'] = `linear-gradient(135deg, ${resolved.glass.gradient.join(', ')})`;

  // Motion
  props['--soci-motion-duration'] = resolved.motion.duration;
  props['--soci-motion-easing'] = resolved.motion.easing;

  // Button
  props['--soci-button-shape'] = resolved.button.shape;
  props['--soci-button-icon-position'] = resolved.button.iconPosition;
  props['--soci-button-size'] = resolved.button.size;

  return props;
}

/** Converts camelCase to kebab-case (e.g. textSecondary → text-secondary) */
function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}
