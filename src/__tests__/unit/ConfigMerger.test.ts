import { describe, it, expect } from 'vitest';
import { validateConfig, mergeConfig, resolveProviderConfig } from '../../engine/ConfigMerger';
import {
  DEFAULT_THEME,
  DEFAULT_LAYOUT,
  DEFAULT_BEHAVIOR,
  DEFAULT_BUTTON_VARIANT,
  DEFAULT_LABELS,
} from '../../defaults';
import type { SociAuth_Config, ProviderConfig } from '../../types';

// ─── Helper: minimal valid provider ──────────────────────────────
function validProvider(name: 'google' | 'apple' | 'facebook' | 'github' = 'google'): ProviderConfig {
  return { name, clientId: 'cid-123', redirectUri: 'https://example.com/cb' };
}

// ─── validateConfig ──────────────────────────────────────────────
describe('validateConfig', () => {
  it('returns valid=true when all providers have required fields', () => {
    const result = validateConfig({ providers: [validProvider()] });
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('warns when a provider is missing clientId', () => {
    const result = validateConfig({
      providers: [{ name: 'google', clientId: '', redirectUri: 'https://x.com/cb' }],
    });
    expect(result.valid).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].provider).toBe('google');
    expect(result.warnings[0].field).toBe('clientId');
  });

  it('warns when a provider is missing redirectUri', () => {
    const result = validateConfig({
      providers: [{ name: 'apple', clientId: 'cid', redirectUri: '' }],
    });
    expect(result.valid).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].provider).toBe('apple');
    expect(result.warnings[0].field).toBe('redirectUri');
  });

  it('warns for both missing fields on the same provider', () => {
    const result = validateConfig({
      providers: [{ name: 'github', clientId: '', redirectUri: '' }],
    });
    expect(result.warnings).toHaveLength(2);
    expect(result.warnings.map((w) => w.field)).toEqual(['clientId', 'redirectUri']);
  });

  it('returns valid=true for an empty providers array', () => {
    const result = validateConfig({ providers: [] });
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('warning messages never contain credential values', () => {
    const secret = 'super-secret-client-id-xyz';
    const result = validateConfig({
      providers: [{ name: 'google', clientId: '', redirectUri: `https://secret.com/${secret}` }],
    });
    for (const w of result.warnings) {
      expect(w.message).not.toContain(secret);
    }
  });
});

