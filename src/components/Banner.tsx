import React, { useEffect, useMemo, useState, useCallback } from 'react';
import type { ThemeConfig } from '../types';
import { DEFAULT_THEME } from '../defaults';
import { useSociAuth } from '../hooks/useSociAuth';

// ─── Props ───────────────────────────────────────────────────────

export interface BannerProps {
  type: 'success' | 'error';
  message: string;
  duration?: number; // ms, default 5000
  onDismiss?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Constants ───────────────────────────────────────────────────

const DEFAULT_DURATION = 5000;

// ─── Component ───────────────────────────────────────────────────

const BannerInner: React.FC<BannerProps> = ({
  type,
  message,
  duration,
  onDismiss,
  className,
  style,
}) => {
  const [dismissed, setDismissed] = useState(false);

  // Try to get context — may be null if used standalone
  let contextTheme: ThemeConfig | null = null;
  try {
    const ctx = useSociAuth();
    contextTheme = ctx.theme;
  } catch {
    // Used outside SociAuthProvider — fall back to defaults
  }

  const resolvedTheme = contextTheme ?? DEFAULT_THEME;

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  // Auto-dismiss timer
  useEffect(() => {
    const ms = duration ?? DEFAULT_DURATION;
    const timer = setTimeout(handleDismiss, ms);
    return () => clearTimeout(timer);
  }, [duration, handleDismiss]);

  const isSuccess = type === 'success';

  const bannerColor = isSuccess
    ? `var(--soci-color-success, ${resolvedTheme.colors.success})`
    : `var(--soci-color-error, ${resolvedTheme.colors.error})`;

  const bannerStyle = useMemo<React.CSSProperties>(() => {
    const isDark = resolvedTheme.mode === 'dark';
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${resolvedTheme.spacing.sm} ${resolvedTheme.spacing.md}`,
      borderRadius: resolvedTheme.radius.md,
      border: `1px solid ${bannerColor}`,
      backgroundColor: isDark
        ? `color-mix(in srgb, ${bannerColor} 15%, transparent)`
        : `color-mix(in srgb, ${bannerColor} 10%, transparent)`,
      color: `var(--soci-color-text, ${resolvedTheme.colors.text})`,
      fontSize: '0.875rem',
      lineHeight: 1.4,
      animation: `soci-banner-mount var(--soci-motion-duration, ${resolvedTheme.motion.duration}) var(--soci-motion-easing, ${resolvedTheme.motion.easing}) both`,
      ...style,
    };
  }, [resolvedTheme, bannerColor, style]);

  const dismissButtonStyle = useMemo<React.CSSProperties>(
    () => ({
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: resolvedTheme.spacing.xs,
      marginLeft: resolvedTheme.spacing.sm,
      color: `var(--soci-color-text-secondary, ${resolvedTheme.colors.textSecondary})`,
      fontSize: '1rem',
      lineHeight: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: resolvedTheme.radius.sm,
      flexShrink: 0,
    }),
    [resolvedTheme],
  );

  if (dismissed) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes soci-banner-mount {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div
        className={className}
        style={bannerStyle}
        role="alert"
        data-testid={`soci-banner-${type}`}
      >
        <span>{message}</span>
        <button
          type="button"
          style={dismissButtonStyle}
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          data-testid="soci-banner-dismiss"
        >
          ✕
        </button>
      </div>
    </>
  );
};

BannerInner.displayName = 'Banner';

export const Banner = React.memo(BannerInner);
