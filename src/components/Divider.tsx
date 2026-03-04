import React, { useMemo } from 'react';
import type { ThemeConfig } from '../types';
import { DEFAULT_THEME } from '../defaults';
import { useSociAuth } from '../hooks/useSociAuth';

// ─── Props ───────────────────────────────────────────────────────

export interface DividerProps {
  label?: string;
  direction?: 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

// ─── Component ───────────────────────────────────────────────────

const DividerInner: React.FC<DividerProps> = ({ label, direction, className, style }) => {
  // Try to get context — may be null if used standalone
  let contextTheme: ThemeConfig | null = null;
  try {
    const ctx = useSociAuth();
    contextTheme = ctx.theme;
  } catch {
    // Used outside SociAuthProvider — fall back to defaults
  }

  const resolvedTheme = contextTheme ?? DEFAULT_THEME;

  const isHorizontal = direction === 'horizontal';

  const containerStyle = useMemo<React.CSSProperties>(
    () => ({
      display: 'flex',
      alignItems: 'center',
      width: isHorizontal ? 'auto' : '100%',
      flexShrink: isHorizontal ? 0 : undefined,
      ...style,
    }),
    [style, isHorizontal],
  );

  const lineStyle = useMemo<React.CSSProperties>(
    () => ({
      flex: 1,
      height: '1px',
      border: 'none',
      backgroundColor: `var(--soci-color-border, ${resolvedTheme.colors.border})`,
      opacity: resolvedTheme.mode === 'dark' ? 0.4 : 0.6,
    }),
    [resolvedTheme.colors.border, resolvedTheme.mode],
  );

  const labelStyle = useMemo<React.CSSProperties>(
    () => ({
      padding: isHorizontal ? '0 4px' : `0 ${resolvedTheme.spacing.md}`,
      fontSize: '0.8125rem',
      fontWeight: 400,
      color: `var(--soci-color-text-secondary, ${resolvedTheme.colors.textSecondary})`,
      whiteSpace: 'nowrap',
      lineHeight: 1,
    }),
    [resolvedTheme.colors.textSecondary, resolvedTheme.spacing.md, isHorizontal],
  );

  return (
    <div
      className={className}
      style={containerStyle}
      role="separator"
      data-testid="soci-divider"
    >
      {!isHorizontal && <div style={lineStyle} aria-hidden="true" />}
      {label && <span style={labelStyle}>{label}</span>}
      {!isHorizontal && label && <div style={lineStyle} aria-hidden="true" />}
    </div>
  );
};

DividerInner.displayName = 'Divider';

export const Divider = React.memo(DividerInner);
