import React, { useMemo, useCallback } from 'react';
import type {
  ProviderName,
  ButtonVariant,
  ButtonShape,
  IconPosition,
  ButtonSize,
  ThemeConfig,
  LayoutConfig,
  AnalyticsEvent,
} from '../types';
import { DEFAULT_THEME, DEFAULT_LABELS, DEFAULT_BUTTON_VARIANT } from '../defaults';
import { useSociAuth } from '../hooks/useSociAuth';

// ─── Default Provider SVG Icons ──────────────────────────────────

const GoogleIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const FacebookIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z" fill="#1877F2" />
  </svg>
);

const GitHubIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const DEFAULT_ICONS: Record<ProviderName, React.FC<{ size: number }>> = {
  google: GoogleIcon,
  apple: AppleIcon,
  facebook: FacebookIcon,
  github: GitHubIcon,
};

// ─── Style Helpers ───────────────────────────────────────────────

const SHAPE_RADIUS: Record<ButtonShape, string> = {
  pill: '9999px',
  rounded: '10px',
  square: '0',
};

const SIZE_HEIGHT: Record<ButtonSize, number> = {
  small: 32,
  medium: 40,
  large: 48,
};

const SIZE_FONT: Record<ButtonSize, number> = {
  small: 13,
  medium: 14,
  large: 16,
};

const SIZE_ICON: Record<ButtonSize, number> = {
  small: 16,
  medium: 20,
  large: 24,
};

const SIZE_PADDING: Record<ButtonSize, string> = {
  small: '0 12px',
  medium: '0 16px',
  large: '0 20px',
};

// ─── Props ───────────────────────────────────────────────────────

