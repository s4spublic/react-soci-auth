import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useSociAuth } from '../../hooks/useSociAuth';
import { SociAuthContext } from '../../context/SociAuthContext';
import type { SociAuthContextValue } from '../../context/SociAuthContext';
import type { ProviderState, ThemeConfig, ResolvedSociAuthConfig } from '../../types';
import { DEFAULT_THEME, DEFAULT_LAYOUT, DEFAULT_BEHAVIOR, DEFAULT_BUTTON_VARIANT } from '../../defaults';

function makeMockContext(overrides?: Partial<SociAuthContextValue>): SociAuthContextValue {
  return {
    providers: {
      google: { status: 'idle' },
      apple: { status: 'idle' },
      facebook: { status: 'idle' },
      github: { status: 'idle' },
    } as Record<string, ProviderState>,
    theme: DEFAULT_THEME,
    config: {
      providers: [],
      theme: DEFAULT_THEME,
      layout: DEFAULT_LAYOUT,
      behavior: DEFAULT_BEHAVIOR,
      buttonVariant: DEFAULT_BUTTON_VARIANT,
    } as ResolvedSociAuthConfig,
    triggerOAuth: vi.fn(),
    isLoading: vi.fn(() => false),
    updateProviderState: vi.fn(),
    ...overrides,
  };
}

function wrapper(contextValue: SociAuthContextValue) {
  return ({ children }: { children: React.ReactNode }) => (
    <SociAuthContext.Provider value={contextValue}>
      {children}
    </SociAuthContext.Provider>
  );
}

describe('useSociAuth', () => {
  it('throws when called outside SociAuthProvider', () => {
    expect(() => {
      renderHook(() => useSociAuth());
    }).toThrow('useSociAuth must be used within a SociAuthProvider');
  });

  it('returns context value when inside SociAuthProvider', () => {
    const mockCtx = makeMockContext();
    const { result } = renderHook(() => useSociAuth(), {
      wrapper: wrapper(mockCtx),
    });

    expect(result.current.providers).toBe(mockCtx.providers);
    expect(result.current.theme).toBe(mockCtx.theme);
    expect(result.current.config).toBe(mockCtx.config);
    expect(result.current.triggerOAuth).toBe(mockCtx.triggerOAuth);
    expect(result.current.isLoading).toBe(mockCtx.isLoading);
  });

  it('exposes triggerOAuth that can be called programmatically', () => {
    const triggerOAuth = vi.fn();
    const mockCtx = makeMockContext({ triggerOAuth });
    const { result } = renderHook(() => useSociAuth(), {
      wrapper: wrapper(mockCtx),
    });

    result.current.triggerOAuth('google');
    expect(triggerOAuth).toHaveBeenCalledWith('google');
    expect(triggerOAuth).toHaveBeenCalledTimes(1);
  });

  it('exposes isLoading that reports provider loading state', () => {
    const isLoading = vi.fn((provider: string) => provider === 'apple');
    const mockCtx = makeMockContext({ isLoading });
    const { result } = renderHook(() => useSociAuth(), {
      wrapper: wrapper(mockCtx),
    });

    expect(result.current.isLoading('apple')).toBe(true);
    expect(result.current.isLoading('google')).toBe(false);
  });

  it('reflects provider state changes from context', () => {
    const providers = {
      google: { status: 'loading' as const },
      apple: { status: 'success' as const, response: { provider: 'apple' as const, rawParams: {} } },
      facebook: { status: 'error' as const, error: { provider: 'facebook' as const, errorType: 'auth_error', message: 'denied' } },
      github: { status: 'idle' as const },
    };
    const mockCtx = makeMockContext({ providers });
    const { result } = renderHook(() => useSociAuth(), {
      wrapper: wrapper(mockCtx),
    });

    expect(result.current.providers.google.status).toBe('loading');
    expect(result.current.providers.apple.status).toBe('success');
    expect(result.current.providers.facebook.status).toBe('error');
    expect(result.current.providers.github.status).toBe('idle');
  });
});
