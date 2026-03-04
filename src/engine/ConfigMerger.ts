import type {
  SociAuth_Config,
  ProviderConfig,
  ThemeConfig,
  LayoutConfig,
  BehaviorConfig,
  ButtonVariant,
  ResolvedProviderConfig,
  ResolvedSociAuthConfig,
  ValidationResult,
  ValidationWarning,
} from '../types';

import {
  DEFAULT_THEME,
  DEFAULT_LAYOUT,
  DEFAULT_BEHAVIOR,
  DEFAULT_BUTTON_VARIANT,
  DEFAULT_LABELS,
} from '../defaults';

/**
 * Validates a SociAuth_Config, returning warnings for providers
 * missing required fields (clientId or redirectUri).
 * Warnings contain provider name and missing field name only — no credential values.
 */
export function validateConfig(config: SociAuth_Config): ValidationResult {
  const warnings: ValidationWarning[] = [];

  for (const provider of config.providers) {
    if (!provider.clientId) {
      warnings.push({
        provider: provider.name,
        field: 'clientId',
        message: `Provider "${provider.name}" is missing required field "clientId" and will be excluded.`,
      });
    }
    if (!provider.redirectUri) {
      warnings.push({
        provider: provider.name,
        field: 'redirectUri',
        message: `Provider "${provider.name}" is missing required field "redirectUri" and will be excluded.`,
      });
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Shallow-merges a partial ThemeConfig onto a base ThemeConfig.
 * Each top-level section (colors, spacing, radius, glass, motion, button)
 * is replaced entirely if present in the override — not deep-merged.
 */
function mergeTheme(base: ThemeConfig, override?: Partial<ThemeConfig>): ThemeConfig {
  if (!override) return base;
  return {
    mode: override.mode ?? base.mode,
    colors: override.colors ?? base.colors,
    spacing: override.spacing ?? base.spacing,
    radius: override.radius ?? base.radius,
    glass: override.glass ?? base.glass,
    motion: override.motion ?? base.motion,
    button: override.button ?? base.button,
  };
}

/**
 * Shallow-merges a partial LayoutConfig onto a base LayoutConfig.
 */
function mergeLayout(base: LayoutConfig, override?: Partial<LayoutConfig>): LayoutConfig {
  if (!override) return base;
  return {
    alignment: override.alignment ?? base.alignment,
    spacing: override.spacing ?? base.spacing,
    showLabels: override.showLabels ?? base.showLabels,
    showDividers: override.showDividers ?? base.showDividers,
    direction: override.direction ?? base.direction,
  };
}


/**
 * Shallow-merges a partial BehaviorConfig onto a base BehaviorConfig.
 */
function mergeBehavior(base: BehaviorConfig, override?: Partial<BehaviorConfig>): BehaviorConfig {
  if (!override) return base;
  return {
    autoRedirect: override.autoRedirect ?? base.autoRedirect,
    logging: override.logging ?? base.logging,
    analytics: override.analytics ?? base.analytics,
  };
}

/**
 * Resolves a single ProviderConfig against the global (already-merged) config values.
 * Per-provider theme/layout/buttonVariant overrides take precedence over global values.
 */
export function resolveProviderConfig(
  provider: ProviderConfig,
  globalTheme: ThemeConfig,
  globalLayout: LayoutConfig,
  globalVariant: ButtonVariant,
): ResolvedProviderConfig {
  return {
    name: provider.name,
    clientId: provider.clientId,
    redirectUri: provider.redirectUri,
    scopes: provider.scopes ?? [],
    label: provider.label ?? DEFAULT_LABELS[provider.name],
    icon: provider.icon ?? null,
    onSuccess: provider.onSuccess,
    onError: provider.onError,
    theme: provider.theme ?? {},
    layout: provider.layout ?? {},
    buttonVariant: provider.buttonVariant ?? globalVariant,
    resolvedTheme: mergeTheme(globalTheme, provider.theme),
    resolvedLayout: mergeLayout(globalLayout, provider.layout),
    resolvedVariant: provider.buttonVariant ?? globalVariant,
  };
}

/**
 * Three-level merge: built-in defaults → global config → per-provider overrides.
 * 1. Merge built-in defaults with global SociAuth_Config values (shallow per section).
 * 2. Filter out invalid providers (missing clientId or redirectUri).
 * 3. Resolve each valid provider against the merged global values.
 */
export function mergeConfig(config: SociAuth_Config): ResolvedSociAuthConfig {
  // Level 1 + 2: built-in defaults → global config
  const theme = mergeTheme(DEFAULT_THEME, config.theme);
  const layout = mergeLayout(DEFAULT_LAYOUT, config.layout);
  const behavior = mergeBehavior(DEFAULT_BEHAVIOR, config.behavior);
  const buttonVariant = config.buttonVariant ?? DEFAULT_BUTTON_VARIANT;
  const enable3DDepth = config.enable3DDepth ?? false;
  const showCard = config.showCard ?? true;
  const enableHoverFill = config.enableHoverFill ?? false;
  const hoverFillColor = config.hoverFillColor ?? '#6366f1';
  const cardTitle = config.cardTitle ?? '';
  const cardSubtitle = config.cardSubtitle ?? '';
  const contentAlignment = config.contentAlignment ?? 'center';

  // Filter out providers missing required fields
  const validProviders = config.providers.filter(
    (p) => p.clientId && p.redirectUri,
  );

  // Level 3: per-provider overrides
  const providers = validProviders.map((p) =>
    resolveProviderConfig(p, theme, layout, buttonVariant),
  );

  return {
    providers,
    theme,
    layout,
    behavior,
    buttonVariant,
    enable3DDepth,
    showCard,
    enableHoverFill,
    hoverFillColor,
    cardTitle,
    cardSubtitle,
    contentAlignment,
  };
}
