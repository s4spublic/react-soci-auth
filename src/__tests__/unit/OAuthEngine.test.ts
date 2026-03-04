import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildAuthUrl, handleCallback, initiateFlow } from '../../engine/OAuthEngine';
import type { ProviderConfig } from '../../types';

function makeProvider(overrides: Partial<ProviderConfig> = {}): ProviderConfig {
  return {
    name: 'google',
    clientId: 'test-client-id',
    redirectUri: 'https://example.com/callback',
    scopes: ['openid', 'email'],
    ...overrides,
  };
}

describe('OAuthEngine', () => {
  describe('buildAuthUrl', () => {
    it('constructs a valid Google auth URL', () => {
      const url = buildAuthUrl(makeProvider({ name: 'google' }));
      const parsed = new URL(url);
      expect(parsed.origin + parsed.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
      expect(parsed.searchParams.get('client_id')).toBe('test-client-id');
      expect(parsed.searchParams.get('redirect_uri')).toBe('https://example.com/callback');
      expect(parsed.searchParams.get('scope')).toBe('openid email');
      expect(parsed.searchParams.get('response_type')).toBe('code');
      expect(parsed.searchParams.get('state')).toBeTruthy();
    });

    it('constructs a valid Apple auth URL', () => {
      const url = buildAuthUrl(makeProvider({ name: 'apple' }));
      const parsed = new URL(url);
      expect(parsed.origin + parsed.pathname).toBe('https://appleid.apple.com/auth/authorize');
    });

    it('constructs a valid Facebook auth URL', () => {
      const url = buildAuthUrl(makeProvider({ name: 'facebook' }));
      const parsed = new URL(url);
      expect(parsed.origin + parsed.pathname).toBe('https://www.facebook.com/v18.0/dialog/oauth');
    });

    it('constructs a valid GitHub auth URL', () => {
      const url = buildAuthUrl(makeProvider({ name: 'github' }));
      const parsed = new URL(url);
      expect(parsed.origin + parsed.pathname).toBe('https://github.com/login/oauth/authorize');
    });

    it('omits scope param when scopes array is empty', () => {
      const url = buildAuthUrl(makeProvider({ scopes: [] }));
      const parsed = new URL(url);
      expect(parsed.searchParams.has('scope')).toBe(false);
    });

    it('omits scope param when scopes is undefined', () => {
      const url = buildAuthUrl(makeProvider({ scopes: undefined }));
      const parsed = new URL(url);
      expect(parsed.searchParams.has('scope')).toBe(false);
    });

    it('joins multiple scopes with spaces', () => {
      const url = buildAuthUrl(makeProvider({ scopes: ['read', 'write', 'admin'] }));
      const parsed = new URL(url);
      expect(parsed.searchParams.get('scope')).toBe('read write admin');
    });

    it('includes a state parameter', () => {
      const url = buildAuthUrl(makeProvider());
      const parsed = new URL(url);
      const state = parsed.searchParams.get('state');
      expect(state).toBeTruthy();
      expect(state!.length).toBe(32); // 16 bytes = 32 hex chars
    });
  });

  describe('handleCallback', () => {
    it('parses a successful callback with code and state', () => {
      const result = handleCallback(
        'https://example.com/callback?code=abc123&state=xyz',
        'google'
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.provider).toBe('google');
        expect(result.response.code).toBe('abc123');
        expect(result.response.state).toBe('xyz');
        expect(result.response.rawParams).toEqual({
          code: 'abc123',
          state: 'xyz',
        });
      }
    });

    it('returns error for provider error response', () => {
      const result = handleCallback(
        'https://example.com/callback?error=invalid_scope&error_description=Bad+scope',
        'facebook'
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.provider).toBe('facebook');
        expect(result.error.errorType).toBe('auth_error');
        expect(result.error.message).toBe('Bad scope');
      }
    });

    it('returns user_cancelled for access_denied error', () => {
      const result = handleCallback(
        'https://example.com/callback?error=access_denied',
        'github'
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errorType).toBe('user_cancelled');
      }
    });

    it('returns parse_error when no code is present', () => {
      const result = handleCallback(
        'https://example.com/callback?state=xyz',
        'apple'
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errorType).toBe('parse_error');
        expect(result.error.message).toContain('No authorization code');
      }
    });

    it('returns parse_error for malformed URL', () => {
      const result = handleCallback('not-a-valid-url', 'google');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errorType).toBe('parse_error');
        expect(result.error.message).toContain('Failed to parse');
      }
    });

    it('includes all URL params in rawParams', () => {
      const result = handleCallback(
        'https://example.com/callback?code=abc&state=xyz&extra=value',
        'google'
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.response.rawParams).toEqual({
          code: 'abc',
          state: 'xyz',
          extra: 'value',
        });
      }
    });

    it('error objects never contain credential values', () => {
      const result = handleCallback(
        'https://example.com/callback?error=server_error&error_description=Something+went+wrong',
        'google'
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toHaveProperty('provider');
        expect(result.error).toHaveProperty('errorType');
        expect(result.error).toHaveProperty('message');
        // Should only have these 3 fields
        expect(Object.keys(result.error)).toEqual(['provider', 'errorType', 'message']);
      }
    });
  });

  describe('initiateFlow', () => {
    beforeEach(() => {
      // Mock window.location.assign
      Object.defineProperty(window, 'location', {
        value: { assign: vi.fn() },
        writable: true,
      });
    });

    it('calls window.location.assign with the constructed URL', () => {
      const provider = makeProvider();
      initiateFlow(provider);
      expect(window.location.assign).toHaveBeenCalledTimes(1);
      const calledUrl = (window.location.assign as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const parsed = new URL(calledUrl);
      expect(parsed.searchParams.get('client_id')).toBe('test-client-id');
    });
  });
});
