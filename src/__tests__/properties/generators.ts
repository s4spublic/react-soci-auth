import * as fc from 'fast-check';
import type {
  ProviderName,
  ButtonVariant,
  ButtonShape,
  IconPosition,
  ButtonSize,
  ThemeMode,
  Alignment,
  ProviderConfig,
  ThemeConfig,
  LayoutConfig,
  BehaviorConfig,
  SociAuth_Config,
} from '../../types';

// ─── Enum-like Arbitraries ───────────────────────────────────────

export const arbProviderName: fc.Arbitrary<ProviderName> = fc.constantFrom(
  'google',
  'apple',
  'facebook',
  'github',
);

export const arbButtonVariant: fc.Arbitrary<ButtonVariant> = fc.constantFrom(
  'text-only',
  'icon-plus-text',
  'icon-only',
);

export const arbButtonShape: fc.Arbitrary<ButtonShape> = fc.constantFrom(
  'pill',
  'rounded',
  'square',
);

export const arbIconPosition: fc.Arbitrary<IconPosition> = fc.constantFrom(
  'left',
  'right',
  'top',
);

export const arbButtonSize: fc.Arbitrary<ButtonSize> = fc.constantFrom(
  'small',
  'medium',
  'large',
);

export const arbThemeMode: fc.Arbitrary<ThemeMode> = fc.constantFrom('light', 'dark');

export const arbAlignment: fc.Arbitrary<Alignment> = fc.constantFrom('left', 'center', 'right');


// ─── Helper Arbitraries ──────────────────────────────────────────

const arbCSSLength = fc.integer({ min: 0, max: 100 }).map((n) => `${n}px`);

const arbCSSColor = fc.hexaString({ minLength: 6, maxLength: 6 }).map((h) => `#${h}`);

const arbOpacity = fc.double({ min: 0, max: 1, noNaN: true });

// ─── ProviderConfig Arbitrary ────────────────────────────────────

export const arbProviderConfig: fc.Arbitrary<ProviderConfig> = fc.record({
  name: arbProviderName,
  clientId: fc.string({ minLength: 1, maxLength: 64 }).filter((s) => s.trim().length > 0),
  redirectUri: fc.webUrl(),
  scopes: fc.option(fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 12 }), { minLength: 0, maxLength: 5 }), { nil: undefined }),
  label: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  buttonVariant: fc.option(arbButtonVariant, { nil: undefined }),
});

// ─── ThemeConfig Arbitrary (partial) ─────────────────────────────

export const arbThemeConfig: fc.Arbitrary<Partial<ThemeConfig>> = fc.record(
  {
    mode: arbThemeMode,
    colors: fc.record({
      primary: arbCSSColor,
      background: arbCSSColor,
      surface: arbCSSColor,
      text: arbCSSColor,
      textSecondary: arbCSSColor,
      border: arbCSSColor,
      success: arbCSSColor,
      error: arbCSSColor,
    }),
    spacing: fc.record({
      xs: arbCSSLength,
      sm: arbCSSLength,
      md: arbCSSLength,
      lg: arbCSSLength,
      xl: arbCSSLength,
    }),
    radius: fc.record({
      sm: arbCSSLength,
      md: arbCSSLength,
      lg: arbCSSLength,
      full: arbCSSLength,
    }),
    glass: fc.record({
      blur: arbCSSLength,
      opacity: arbOpacity,
      gradient: fc.array(arbCSSColor, { minLength: 2, maxLength: 4 }),
      shadow: fc.constant('0 8px 32px rgba(0,0,0,0.12)'),
    }),
    motion: fc.record({
      duration: fc.integer({ min: 50, max: 1000 }).map((n) => `${n}ms`),
      easing: fc.constantFrom('ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'),
    }),
    button: fc.record({
      shape: arbButtonShape,
      iconPosition: arbIconPosition,
      size: arbButtonSize,
    }),
  },
  { requiredKeys: [] },
);

// ─── LayoutConfig Arbitrary (partial) ────────────────────────────

export const arbDirection: fc.Arbitrary<'horizontal' | 'vertical'> = fc.constantFrom(
  'horizontal',
  'vertical',
);

export const arbLayoutConfig: fc.Arbitrary<Partial<LayoutConfig>> = fc.record(
  {
    alignment: arbAlignment,
    spacing: arbCSSLength,
    showLabels: fc.boolean(),
    showDividers: fc.boolean(),
    direction: arbDirection,
  },
  { requiredKeys: [] },
);

// ─── BehaviorConfig Arbitrary (partial) ──────────────────────────

export const arbBehaviorConfig: fc.Arbitrary<Partial<BehaviorConfig>> = fc.record(
  {
    autoRedirect: fc.record(
      {
        enabled: fc.boolean(),
        url: fc.option(fc.webUrl(), { nil: undefined }),
      },
      { requiredKeys: ['enabled'] },
    ),
  },
  { requiredKeys: [] },
);

// ─── SociAuth_Config Arbitrary ───────────────────────────────────

export const arbSociAuthConfig: fc.Arbitrary<SociAuth_Config> = fc.record(
  {
    providers: fc.array(arbProviderConfig, { minLength: 1, maxLength: 4 }),
    theme: fc.option(arbThemeConfig, { nil: undefined }),
    layout: fc.option(arbLayoutConfig, { nil: undefined }),
    behavior: fc.option(arbBehaviorConfig, { nil: undefined }),
    buttonVariant: fc.option(arbButtonVariant, { nil: undefined }),
  },
  { requiredKeys: ['providers'] },
);

// ─── Credential-Containing Config (for security tests) ──────────

export const arbCredentialConfig: fc.Arbitrary<SociAuth_Config> = fc
  .record({
    providers: fc.array(
      fc.record({
        name: arbProviderName,
        clientId: fc.string({ minLength: 8, maxLength: 64 }).filter((s) => s.trim().length > 0),
        redirectUri: fc.webUrl(),
        scopes: fc.array(fc.constant('openid'), { minLength: 1, maxLength: 3 }),
      }),
      { minLength: 1, maxLength: 4 },
    ),
    theme: fc.option(arbThemeConfig, { nil: undefined }),
    layout: fc.option(arbLayoutConfig, { nil: undefined }),
    behavior: fc.option(arbBehaviorConfig, { nil: undefined }),
    buttonVariant: fc.option(arbButtonVariant, { nil: undefined }),
  })
  .map((cfg) => cfg as SociAuth_Config);

// ─── Invalid ProviderConfig (missing required fields) ────────────

export const arbInvalidProviderConfig: fc.Arbitrary<ProviderConfig> = fc.oneof(
  // Missing clientId (empty string)
  fc.record({
    name: arbProviderName,
    clientId: fc.constant(''),
    redirectUri: fc.webUrl(),
  }) as fc.Arbitrary<ProviderConfig>,
  // Missing redirectUri (empty string)
  fc.record({
    name: arbProviderName,
    clientId: fc.string({ minLength: 1, maxLength: 64 }).filter((s) => s.trim().length > 0),
    redirectUri: fc.constant(''),
  }) as fc.Arbitrary<ProviderConfig>,
);
