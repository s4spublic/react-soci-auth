import { useState, useMemo, useCallback } from 'react';
import type {
  ProviderName,
  ButtonVariant,
  ButtonShape,
  IconPosition,
  ButtonSize,
  ThemeMode,
  Alignment,
  SociAuth_Config,
} from 'react-soci-auth';

// ─── DemoState Interface ─────────────────────────────────────────
export interface DemoState {
  enabledProviders: Record<ProviderName, boolean>;
  buttonVariant: ButtonVariant;
  direction: 'horizontal' | 'vertical';
  alignment: Alignment;
  spacing: number;
  showLabels: boolean;
  showDividers: boolean;
  showCard: boolean;
  themeMode: ThemeMode;
  buttonShape: ButtonShape;
  iconPosition: IconPosition;
  buttonSize: ButtonSize;
  glassOpacity: number;
  enable3DDepth: boolean;
  enableHoverFill: boolean;
  hoverFillColor: string;
  cardTitle: string;
  cardSubtitle: string;
  providerLabels: Record<ProviderName, string>;
  contentAlignment: Alignment;
  cardTitleColor: string;
  cardSubtitleColor: string;
  buttonTextColor: string;
}

export interface UseDemoStateReturn {
  state: DemoState;
  config: SociAuth_Config;
  setters: Record<string, (...args: any[]) => void>;
  resetToDefaults: () => void;
}

// ─── Default State ───────────────────────────────────────────────
const ALL_PROVIDERS: ProviderName[] = ['google', 'apple', 'facebook', 'github'];

export const DEFAULT_DEMO_STATE: DemoState = {
  enabledProviders: { google: true, apple: true, facebook: true, github: true },
  buttonVariant: 'icon-plus-text',
  direction: 'vertical',
  alignment: 'center',
  spacing: 12,
  showLabels: true,
  showDividers: false,
  showCard: true,
  themeMode: 'light',
  buttonShape: 'rounded',
  iconPosition: 'left',
  buttonSize: 'medium',
  glassOpacity: 0.15,
  enable3DDepth: false,
  enableHoverFill: false,
  hoverFillColor: '#6366f1',
  cardTitle: 'Welcome Back',
  cardSubtitle: 'Sign in to continue',
  providerLabels: { google: 'Sign in with Google', apple: 'Sign in with Apple', facebook: 'Sign in with Facebook', github: 'Sign in with GitHub' },
  contentAlignment: 'center',
  cardTitleColor: '#ffffff',
  cardSubtitleColor: 'rgba(255, 255, 255, 0.7)',
  buttonTextColor: '',
};


// ─── Provider Credentials (from environment) ─────────────────────
const CLIENT_IDS: Record<ProviderName, string> = {
  google: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? 'demo-client-id',
  apple: import.meta.env.VITE_APPLE_CLIENT_ID ?? 'demo-client-id',
  facebook: import.meta.env.VITE_FACEBOOK_CLIENT_ID ?? 'demo-client-id',
  github: import.meta.env.VITE_GITHUB_CLIENT_ID ?? 'demo-client-id',
};

const REDIRECT_URI: string = import.meta.env.VITE_REDIRECT_URI ?? 'http://localhost:5173/callback';

const DEFAULT_SCOPES: Record<ProviderName, string[]> = {
  google: ['openid', 'email', 'profile'],
  apple: ['name', 'email'],
  facebook: ['email', 'public_profile'],
  github: ['read:user', 'user:email'],
};

// ─── Helper: derive SociAuth_Config from DemoState ───────────────
export function deriveConfig(state: DemoState): SociAuth_Config {
  const providers = ALL_PROVIDERS
    .filter((name) => state.enabledProviders[name])
    .map((name) => ({
      name,
      clientId: CLIENT_IDS[name],
      redirectUri: REDIRECT_URI,
      scopes: DEFAULT_SCOPES[name],
      label: state.providerLabels[name],
    }));

  return {
    providers,
    buttonVariant: state.buttonVariant,
    theme: {
      mode: state.themeMode,
      glass: {
        opacity: state.glassOpacity,
      },
      button: {
        shape: state.buttonShape,
        iconPosition: state.iconPosition,
        size: state.buttonSize,
      },
    },
    layout: {
      alignment: state.alignment,
      spacing: `${state.spacing}px`,
      showLabels: state.showLabels,
      showDividers: state.showDividers,
      direction: state.direction,
    },
    enable3DDepth: state.enable3DDepth,
    enableHoverFill: state.enableHoverFill,
    hoverFillColor: state.hoverFillColor,
    showCard: state.showCard,
    cardTitle: state.cardTitle,
    cardSubtitle: state.cardSubtitle,
    contentAlignment: state.contentAlignment,
    cardTitleColor: state.cardTitleColor,
    cardSubtitleColor: state.cardSubtitleColor,
    buttonTextColor: state.buttonTextColor || undefined,
  };
}

