import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SocialButton } from '../../components/SocialButton';
import { SociAuthContext, type SociAuthContextValue } from '../../context/SociAuthContext';
import { DEFAULT_THEME, DEFAULT_LABELS } from '../../defaults';
import type { ProviderName, ThemeConfig } from '../../types';

// Helper to render SocialButton within a context provider
function renderWithContext(
  ui: React.ReactElement,
  contextOverrides: Partial<SociAuthContextValue> = {},
) {
  const defaultContext: SociAuthContextValue = {
    providers: {
      google: { status: 'idle' },
      apple: { status: 'idle' },
      facebook: { status: 'idle' },
      github: { status: 'idle' },
    },
    theme: DEFAULT_THEME,
    config: {
      providers: [],
      theme: DEFAULT_THEME,
      layout: { alignment: 'center', spacing: '12px', showLabels: true, showDividers: false },
      behavior: { autoRedirect: { enabled: false } },
      buttonVariant: 'icon-plus-text',
    },
    triggerOAuth: vi.fn(),
    isLoading: () => false,
    ...contextOverrides,
  };

  return render(
    <SociAuthContext.Provider value={defaultContext}>
      {ui}
    </SociAuthContext.Provider>,
  );
}

describe('SocialButton', () => {
  describe('rendering variants', () => {
    it('renders icon and label for icon-plus-text variant', () => {
      renderWithContext(<SocialButton provider="google" variant="icon-plus-text" />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Sign in with Google');
      // Icon should be present (SVG)
      expect(button.querySelector('svg')).toBeTruthy();
    });

    it('renders only label for text-only variant', () => {
      renderWithContext(<SocialButton provider="google" variant="text-only" />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Sign in with Google');
      // No icon span should be rendered
      expect(button.querySelector('svg')).toBeNull();
    });

    it('renders only icon for icon-only variant', () => {
      renderWithContext(<SocialButton provider="google" variant="icon-only" />);
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeTruthy();
      // Should not contain label text
      expect(button).not.toHaveTextContent('Sign in with Google');
    });
  });

  describe('default labels per provider', () => {
    const providers: ProviderName[] = ['google', 'apple', 'facebook', 'github'];

    providers.forEach((provider) => {
      it(`renders default label for ${provider}`, () => {
        renderWithContext(<SocialButton provider={provider} />);
        expect(screen.getByRole('button')).toHaveTextContent(DEFAULT_LABELS[provider]);
      });
    });
  });

  describe('custom label and icon', () => {
    it('renders custom label when provided', () => {
      renderWithContext(<SocialButton provider="google" label="Continue with Google" />);
      expect(screen.getByRole('button')).toHaveTextContent('Continue with Google');
    });

    it('renders custom icon when provided', () => {
      const customIcon = <span data-testid="custom-icon">★</span>;
      renderWithContext(<SocialButton provider="google" icon={customIcon} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('ARIA and accessibility', () => {
    it('has aria-label matching the provider label', () => {
      renderWithContext(<SocialButton provider="github" />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Sign in with GitHub');
    });

    it('uses custom label as aria-label when provided', () => {
      renderWithContext(<SocialButton provider="github" label="Log in via GitHub" />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Log in via GitHub');
    });

    it('supports keyboard activation with Enter', () => {
      const onClick = vi.fn();
      renderWithContext(<SocialButton provider="google" onClick={onClick} />);
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard activation with Space', () => {
      const onClick = vi.fn();
      renderWithContext(<SocialButton provider="google" onClick={onClick} />);
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger on other keys', () => {
      const onClick = vi.fn();
      renderWithContext(<SocialButton provider="google" onClick={onClick} />);
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Tab' });
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('click handling', () => {
    it('calls onClick prop when provided', () => {
      const onClick = vi.fn();
      renderWithContext(<SocialButton provider="google" onClick={onClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls triggerOAuth from context when no onClick prop', () => {
      const triggerOAuth = vi.fn();
      renderWithContext(<SocialButton provider="facebook" />, { triggerOAuth });
      fireEvent.click(screen.getByRole('button'));
      expect(triggerOAuth).toHaveBeenCalledWith('facebook');
    });

    it('does not fire click when disabled', () => {
      const onClick = vi.fn();
      renderWithContext(<SocialButton provider="google" onClick={onClick} disabled />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('analytics', () => {
    it('invokes analytics hook on click with non-sensitive data', () => {
      const analyticsHook = vi.fn();
      renderWithContext(<SocialButton provider="google" />, {
        config: {
          providers: [],
          theme: DEFAULT_THEME,
          layout: { alignment: 'center', spacing: '12px', showLabels: true, showDividers: false },
          behavior: { autoRedirect: { enabled: false }, analytics: { hook: analyticsHook } },
          buttonVariant: 'icon-plus-text',
        },
      });
      fireEvent.click(screen.getByRole('button'));
      expect(analyticsHook).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          interactionType: 'click',
          timestamp: expect.any(Number),
        }),
      );
    });

    it('invokes analytics hook on hover', () => {
      const analyticsHook = vi.fn();
      renderWithContext(<SocialButton provider="apple" />, {
        config: {
          providers: [],
          theme: DEFAULT_THEME,
          layout: { alignment: 'center', spacing: '12px', showLabels: true, showDividers: false },
          behavior: { autoRedirect: { enabled: false }, analytics: { hook: analyticsHook } },
          buttonVariant: 'icon-plus-text',
        },
      });
      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(analyticsHook).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'apple', interactionType: 'hover' }),
      );
    });

    it('invokes analytics hook on focus', () => {
      const analyticsHook = vi.fn();
      renderWithContext(<SocialButton provider="github" />, {
        config: {
          providers: [],
          theme: DEFAULT_THEME,
          layout: { alignment: 'center', spacing: '12px', showLabels: true, showDividers: false },
          behavior: { autoRedirect: { enabled: false }, analytics: { hook: analyticsHook } },
          buttonVariant: 'icon-plus-text',
        },
      });
      fireEvent.focus(screen.getByRole('button'));
      expect(analyticsHook).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'github', interactionType: 'focus' }),
      );
    });
  });

  describe('button shape', () => {
    it('applies pill border-radius (9999px)', () => {
      renderWithContext(
        <SocialButton provider="google" theme={{ button: { shape: 'pill', iconPosition: 'left', size: 'medium' } }} />,
      );
      const button = screen.getByRole('button');
      expect(button.style.borderRadius).toBe('9999px');
    });

    it('applies rounded border-radius (10px)', () => {
      renderWithContext(
        <SocialButton provider="google" theme={{ button: { shape: 'rounded', iconPosition: 'left', size: 'medium' } }} />,
      );
      expect(screen.getByRole('button').style.borderRadius).toBe('10px');
    });

    it('applies square border-radius (0)', () => {
      renderWithContext(
        <SocialButton provider="google" theme={{ button: { shape: 'square', iconPosition: 'left', size: 'medium' } }} />,
      );
      expect(screen.getByRole('button').style.borderRadius).toBe('0');
    });
  });

  describe('button size', () => {
    it('applies small height (32px)', () => {
      renderWithContext(
        <SocialButton provider="google" theme={{ button: { shape: 'rounded', iconPosition: 'left', size: 'small' } }} />,
      );
      expect(screen.getByRole('button').style.height).toBe('32px');
    });

    it('applies medium height (40px)', () => {
      renderWithContext(
        <SocialButton provider="google" theme={{ button: { shape: 'rounded', iconPosition: 'left', size: 'medium' } }} />,
      );
      expect(screen.getByRole('button').style.height).toBe('40px');
    });

    it('applies large height (48px)', () => {
      renderWithContext(
        <SocialButton provider="google" theme={{ button: { shape: 'rounded', iconPosition: 'left', size: 'large' } }} />,
      );
      expect(screen.getByRole('button').style.height).toBe('48px');
    });
  });

  describe('icon position', () => {
    it('uses row direction for left icon position', () => {
      renderWithContext(
        <SocialButton provider="google" theme={{ button: { shape: 'rounded', iconPosition: 'left', size: 'medium' } }} />,
      );
      expect(screen.getByRole('button').style.flexDirection).toBe('row');
    });

    it('uses row-reverse direction for right icon position', () => {
      renderWithContext(
        <SocialButton provider="google" theme={{ button: { shape: 'rounded', iconPosition: 'right', size: 'medium' } }} />,
      );
      expect(screen.getByRole('button').style.flexDirection).toBe('row-reverse');
    });

    it('uses column direction for top icon position', () => {
      renderWithContext(
        <SocialButton provider="google" theme={{ button: { shape: 'rounded', iconPosition: 'top', size: 'medium' } }} />,
      );
      expect(screen.getByRole('button').style.flexDirection).toBe('column');
    });
  });

  describe('custom className and style', () => {
    it('applies custom className', () => {
      renderWithContext(<SocialButton provider="google" className="my-custom-btn" />);
      expect(screen.getByRole('button')).toHaveClass('my-custom-btn');
    });

    it('merges custom style with base styles', () => {
      renderWithContext(<SocialButton provider="google" style={{ marginTop: '10px' }} />);
      expect(screen.getByRole('button').style.marginTop).toBe('10px');
    });
  });

  describe('React.memo', () => {
    it('is wrapped with React.memo', () => {
      // React.memo components have a $$typeof of Symbol(react.memo)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const memoType = (SocialButton as any).$$typeof;
      expect(memoType).toBeDefined();
      expect(memoType.toString()).toBe('Symbol(react.memo)');
    });
  });

  describe('default SVG icons per provider', () => {
    const providers: ProviderName[] = ['google', 'apple', 'facebook', 'github'];

    providers.forEach((provider) => {
      it(`renders a default SVG icon for ${provider}`, () => {
        renderWithContext(<SocialButton provider={provider} />);
        const button = screen.getByRole('button');
        expect(button.querySelector('svg')).toBeTruthy();
      });
    });
  });
});
