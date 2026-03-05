import type React from 'react';

// ─── Provider Types ───────────────────────────────────────────────
export type ProviderName = 'google' | 'apple' | 'facebook' | 'github';

export type ButtonVariant = 'text-only' | 'icon-plus-text' | 'icon-only';

export type ButtonShape = 'pill' | 'rounded' | 'square';

export type IconPosition = 'left' | 'right' | 'top';

export type ButtonSize = 'small' | 'medium' | 'large';

export type ThemeMode = 'light' | 'dark';

export type Alignment = 'left' | 'center' | 'right';

// ─── Provider Configuration ──────────────────────────────────────
export interface ProviderConfig {
  name: ProviderName;
  clientId: string;
  redirectUri: string;
  scopes?: string[];
  label?: string;
  icon?: React.ReactNode;
  onSuccess?: (response: ProviderResponse) => void;
  onError?: (error: OAuthError) => void;
  theme?: Partial<ThemeConfig>;
  layout?: Partial<LayoutConfig>;
  buttonVariant?: ButtonVariant;
}

// ─── Theme Configuration ─────────────────────────────────────────
export interface ThemeConfig {
  mode: ThemeMode;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  glass: {
    blur: string;
    opacity: number;
    gradient: string[];
    shadow: string;
  };
  motion: {
    duration: string;
    easing: string;
  };
  button: {
    shape: ButtonShape;
    iconPosition: IconPosition;
    size: ButtonSize;
  };
}

// ─── Layout Configuration ────────────────────────────────────────
export interface LayoutConfig {
  alignment: Alignment;
  spacing: string;
  showLabels: boolean;
  showDividers: boolean;
  direction?: 'horizontal' | 'vertical';
}


// ─── Behavior Configuration ──────────────────────────────────────
export interface BehaviorConfig {
  autoRedirect: {
    enabled: boolean;
    url?: string;
  };
  logging?: {
    hook: (event: LogEvent) => void;
  };
  analytics?: {
    hook: (event: AnalyticsEvent) => void;
  };
}

export interface LogEvent {
  provider: ProviderName;
  eventType: 'initiation' | 'success' | 'failure';
  timestamp: number;
}

export interface AnalyticsEvent {
  provider: ProviderName;
  interactionType: 'click' | 'hover' | 'focus';
  timestamp: number;
}

// ─── Unified Config ──────────────────────────────────────────────
export interface SociAuth_Config {
  providers: ProviderConfig[];
  theme?: Partial<ThemeConfig>;
  layout?: Partial<LayoutConfig>;
  behavior?: Partial<BehaviorConfig>;
  buttonVariant?: ButtonVariant;
  enable3DDepth?: boolean;
  showCard?: boolean;
  enableHoverFill?: boolean;
  hoverFillColor?: string;
  cardTitle?: string;
  cardSubtitle?: string;
  contentAlignment?: Alignment;
  cardTitleColor?: string;
  cardSubtitleColor?: string;
  buttonTextColor?: string;
}

// ─── Response Types ──────────────────────────────────────────────
export interface ProviderResponse {
  provider: ProviderName;
  code?: string;
  state?: string;
  rawParams: Record<string, string>;
}

export interface OAuthError {
  provider: ProviderName;
  errorType: string;
  message: string;
}

// ─── Internal Resolved Types ─────────────────────────────────────
export interface ResolvedProviderConfig
  extends Required<Omit<ProviderConfig, 'onSuccess' | 'onError' | 'icon' | 'label'>> {
  label: string;
  icon: React.ReactNode;
  onSuccess?: (response: ProviderResponse) => void;
  onError?: (error: OAuthError) => void;
  resolvedTheme: ThemeConfig;
  resolvedLayout: LayoutConfig;
  resolvedVariant: ButtonVariant;
}

export interface ResolvedSociAuthConfig {
  providers: ResolvedProviderConfig[];
  theme: ThemeConfig;
  layout: LayoutConfig;
  behavior: BehaviorConfig;
  buttonVariant: ButtonVariant;
  enable3DDepth: boolean;
  showCard: boolean;
  enableHoverFill: boolean;
  hoverFillColor: string;
  cardTitle: string;
  cardSubtitle: string;
  contentAlignment: Alignment;
  cardTitleColor: string;
  cardSubtitleColor: string;
  buttonTextColor: string;
}

// ─── Provider State ──────────────────────────────────────────────
export interface ProviderState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: OAuthError;
  response?: ProviderResponse;
}

// ─── Validation ──────────────────────────────────────────────────
export interface ValidationResult {
  valid: boolean;
  warnings: ValidationWarning[];
}

export interface ValidationWarning {
  provider: ProviderName;
  field: string;
  message: string;
}
