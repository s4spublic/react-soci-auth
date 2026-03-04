import React, { useMemo, useCallback, useState, useEffect } from 'react';
import type {
  ProviderName,
  Alignment,
  SociAuth_Config,
} from '../types';
import { useSociAuth } from '../hooks/useSociAuth';
import { AuthCard } from './AuthCard';
import { SocialButton } from './SocialButton';
import { Divider } from './Divider';
import { Banner } from './Banner';

// ─── Props ───────────────────────────────────────────────────────

export interface SociAuthComponentProps {
  config?: SociAuth_Config;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Alignment mapping ──────────────────────────────────────────

const ALIGNMENT_MAP: Record<Alignment, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

// ─── Component ───────────────────────────────────────────────────

const SociAuthComponentInner: React.FC<SociAuthComponentProps> = ({
  className,
  style,
}) => {
  const { config, theme, providers, triggerOAuth } = useSociAuth();

  const [bannerState, setBannerState] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const resolvedLayout = config.layout;
  const resolvedBehavior = config.behavior;

  // ── React to provider state changes for Banner display ────────
  // When provider states change to success/error (set by SociAuthProvider
  // on OAuth callback), display the appropriate banner.
  useEffect(() => {
    for (const providerName of Object.keys(providers) as ProviderName[]) {
      const state = providers[providerName];
      if (state.status === 'success') {
        setBannerState({
          type: 'success',
          message: `Successfully authenticated with ${providerName}`,
        });
        return;
      }
      if (state.status === 'error' && state.error) {
        setBannerState({
          type: 'error',
          message: state.error.message,
        });
        return;
      }
    }
  }, [providers]);

  // ── Button click handler ──────────────────────────────────────
  const handleButtonClick = useCallback(
    (providerName: ProviderName) => {
      // Invoke logging hook for initiation
      resolvedBehavior.logging?.hook({
        provider: providerName,
        eventType: 'initiation',
        timestamp: Date.now(),
      });

      // Invoke analytics hook for click interaction
      resolvedBehavior.analytics?.hook({
        provider: providerName,
        interactionType: 'click',
        timestamp: Date.now(),
      });

      triggerOAuth(providerName);
    },
    [resolvedBehavior, triggerOAuth],
  );

  // ── Banner dismiss handler ────────────────────────────────────
  const handleBannerDismiss = useCallback(() => {
    setBannerState(null);
  }, []);

  // ── Glass CSS custom properties for the component container ──
  const glassCSSProperties = useMemo<React.CSSProperties>(
    () => ({
      ['--soci-glass-blur' as string]: theme.glass.blur,
      ['--soci-glass-opacity' as string]: String(theme.glass.opacity),
      ['--soci-glass-shadow' as string]: theme.glass.shadow,
      ['--soci-glass-gradient' as string]: `linear-gradient(135deg, ${theme.glass.gradient.join(', ')})`,
    }),
    [theme.glass.blur, theme.glass.opacity, theme.glass.shadow, theme.glass.gradient],
  );

  // ── Container styles ──────────────────────────────────────────
  const containerStyle = useMemo<React.CSSProperties>(
    () => ({
      display: 'flex',
      flexDirection: resolvedLayout.direction === 'horizontal' ? 'row' : 'column',
      alignItems: resolvedLayout.direction === 'horizontal'
        ? 'center'
        : (config.buttonVariant === 'icon-only' || !resolvedLayout.showLabels)
          ? ALIGNMENT_MAP[resolvedLayout.alignment] as React.CSSProperties['alignItems']
          : 'stretch',
      justifyContent: resolvedLayout.direction === 'horizontal'
        ? ALIGNMENT_MAP[resolvedLayout.alignment] as React.CSSProperties['justifyContent']
        : undefined,
      gap: resolvedLayout.spacing,
      flexWrap: resolvedLayout.direction === 'horizontal' ? 'wrap' : undefined,
      transition: `all var(--soci-motion-duration, ${theme.motion.duration}) var(--soci-motion-easing, ${theme.motion.easing})`,
    }),
    [resolvedLayout.direction, resolvedLayout.alignment, resolvedLayout.spacing, resolvedLayout.showLabels, config.buttonVariant, theme.motion.duration, theme.motion.easing],
  );

  // ── Wrapper style for outer alignment ─────────────────────────
  const wrapperStyle = useMemo<React.CSSProperties>(
    () => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: ALIGNMENT_MAP[resolvedLayout.alignment] as React.CSSProperties['alignItems'],
      width: '100%',
      transition: `all var(--soci-motion-duration, ${theme.motion.duration}) var(--soci-motion-easing, ${theme.motion.easing})`,
    }),
    [resolvedLayout.alignment, theme.motion.duration, theme.motion.easing],
  );

  // ── Render provider buttons with optional dividers ────────────
  const validProviders = config.providers;
  const enable3DDepth = config.enable3DDepth;
  const enableHoverFill = config.enableHoverFill;
  const hoverFillColor = config.hoverFillColor;
  const contentAlignment = config.contentAlignment;

  const buttonElements = useMemo(() => {
    const elements: React.ReactNode[] = [];

    validProviders.forEach((provider, index) => {
      // Determine variant: hide labels when showLabels is false
      const variant = resolvedLayout.showLabels
        ? provider.resolvedVariant
        : 'icon-only';

      elements.push(
        <SocialButton
          key={provider.name}
          provider={provider.name}
          label={provider.label}
          icon={provider.icon}
          variant={variant}
          theme={provider.resolvedTheme ? { ...provider.resolvedTheme } : undefined}
          enable3DDepth={enable3DDepth}
          enableHoverFill={enableHoverFill}
          hoverFillColor={hoverFillColor}
          contentAlignment={contentAlignment}
          onClick={() => handleButtonClick(provider.name)}
          disabled={providers[provider.name]?.status === 'loading'}
        />,
      );

      // Render divider between buttons (not after the last one)
      if (resolvedLayout.showDividers && index < validProviders.length - 1) {
        elements.push(
          <Divider key={`divider-${provider.name}`} label="or" direction={resolvedLayout.direction} />,
        );
      }
    });

    return elements;
  }, [validProviders, resolvedLayout.showLabels, resolvedLayout.showDividers, handleButtonClick, providers, enable3DDepth, enableHoverFill, hoverFillColor, contentAlignment]);

  return (
    <div
      className={className}
      style={{ ...glassCSSProperties, ...wrapperStyle, ...style }}
      data-testid="soci-auth-component"
    >
      {config.showCard ? (
      <AuthCard title={config.cardTitle} subtitle={config.cardSubtitle}>
        <div style={containerStyle}>
          {buttonElements}
        </div>
      </AuthCard>
    ) : (
      <div style={containerStyle}>
        {buttonElements}
      </div>
    )}

      {bannerState && (
        <Banner
          type={bannerState.type}
          message={bannerState.message}
          onDismiss={handleBannerDismiss}
        />
      )}
    </div>
  );
};

SociAuthComponentInner.displayName = 'SociAuthComponent';

export const SociAuthComponent = React.memo(SociAuthComponentInner);