export interface SocialButtonProps {
  provider: ProviderName;
  label?: string;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  theme?: Partial<ThemeConfig>;
  layout?: Partial<LayoutConfig>;
  enable3DDepth?: boolean;
  enableHoverFill?: boolean;
  hoverFillColor?: string;
  contentAlignment?: 'left' | 'center' | 'right';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Component ───────────────────────────────────────────────────

const SocialButtonInner: React.FC<SocialButtonProps> = ({
  provider,
  label,
  icon,
  variant,
  theme,
  layout: _layout,
  enable3DDepth = false,
  enableHoverFill = false,
  hoverFillColor,
  contentAlignment,
  onClick,
  disabled = false,
  className,
  style,
}) => {
  // Try to get context — may be null if used standalone
  let contextValue: ReturnType<typeof useSociAuth> | null = null;
  try {
    contextValue = useSociAuth();
  } catch {
    // Used outside SociAuthProvider — that's fine for standalone usage
  }

  // Resolve theme values
  const resolvedTheme = useMemo<ThemeConfig>(() => {
    const base = contextValue?.theme ?? DEFAULT_THEME;
    if (!theme) return base;
    return {
      ...base,
      ...theme,
      colors: theme.colors ? { ...base.colors, ...theme.colors } : base.colors,
      button: theme.button ? { ...base.button, ...theme.button } : base.button,
      glass: theme.glass ? { ...base.glass, ...theme.glass } : base.glass,
      motion: theme.motion ? { ...base.motion, ...theme.motion } : base.motion,
    };
  }, [contextValue?.theme, theme]);

  const resolvedVariant: ButtonVariant = variant ?? contextValue?.config?.buttonVariant ?? DEFAULT_BUTTON_VARIANT;
  const resolvedLabel = label ?? DEFAULT_LABELS[provider];
  const ariaLabel = resolvedLabel;

  const shape = resolvedTheme.button.shape;
  const iconPosition = resolvedTheme.button.iconPosition;
  const size = resolvedTheme.button.size;

  // Analytics helper
  const emitAnalytics = useCallback(
    (interactionType: AnalyticsEvent['interactionType']) => {
      const analyticsHook = contextValue?.config?.behavior?.analytics?.hook;
      if (analyticsHook) {
        analyticsHook({
          provider,
          interactionType,
          timestamp: Date.now(),
        });
      }
    },
    [contextValue?.config?.behavior?.analytics?.hook, provider],
  );

  // Click handler
  const handleClick = useCallback(() => {
    if (disabled) return;
    emitAnalytics('click');
    if (onClick) {
      onClick();
    } else if (contextValue?.triggerOAuth) {
      contextValue.triggerOAuth(provider);
    }
  }, [disabled, emitAnalytics, onClick, contextValue?.triggerOAuth, provider]);

  // Keyboard handler — Enter and Space trigger click
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  const handleMouseEnter = useCallback(() => {
    emitAnalytics('hover');
  }, [emitAnalytics]);

  const handleFocus = useCallback(() => {
    emitAnalytics('focus');
  }, [emitAnalytics]);

  // Render icon
  const iconSize = SIZE_ICON[size];
  const renderedIcon = useMemo(() => {
    if (icon) return icon;
    const DefaultIcon = DEFAULT_ICONS[provider];
    return <DefaultIcon size={iconSize} />;
  }, [icon, provider, iconSize]);

  // Determine what to show based on variant
  const showIcon = resolvedVariant !== 'text-only';
  const showLabel = resolvedVariant !== 'icon-only';

  // Build styles
  const buttonStyle = useMemo<React.CSSProperties>(() => {
    const height = SIZE_HEIGHT[size];
    const isIconOnly = resolvedVariant === 'icon-only';

    const base: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: contentAlignment === 'left' ? 'flex-start' : contentAlignment === 'right' ? 'flex-end' : 'center',
      gap: iconPosition === 'top' ? '4px' : '8px',
      flexDirection: iconPosition === 'top' ? 'column' : (iconPosition === 'right' ? 'row-reverse' : 'row'),
      height,
      minWidth: isIconOnly ? height : undefined,
      padding: isIconOnly ? '0' : SIZE_PADDING[size],
      borderRadius: SHAPE_RADIUS[shape],
      border: `1px solid var(--soci-color-border, ${resolvedTheme.colors.border})`,
      background: `linear-gradient(135deg, rgba(255, 255, 255, ${Math.min(resolvedTheme.glass.opacity + 0.15, 0.9)}), rgba(255, 255, 255, ${Math.min(resolvedTheme.glass.opacity * 0.5, 0.5)}))`,
      backdropFilter: `blur(var(--soci-glass-blur, ${resolvedTheme.glass.blur}))`,
      WebkitBackdropFilter: `blur(var(--soci-glass-blur, ${resolvedTheme.glass.blur}))`,
      boxShadow: `var(--soci-glass-shadow, ${resolvedTheme.glass.shadow})`,
      color: `var(--soci-color-text, ${resolvedTheme.colors.text})`,
      fontSize: SIZE_FONT[size],
      fontFamily: 'inherit',
      fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: `all var(--soci-motion-duration, ${resolvedTheme.motion.duration}) var(--soci-motion-easing, ${resolvedTheme.motion.easing})`,
      outline: 'none',
      position: 'relative',
      overflow: enableHoverFill ? 'hidden' : (enable3DDepth ? 'visible' : 'hidden'),
      userSelect: 'none',
      whiteSpace: 'nowrap',
      ['--soci-hover-fill-color' as string]: hoverFillColor || undefined,
      ...style,
    };

    return base;
  }, [size, resolvedVariant, iconPosition, shape, resolvedTheme, disabled, style, enable3DDepth, enableHoverFill, hoverFillColor, contentAlignment]);

  // Build resolved className with optional 3D depth class
  const resolvedClassName = useMemo(() => {
    const classes: string[] = [];
    if (enable3DDepth) classes.push('soci-3d-depth');
    if (enableHoverFill) classes.push('soci-hover-fill');
    if (className) classes.push(className);
    return classes.length > 0 ? classes.join(' ') : undefined;
  }, [enable3DDepth, enableHoverFill, className]);

  return (
    <button
      type="button"
      role="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className={resolvedClassName}
      style={buttonStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      data-provider={provider}
      data-variant={resolvedVariant}
      data-size={size}
    >
      {showIcon && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {renderedIcon}
        </span>
      )}
      {showLabel && (
        <span style={{ lineHeight: 1 }}>
          {resolvedLabel}
        </span>
      )}
    </button>
  );
};

SocialButtonInner.displayName = 'SocialButton';

export const SocialButton = React.memo(SocialButtonInner);