// ─── mergeConfig ─────────────────────────────────────────────────
describe('mergeConfig', () => {
  it('applies built-in defaults when no global config is provided', () => {
    const resolved = mergeConfig({ providers: [validProvider()] });
    expect(resolved.theme).toEqual(DEFAULT_THEME);
    expect(resolved.layout).toEqual(DEFAULT_LAYOUT);
    expect(resolved.behavior).toEqual(DEFAULT_BEHAVIOR);
    expect(resolved.buttonVariant).toBe(DEFAULT_BUTTON_VARIANT);
  });

  it('merges global theme over defaults (shallow per section)', () => {
    const customColors = {
      primary: '#ff0000',
      background: '#000',
      surface: '#111',
      text: '#fff',
      textSecondary: '#ccc',
      border: '#333',
      success: '#0f0',
      error: '#f00',
    };
    const resolved = mergeConfig({
      providers: [validProvider()],
      theme: { colors: customColors },
    });
    expect(resolved.theme.colors).toEqual(customColors);
    // Other sections remain defaults
    expect(resolved.theme.spacing).toEqual(DEFAULT_THEME.spacing);
    expect(resolved.theme.mode).toBe(DEFAULT_THEME.mode);
  });

  it('excludes providers missing clientId', () => {
    const resolved = mergeConfig({
      providers: [
        { name: 'google', clientId: '', redirectUri: 'https://x.com/cb' },
        validProvider('apple'),
      ],
    });
    expect(resolved.providers).toHaveLength(1);
    expect(resolved.providers[0].name).toBe('apple');
  });

  it('excludes providers missing redirectUri', () => {
    const resolved = mergeConfig({
      providers: [
        { name: 'facebook', clientId: 'cid', redirectUri: '' },
        validProvider('github'),
      ],
    });
    expect(resolved.providers).toHaveLength(1);
    expect(resolved.providers[0].name).toBe('github');
  });

  it('returns empty providers array when all are invalid', () => {
    const resolved = mergeConfig({
      providers: [{ name: 'google', clientId: '', redirectUri: '' }],
    });
    expect(resolved.providers).toHaveLength(0);
  });

  it('assigns default label when provider has no custom label', () => {
    const resolved = mergeConfig({ providers: [validProvider('github')] });
    expect(resolved.providers[0].label).toBe(DEFAULT_LABELS.github);
  });

  it('uses custom label when provided', () => {
    const resolved = mergeConfig({
      providers: [{ ...validProvider(), label: 'Log in via Google' }],
    });
    expect(resolved.providers[0].label).toBe('Log in via Google');
  });

  it('uses global buttonVariant when provider has no override', () => {
    const resolved = mergeConfig({
      providers: [validProvider()],
      buttonVariant: 'icon-only',
    });
    expect(resolved.providers[0].resolvedVariant).toBe('icon-only');
  });

  it('per-provider buttonVariant overrides global', () => {
    const resolved = mergeConfig({
      providers: [{ ...validProvider(), buttonVariant: 'text-only' }],
      buttonVariant: 'icon-only',
    });
    expect(resolved.providers[0].resolvedVariant).toBe('text-only');
  });

  it('per-provider theme override replaces entire section (shallow)', () => {
    const providerColors = {
      primary: '#aaa',
      background: '#bbb',
      surface: '#ccc',
      text: '#ddd',
      textSecondary: '#eee',
      border: '#fff',
      success: '#111',
      error: '#222',
    };
    const resolved = mergeConfig({
      providers: [{ ...validProvider(), theme: { colors: providerColors } }],
    });
    // Provider-level colors replace global colors entirely
    expect(resolved.providers[0].resolvedTheme.colors).toEqual(providerColors);
    // Global-level theme still uses defaults
    expect(resolved.theme.colors).toEqual(DEFAULT_THEME.colors);
  });

  it('merges global layout over defaults', () => {
    const resolved = mergeConfig({
      providers: [validProvider()],
      layout: { alignment: 'right' },
    });
    expect(resolved.layout.alignment).toBe('right');
    expect(resolved.layout.spacing).toBe(DEFAULT_LAYOUT.spacing);
  });

  it('merges global behavior over defaults', () => {
    const resolved = mergeConfig({
      providers: [validProvider()],
      behavior: { autoRedirect: { enabled: true, url: 'https://app.com/home' } },
    });
    expect(resolved.behavior.autoRedirect.enabled).toBe(true);
    expect(resolved.behavior.autoRedirect.url).toBe('https://app.com/home');
  });
});

// ─── resolveProviderConfig ───────────────────────────────────────
describe('resolveProviderConfig', () => {
  it('fills in default scopes as empty array', () => {
    const resolved = resolveProviderConfig(validProvider(), DEFAULT_THEME, DEFAULT_LAYOUT, DEFAULT_BUTTON_VARIANT);
    expect(resolved.scopes).toEqual([]);
  });

  it('preserves provided scopes', () => {
    const p = { ...validProvider(), scopes: ['email', 'profile'] };
    const resolved = resolveProviderConfig(p, DEFAULT_THEME, DEFAULT_LAYOUT, DEFAULT_BUTTON_VARIANT);
    expect(resolved.scopes).toEqual(['email', 'profile']);
  });

  it('per-provider layout override merges with global layout', () => {
    const resolved = resolveProviderConfig(
      { ...validProvider(), layout: { showDividers: true } },
      DEFAULT_THEME,
      DEFAULT_LAYOUT,
      DEFAULT_BUTTON_VARIANT,
    );
    expect(resolved.resolvedLayout.showDividers).toBe(true);
    expect(resolved.resolvedLayout.alignment).toBe(DEFAULT_LAYOUT.alignment);
  });
});
