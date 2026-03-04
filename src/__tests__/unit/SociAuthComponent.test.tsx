import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SociAuthComponent } from '../../components/SociAuthComponent';
import { SociAuthProvider } from '../../context/SociAuthProvider';
import type { SociAuth_Config, ProviderConfig } from '../../types';

// ─── Helpers ─────────────────────────────────────────────────────

function makeProvider(name: 'google' | 'apple' | 'facebook' | 'github', overrides?: Partial<ProviderConfig>): ProviderConfig {
  return {
    name,
    clientId: `${name}-client-id`,
    redirectUri: `https://example.com/callback/${name}`,
    ...overrides,
  };
}

function makeConfig(overrides?: Partial<SociAuth_Config>): SociAuth_Config {
  return {
    providers: [makeProvider('google'), makeProvider('github')],
    ...overrides,
  };
}

function renderWithProvider(config: SociAuth_Config, props?: { className?: string; style?: React.CSSProperties }) {
  return render(
    <SociAuthProvider config={config}>
      <SociAuthComponent {...props} />
    </SociAuthProvider>,
  );
}

// ─── Tests ───────────────────────────────────────────────────────

describe('SociAuthComponent', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location to prevent actual redirects and control search params
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, assign: vi.fn(), search: '', href: 'https://example.com', hash: '' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { writable: true, value: originalLocation });
  });

  describe('rendering with multiple providers', () => {
    it('renders a button for each configured provider', () => {
      const config = makeConfig({
        providers: [makeProvider('google'), makeProvider('apple'), makeProvider('github')],
      });
      renderWithProvider(config);

      const buttons = screen.getAllByRole('button');
      // 3 provider buttons (no dismiss buttons since no banner)
      expect(buttons).toHaveLength(3);
      expect(buttons[0]).toHaveAttribute('data-provider', 'google');
      expect(buttons[1]).toHaveAttribute('data-provider', 'apple');
      expect(buttons[2]).toHaveAttribute('data-provider', 'github');
    });

    it('renders an AuthCard container', () => {
      renderWithProvider(makeConfig());
      expect(screen.getByTestId('soci-auth-card')).toBeInTheDocument();
    });
  });

  describe('divider visibility toggle', () => {
    it('renders dividers between buttons when showDividers is true', () => {
      const config = makeConfig({
        providers: [makeProvider('google'), makeProvider('github')],
        layout: { showDividers: true },
      });
      renderWithProvider(config);

      const dividers = screen.getAllByTestId('soci-divider');
      // 1 divider between 2 buttons
      expect(dividers).toHaveLength(1);
    });

    it('does not render dividers when showDividers is false', () => {
      const config = makeConfig({
        providers: [makeProvider('google'), makeProvider('github')],
        layout: { showDividers: false },
      });
      renderWithProvider(config);

      expect(screen.queryByTestId('soci-divider')).not.toBeInTheDocument();
    });
  });

  describe('label visibility toggle', () => {
    it('renders icon-only variant when showLabels is false', () => {
      const config = makeConfig({
        layout: { showLabels: false },
      });
      renderWithProvider(config);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute('data-variant', 'icon-only');
      });
    });

    it('renders configured variant when showLabels is true', () => {
      const config = makeConfig({
        layout: { showLabels: true },
        buttonVariant: 'icon-plus-text',
      });
      renderWithProvider(config);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute('data-variant', 'icon-plus-text');
      });
    });
  });

  describe('layout alignment and spacing', () => {
    it('applies stretch alignItems in vertical (default) layout', () => {
      const config = makeConfig({ layout: { alignment: 'center' } });
      renderWithProvider(config);

      const component = screen.getByTestId('soci-auth-component');
      expect(component.style.alignItems).toBe('stretch');
    });

    it('applies center alignItems in horizontal layout', () => {
      const config = makeConfig({ layout: { direction: 'horizontal', alignment: 'center' } });
      renderWithProvider(config);

      const component = screen.getByTestId('soci-auth-component');
      expect(component.style.alignItems).toBe('center');
      expect(component.style.justifyContent).toBe('center');
    });

    it('applies left alignment as flex-start justifyContent in horizontal layout', () => {
      const config = makeConfig({ layout: { direction: 'horizontal', alignment: 'left' } });
      renderWithProvider(config);

      const component = screen.getByTestId('soci-auth-component');
      expect(component.style.justifyContent).toBe('flex-start');
    });

    it('applies right alignment as flex-end justifyContent in horizontal layout', () => {
      const config = makeConfig({ layout: { direction: 'horizontal', alignment: 'right' } });
      renderWithProvider(config);

      const component = screen.getByTestId('soci-auth-component');
      expect(component.style.justifyContent).toBe('flex-end');
    });

    it('applies spacing as gap', () => {
      const config = makeConfig({ layout: { spacing: '20px' } });
      renderWithProvider(config);

      const component = screen.getByTestId('soci-auth-component');
      expect(component.style.gap).toBe('20px');
    });
  });

  describe('tab order matches visual order', () => {
    it('renders buttons in the same order as config providers array', () => {
      const config = makeConfig({
        providers: [makeProvider('github'), makeProvider('apple'), makeProvider('google')],
      });
      renderWithProvider(config);

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveAttribute('data-provider', 'github');
      expect(buttons[1]).toHaveAttribute('data-provider', 'apple');
      expect(buttons[2]).toHaveAttribute('data-provider', 'google');
    });
  });

  describe('className and style props', () => {
    it('applies custom className to root element', () => {
      renderWithProvider(makeConfig(), { className: 'my-custom-class' });
      const component = screen.getByTestId('soci-auth-component');
      expect(component).toHaveClass('my-custom-class');
    });

    it('merges custom style with base styles', () => {
      renderWithProvider(makeConfig(), { style: { marginTop: '10px' } });
      const component = screen.getByTestId('soci-auth-component');
      expect(component.style.marginTop).toBe('10px');
      // Base styles should still be present
      expect(component.style.display).toBe('flex');
    });
  });

  describe('callback invocation on OAuth success', () => {
    it('invokes success callback when URL contains code param', () => {
      const onSuccess = vi.fn();
      const config = makeConfig({
        providers: [makeProvider('google', { onSuccess })],
      });

      // Simulate OAuth callback URL
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

      renderWithProvider(config);

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          code: 'abc123',
        }),
      );
    });

    it('invokes error callback when URL contains error param', () => {
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

      renderWithProvider(config);

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          errorType: 'user_cancelled',
        }),
      );
    });
  });

  describe('logging and analytics hooks', () => {
    it('invokes logging hook on button click with non-sensitive data', () => {
      const loggingHook = vi.fn();
      const config = makeConfig({
        behavior: {
          autoRedirect: { enabled: false },
          logging: { hook: loggingHook },
        },
      });
      renderWithProvider(config);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);

      expect(loggingHook).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          eventType: 'initiation',
          timestamp: expect.any(Number),
        }),
      );
      // Ensure no credentials in the event
      const call = loggingHook.mock.calls[0][0];
      expect(JSON.stringify(call)).not.toContain('client-id');
      expect(JSON.stringify(call)).not.toContain('redirectUri');
    });
  });
});
