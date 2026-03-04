import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  UNSUPPORTED_FEATURES,
  warnUnsupported,
  type UnsupportedFeature,
} from '../../guards';

describe('Library boundary guards', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('defines all unsupported feature categories', () => {
    expect(UNSUPPORTED_FEATURES).toContain('otp');
    expect(UNSUPPORTED_FEATURES).toContain('magic-link');
    expect(UNSUPPORTED_FEATURES).toContain('password-auth');
    expect(UNSUPPORTED_FEATURES).toContain('session-management');
    expect(UNSUPPORTED_FEATURES).toContain('token-storage');
    expect(UNSUPPORTED_FEATURES).toContain('backend-api');
  });

  it.each<UnsupportedFeature>([
    'otp',
    'magic-link',
    'password-auth',
    'session-management',
    'token-storage',
    'backend-api',
  ])('warnUnsupported("%s") emits a console.warn', (feature) => {
    const message = warnUnsupported(feature);

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('react-soci-auth'));
    expect(message).toBeTruthy();
  });

  it('warnUnsupported returns the feature-specific message', () => {
    const message = warnUnsupported('otp');
    expect(message).toContain('OTP');
    expect(message).toContain('does not support');
  });
});

describe('Codebase boundary verification', () => {
  it('library source does not export OTP, magic link, or password auth', async () => {
    const indexExports = await import('../../index');
    const exportNames = Object.keys(indexExports);

    const forbidden = ['otp', 'magicLink', 'password', 'login', 'signup'];
    for (const name of forbidden) {
      const hasMatch = exportNames.some(
        (exp) => exp.toLowerCase().includes(name.toLowerCase()),
      );
      expect(hasMatch, `Export list should not contain "${name}"-related exports`).toBe(false);
    }
  });

  it('library source does not export session or token management', async () => {
    const indexExports = await import('../../index');
    const exportNames = Object.keys(indexExports);

    const forbidden = ['session', 'token', 'jwt', 'cookie'];
    for (const name of forbidden) {
      const hasMatch = exportNames.some(
        (exp) => exp.toLowerCase().includes(name.toLowerCase()),
      );
      expect(hasMatch, `Export list should not contain "${name}"-related exports`).toBe(false);
    }
  });
});
