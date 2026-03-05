import React, { useMemo } from 'react';
import type { ThemeConfig } from '../types';
import { DEFAULT_THEME } from '../defaults';
import { useSociAuth } from '../hooks/useSociAuth';

// ─── Props ───────────────────────────────────────────────────────

export interface AuthCardProps {
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────

const AuthCardInner: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  className,
  style,
  children,
}) => {
  // Try to get context — may be null if used standalone
  let contextTheme: ThemeConfig | null = null;
  try {
    const ctx = useSociAuth();
    contextTheme = ctx.theme;
  } catch {
    // Used outside SociAuthProvider — fall back to defaults
  }

  const resolvedTheme = contextTheme ?? DEFAULT_THEME;

  // Card container styles with glassmorphism
  const cardStyle = useMemo<React.CSSProperties>(() => {
    const base: React.CSSProperties = {
      position: 'relative',
      padding: resolvedTheme.spacing.xl,
      borderRadius: resolvedTheme.radius.lg,
      border: `1px solid var(--soci-color-border, ${resolvedTheme.colors.border})`,
      background: `linear-gradient(135deg, rgba(255, 255, 255, ${Math.min(resolvedTheme.glass.opacity + 0.15, 0.9)}), rgba(255, 255, 255, ${Math.min(resolvedTheme.glass.opacity * 0.5, 0.5)}))`,
      backdropFilter: `blur(var(--soci-glass-blur, ${resolvedTheme.glass.blur}))`,
      WebkitBackdropFilter: `blur(var(--soci-glass-blur, ${resolvedTheme.glass.blur}))`,
      boxShadow: `var(--soci-glass-shadow, ${resolvedTheme.glass.shadow})`,
      overflow: 'hidden',
      // Mount animation
      animation: `soci-card-mount var(--soci-motion-duration, ${resolvedTheme.motion.duration}) var(--soci-motion-easing, ${resolvedTheme.motion.easing}) both`,
      ...style,
    };
    return base;
  }, [resolvedTheme, style]);

  const titleStyle = useMemo<React.CSSProperties>(
    () => ({
      margin: 0,
      fontSize: '1.25rem',
      fontWeight: 600,
      color: titleColor || '#ffffff',
      lineHeight: 1.3,
    }),
    [titleColor],
  );

  const subtitleStyle = useMemo<React.CSSProperties>(
    () => ({
      margin: `${resolvedTheme.spacing.xs} 0 0`,
      fontSize: '0.875rem',
      fontWeight: 400,
      color: subtitleColor || 'rgba(255, 255, 255, 0.7)',
      lineHeight: 1.4,
    }),
    [subtitleColor, resolvedTheme.spacing.xs],
  );

  const headerStyle = useMemo<React.CSSProperties>(
    () => ({
      marginBottom: resolvedTheme.spacing.lg,
    }),
    [resolvedTheme.spacing.lg],
  );

  return (
    <>
      <style>{`
        @keyframes soci-card-mount {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      <div className={className} style={cardStyle} data-testid="soci-auth-card">
        {(title || subtitle) && (
          <div style={headerStyle}>
            {title && <h2 style={titleStyle}>{title}</h2>}
            {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </>
  );
};

AuthCardInner.displayName = 'AuthCard';

export const AuthCard = React.memo(AuthCardInner);
