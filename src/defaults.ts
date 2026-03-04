import type { ThemeConfig, LayoutConfig, BehaviorConfig, ButtonVariant, ProviderName } from './types';

export const DEFAULT_THEME: ThemeConfig = {
  mode: 'light',
  colors: {
    primary: '#6366f1',
    background: 'rgba(255, 255, 255, 0.05)',
    surface: 'rgba(255, 255, 255, 0.1)',
    text: '#1a1a2e',
    textSecondary: '#64748b',
    border: 'rgba(255, 255, 255, 0.18)',
    success: '#22c55e',
    error: '#ef4444',
  },
  spacing: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
  radius: { sm: '6px', md: '10px', lg: '16px', full: '9999px' },
  glass: {
    blur: '12px',
    opacity: 0.15,
    gradient: ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)'],
    shadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  },
  motion: { duration: '200ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  button: { shape: 'rounded', iconPosition: 'left', size: 'medium' },
};

export const DEFAULT_LAYOUT: LayoutConfig = {
  alignment: 'center',
  spacing: '12px',
  showLabels: true,
  showDividers: false,
  direction: 'vertical',
};

export const DEFAULT_BEHAVIOR: BehaviorConfig = {
  autoRedirect: { enabled: false },
};

export const DEFAULT_BUTTON_VARIANT: ButtonVariant = 'icon-plus-text';

export const DEFAULT_LABELS: Record<ProviderName, string> = {
  google: 'Sign in with Google',
  apple: 'Sign in with Apple',
  facebook: 'Sign in with Facebook',
  github: 'Sign in with GitHub',
};
