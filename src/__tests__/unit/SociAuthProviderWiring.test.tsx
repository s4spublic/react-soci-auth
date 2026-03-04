import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SociAuthProvider } from '../../context/SociAuthProvider';
import { SociAuthComponent } from '../../components/SociAuthComponent';
import { useSociAuth } from '../../hooks/useSociAuth';
import type { SociAuth_Config, ProviderConfig } from '../../types';

// ─── Helpers ─────────────────────────────────────────────────────

function makeProvider(
  name: 'google' | 'apple' | 'facebook' | 'github',
  overrides?: Partial<ProviderConfig>,
): ProviderConfig {
  return {
    name,
    clientId: `${name}-client-id`,
    redirectUri: `https://example.com/callback/${name}`,
    ...overrides,
  };
}

function makeConfig(overrides?: Partial<SociAuth_Config>): SociAuth_Config {
  return {
    providers: [makeProvider('google')],
    ...overrides,
  };
}

/**
 * Test component that reads provider states from context.
 */
function ProviderStateReader() {
  const { providers } = useSociAuth();
  return (
    <div data-testid="provider-states">
      {Object.entries(providers).map(([name, state]) => (
        <span key={name} data-testid={`state-${name}`}>
          {state.status}
        </span>
      ))}
    </div>
  );
}

// ─── Tests ───────────────────────────────────────────────────────