// ─── Hook ────────────────────────────────────────────────────────
export function useDemoState(): UseDemoStateReturn {
  const [state, setState] = useState<DemoState>(DEFAULT_DEMO_STATE);

  const config = useMemo(() => deriveConfig(state), [state]);

  const setters = useMemo<Record<string, (...args: any[]) => void>>(() => ({
    setEnabledProviders: (value: Record<ProviderName, boolean>) =>
      setState((prev) => ({ ...prev, enabledProviders: value })),
    toggleProvider: (name: ProviderName) =>
      setState((prev) => ({
        ...prev,
        enabledProviders: {
          ...prev.enabledProviders,
          [name]: !prev.enabledProviders[name],
        },
      })),
    setButtonVariant: (value: ButtonVariant) =>
      setState((prev) => ({ ...prev, buttonVariant: value })),
    setDirection: (value: 'horizontal' | 'vertical') =>
      setState((prev) => ({ ...prev, direction: value })),
    setAlignment: (value: Alignment) =>
      setState((prev) => ({ ...prev, alignment: value })),
    setSpacing: (value: number) =>
      setState((prev) => ({ ...prev, spacing: value })),
    setShowLabels: (value: boolean) =>
      setState((prev) => ({ ...prev, showLabels: value })),
    setShowDividers: (value: boolean) =>
      setState((prev) => ({ ...prev, showDividers: value })),
    setThemeMode: (value: ThemeMode) =>
      setState((prev) => ({ ...prev, themeMode: value })),
    setButtonShape: (value: ButtonShape) =>
      setState((prev) => ({ ...prev, buttonShape: value })),
    setIconPosition: (value: IconPosition) =>
      setState((prev) => ({ ...prev, iconPosition: value })),
    setButtonSize: (value: ButtonSize) =>
      setState((prev) => ({ ...prev, buttonSize: value })),
    setGlassOpacity: (value: number) =>
      setState((prev) => ({ ...prev, glassOpacity: value })),
    setEnable3DDepth: (value: boolean) =>
      setState((prev) => ({ ...prev, enable3DDepth: value })),
    setEnableHoverFill: (value: boolean) =>
      setState((prev) => ({ ...prev, enableHoverFill: value })),
    setHoverFillColor: (value: string) =>
      setState((prev) => ({ ...prev, hoverFillColor: value })),
    setShowCard: (value: boolean) =>
      setState((prev) => ({ ...prev, showCard: value })),
    setCardTitle: (value: string) =>
      setState((prev) => ({ ...prev, cardTitle: value })),
    setCardSubtitle: (value: string) =>
      setState((prev) => ({ ...prev, cardSubtitle: value })),
    setProviderLabel: (provider: ProviderName, label: string) =>
      setState((prev) => ({ ...prev, providerLabels: { ...prev.providerLabels, [provider]: label } })),
    setContentAlignment: (value: Alignment) =>
      setState((prev) => ({ ...prev, contentAlignment: value })),
    setCardTitleColor: (value: string) =>
      setState((prev) => ({ ...prev, cardTitleColor: value })),
    setCardSubtitleColor: (value: string) =>
      setState((prev) => ({ ...prev, cardSubtitleColor: value })),
    setButtonTextColor: (value: string) =>
      setState((prev) => ({ ...prev, buttonTextColor: value })),
  }), []);

  const resetToDefaults = useCallback(() => {
    setState(DEFAULT_DEMO_STATE);
  }, []);

  return { state, config, setters, resetToDefaults };
}
