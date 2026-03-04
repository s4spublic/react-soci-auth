import { describe, it, expect } from 'vitest';
import { resolveTokens, toCSSProperties, getDefaultTheme } from '../../engine/ThemeEngine';
import { DEFAULT_THEME } from '../../defaults';

describe('ThemeEngine', () => {
  describe('getDefaultTheme', () => {
    it('returns light theme matching DEFAULT_THEME', () => {
      const light = getDefaultTheme('light');
      expect(light.mode).toBe('light');
      expect(light.colors.text).toBe('#1a1a2e');
      expect(light.colors.background).toBe('rgba(255, 255, 255, 0.05)');
    });

    it('returns dark theme with distinct colors', () => {
      const dark = getDefaultTheme('dark');
      expect(dark.mode).toBe('dark');
      expect(dark.colors.text).toBe('#e2e8f0');
      expect(dark.colors.background).toBe('rgba(0, 0, 0, 0.3)');
      expect(dark.colors.surface).toBe('rgba(255, 255, 255, 0.05)');
      expect(dark.colors.border).toBe('rgba(255, 255, 255, 0.08)');
    });

    it('light and dark modes have distinct text, background, surface, and border', () => {
      const light = getDefaultTheme('light');
      const dark = getDefaultTheme('dark');
      expect(light.colors.text).not.toBe(dark.colors.text);
      expect(light.colors.background).not.toBe(dark.colors.background);
      expect(light.colors.surface).not.toBe(dark.colors.surface);
      expect(light.colors.border).not.toBe(dark.colors.border);
    });
  });

  describe('resolveTokens', () => {
    it('returns full defaults when given empty partial', () => {
      const resolved = resolveTokens({});
      expect(resolved.mode).toBe('light');
      expect(resolved.colors).toEqual(DEFAULT_THEME.colors);
      expect(resolved.spacing).toEqual(DEFAULT_THEME.spacing);
      expect(resolved.radius).toEqual(DEFAULT_THEME.radius);
      expect(resolved.glass).toEqual(DEFAULT_THEME.glass);
      expect(resolved.motion).toEqual(DEFAULT_THEME.motion);
      expect(resolved.button).toEqual(DEFAULT_THEME.button);
    });

    it('uses dark defaults when mode is dark', () => {
      const resolved = resolveTokens({ mode: 'dark' });
      expect(resolved.mode).toBe('dark');
      expect(resolved.colors.text).toBe('#e2e8f0');
      expect(resolved.colors.background).toBe('rgba(0, 0, 0, 0.3)');
    });

    it('merges partial colors with defaults', () => {
      const resolved = resolveTokens({ colors: { primary: '#ff0000' } as any });
      expect(resolved.colors.primary).toBe('#ff0000');
      expect(resolved.colors.text).toBe(DEFAULT_THEME.colors.text);
    });

    it('merges partial spacing with defaults', () => {
      const resolved = resolveTokens({ spacing: { xs: '2px' } as any });
      expect(resolved.spacing.xs).toBe('2px');
      expect(resolved.spacing.sm).toBe(DEFAULT_THEME.spacing.sm);
    });

    it('merges partial button config with defaults', () => {
      const resolved = resolveTokens({ button: { shape: 'pill' } as any });
      expect(resolved.button.shape).toBe('pill');
      expect(resolved.button.iconPosition).toBe(DEFAULT_THEME.button.iconPosition);
      expect(resolved.button.size).toBe(DEFAULT_THEME.button.size);
    });
  });

  describe('toCSSProperties', () => {
    it('generates all expected CSS custom properties', () => {
      const resolved = resolveTokens({});
      const css = toCSSProperties(resolved);

      // Colors
      expect(css['--soci-color-primary']).toBe(resolved.colors.primary);
      expect(css['--soci-color-background']).toBe(resolved.colors.background);
      expect(css['--soci-color-text']).toBe(resolved.colors.text);
      expect(css['--soci-color-text-secondary']).toBe(resolved.colors.textSecondary);
      expect(css['--soci-color-border']).toBe(resolved.colors.border);
      expect(css['--soci-color-surface']).toBe(resolved.colors.surface);
      expect(css['--soci-color-success']).toBe(resolved.colors.success);
      expect(css['--soci-color-error']).toBe(resolved.colors.error);

      // Spacing
      expect(css['--soci-spacing-xs']).toBe(resolved.spacing.xs);
      expect(css['--soci-spacing-sm']).toBe(resolved.spacing.sm);
      expect(css['--soci-spacing-md']).toBe(resolved.spacing.md);
      expect(css['--soci-spacing-lg']).toBe(resolved.spacing.lg);
      expect(css['--soci-spacing-xl']).toBe(resolved.spacing.xl);

      // Radius
      expect(css['--soci-radius-sm']).toBe(resolved.radius.sm);
      expect(css['--soci-radius-md']).toBe(resolved.radius.md);
      expect(css['--soci-radius-lg']).toBe(resolved.radius.lg);
      expect(css['--soci-radius-full']).toBe(resolved.radius.full);

      // Glass
      expect(css['--soci-glass-blur']).toBe(resolved.glass.blur);
      expect(css['--soci-glass-opacity']).toBe(String(resolved.glass.opacity));
      expect(css['--soci-glass-shadow']).toBe(resolved.glass.shadow);
      expect(css['--soci-glass-gradient']).toContain('linear-gradient');

      // Motion
      expect(css['--soci-motion-duration']).toBe(resolved.motion.duration);
      expect(css['--soci-motion-easing']).toBe(resolved.motion.easing);

      // Button
      expect(css['--soci-button-shape']).toBe(resolved.button.shape);
      expect(css['--soci-button-icon-position']).toBe(resolved.button.iconPosition);
      expect(css['--soci-button-size']).toBe(resolved.button.size);
    });

    it('reflects custom theme values in CSS properties', () => {
      const resolved = resolveTokens({
        colors: { primary: '#00ff00' } as any,
        glass: { blur: '20px' } as any,
        button: { shape: 'pill' } as any,
      });
      const css = toCSSProperties(resolved);

      expect(css['--soci-color-primary']).toBe('#00ff00');
      expect(css['--soci-glass-blur']).toBe('20px');
      expect(css['--soci-button-shape']).toBe('pill');
    });
  });
});