describe('SociAuthProvider wiring', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...originalLocation,
        assign: vi.fn(),
        search: '',
        href: 'https://example.com',
        hash: '',
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { writable: true, value: originalLocation });
  });

  describe('OAuth callback handling on mount', () => {
    it('updates provider state to success when URL contains code param', () => {
      const onSuccess = vi.fn();
      const config = makeConfig({
        providers: [makeProvider('google', { onSuccess })],
      });

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...originalLocation,
          assign: vi.fn(),
          search: '?code=abc123&state=xyz',
          href: 'https://example.com/callback/google?code=abc123&state=xyz',
          hash: '',
        },
      });

      render(
        <SociAuthProvider config={config}>
          <ProviderStateReader />
        </SociAuthProvider>,
      );

      expect(screen.getByTestId('state-google')).toHaveTextContent('success');
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google', code: 'abc123' }),
      );
    });

    it('updates provider state to error when URL contains error param', () => {
      const onError = vi.fn();
      const config = makeConfig({
        providers: [makeProvider('google', { onError })],
      });

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...originalLocation,
          assign: vi.fn(),
          search: '?error=access_denied&error_description=User+cancelled',
          href: 'https://example.com/callback/google?error=access_denied&error_description=User+cancelled',
          hash: '',
        },
      });

      render(
        <SociAuthProvider config={config}>
          <ProviderStateReader />
        </SociAuthProvider>,
      );

      expect(screen.getByTestId('state-google')).toHaveTextContent('error');
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google', errorType: 'user_cancelled' }),
      );
    });

    it('fires logging hook with success event on successful callback', () => {
      const loggingHook = vi.fn();
      const config = makeConfig({
        providers: [makeProvider('google')],
        behavior: {
          autoRedirect: { enabled: false },
          logging: { hook: loggingHook },
        },
      });

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...originalLocation,
          assign: vi.fn(),
          search: '?code=abc123&state=xyz',
          href: 'https://example.com/callback/google?code=abc123&state=xyz',
          hash: '',
        },
      });

      render(
        <SociAuthProvider config={config}>
          <div />
        </SociAuthProvider>,
      );

      expect(loggingHook).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          eventType: 'success',
          timestamp: expect.any(Number),
        }),
      );
    });

    it('fires logging hook with failure event on error callback', () => {
      const loggingHook = vi.fn();
      const config = makeConfig({
        providers: [makeProvider('google')],
        behavior: {
          autoRedirect: { enabled: false },
          logging: { hook: loggingHook },
        },
      });

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...originalLocation,
          assign: vi.fn(),
          search: '?error=server_error',
          href: 'https://example.com/callback/google?error=server_error',
          hash: '',
        },
      });

      render(
        <SociAuthProvider config={config}>
          <div />
        </SociAuthProvider>,
      );

      expect(loggingHook).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          eventType: 'failure',
          timestamp: expect.any(Number),
        }),
      );
    });
  });

  describe('auto-redirect after successful OAuth', () => {
    it('redirects to configured URL when autoRedirect is enabled', () => {
      const assignMock = vi.fn();
      const config = makeConfig({
        providers: [makeProvider('google')],
        behavior: {
          autoRedirect: { enabled: true, url: 'https://example.com/dashboard' },
        },
      });

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...originalLocation,
          assign: assignMock,
          search: '?code=abc123&state=xyz',
          href: 'https://example.com/callback/google?code=abc123&state=xyz',
          hash: '',
        },
      });

      render(
        <SociAuthProvider config={config}>
          <div />
        </SociAuthProvider>,
      );

      expect(assignMock).toHaveBeenCalledWith('https://example.com/dashboard');
    });

    it('does not redirect when autoRedirect is disabled', () => {
      const assignMock = vi.fn();
      const config = makeConfig({
        providers: [makeProvider('google')],
        behavior: {
          autoRedirect: { enabled: false },
        },
      });

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...originalLocation,
          assign: assignMock,
          search: '?code=abc123&state=xyz',
          href: 'https://example.com/callback/google?code=abc123&state=xyz',
          hash: '',
        },
      });

      render(
        <SociAuthProvider config={config}>
          <div />
        </SociAuthProvider>,
      );

      expect(assignMock).not.toHaveBeenCalled();
    });
  });

  describe('Banner display wired to provider state changes', () => {
    it('shows success banner when provider state changes to success', () => {
      const config = makeConfig({
        providers: [makeProvider('google')],
      });

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...originalLocation,
          assign: vi.fn(),
          search: '?code=abc123&state=xyz',
          href: 'https://example.com/callback/google?code=abc123&state=xyz',
          hash: '',
        },
      });

      render(
        <SociAuthProvider config={config}>
          <SociAuthComponent />
        </SociAuthProvider>,
      );

      expect(screen.getByTestId('soci-banner-success')).toBeInTheDocument();
      expect(screen.getByText(/Successfully authenticated with google/i)).toBeInTheDocument();
    });

    it('shows error banner when provider state changes to error', () => {
      const config = makeConfig({
        providers: [makeProvider('google')],
      });

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...originalLocation,
          assign: vi.fn(),
          search: '?error=access_denied&error_description=User+cancelled',
          href: 'https://example.com/callback/google?error=access_denied&error_description=User+cancelled',
          hash: '',
        },
      });

      render(
        <SociAuthProvider config={config}>
          <SociAuthComponent />
        </SociAuthProvider>,
      );

      expect(screen.getByTestId('soci-banner-error')).toBeInTheDocument();
    });
  });

  describe('logging hooks in triggerOAuth', () => {
    it('fires logging hook with initiation event when triggerOAuth is called', () => {
      const loggingHook = vi.fn();
      const config = makeConfig({
        providers: [makeProvider('google')],
        behavior: {
          autoRedirect: { enabled: false },
          logging: { hook: loggingHook },
        },
      });

      // Component that triggers OAuth programmatically
      function TriggerComponent() {
        const { triggerOAuth } = useSociAuth();
        React.useEffect(() => {
          triggerOAuth('google');
        }, [triggerOAuth]);
        return null;
      }

      render(
        <SociAuthProvider config={config}>
          <TriggerComponent />
        </SociAuthProvider>,
      );

      expect(loggingHook).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          eventType: 'initiation',
          timestamp: expect.any(Number),
        }),
      );
    });

    it('logging hook events contain only non-sensitive data', () => {
      const loggingHook = vi.fn();
      const config = makeConfig({
        providers: [makeProvider('google')],
        behavior: {
          autoRedirect: { enabled: false },
          logging: { hook: loggingHook },
        },
      });

      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...originalLocation,
          assign: vi.fn(),
          search: '?code=abc123&state=xyz',
          href: 'https://example.com/callback/google?code=abc123&state=xyz',
          hash: '',
        },
      });

      render(
        <SociAuthProvider config={config}>
          <div />
        </SociAuthProvider>,
      );

      const event = loggingHook.mock.calls[0][0];
      const eventStr = JSON.stringify(event);
      expect(eventStr).not.toContain('google-client-id');
      expect(eventStr).not.toContain('callback/google');
      expect(event).toHaveProperty('provider');
      expect(event).toHaveProperty('eventType');
      expect(event).toHaveProperty('timestamp');
    });
  });

  describe('updateProviderState exposed through context', () => {
    it('allows children to update provider state via context', () => {
      const config = makeConfig();

      function StateUpdater() {
        const { updateProviderState, providers } = useSociAuth();
        return (
          <div>
            <span data-testid="google-status">{providers.google.status}</span>
            <button
              data-testid="update-btn"
              onClick={() =>
                updateProviderState('google', {
                  status: 'success',
                  response: { provider: 'google', rawParams: {} },
                })
              }
            >
              Update
            </button>
          </div>
        );
      }

      render(
        <SociAuthProvider config={config}>
          <StateUpdater />
        </SociAuthProvider>,
      );

      expect(screen.getByTestId('google-status')).toHaveTextContent('idle');

      act(() => {
        screen.getByTestId('update-btn').click();
      });

      expect(screen.getByTestId('google-status')).toHaveTextContent('success');
    });
  });
});
