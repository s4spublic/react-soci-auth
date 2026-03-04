import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type {
  SociAuth_Config,
  ProviderName,
  ProviderState,
} from '../types';
import { SociAuthContext, type SociAuthContextValue } from './SociAuthContext';
import { validateConfig, mergeConfig } from '../engine/ConfigMerger';
import { resolveTokens, toCSSProperties } from '../engine/ThemeEngine';
import { initiatePopupFlow, handleCallback } from '../engine/OAuthEngine';

export interface SociAuthProviderProps {
  config: SociAuth_Config;
  children: React.ReactNode;
}

const IDLE_STATE: ProviderState = { status: 'idle' };

function initProviderStates(): Record<ProviderName, ProviderState> {
  return {
    google: { ...IDLE_STATE },
    apple: { ...IDLE_STATE },
    facebook: { ...IDLE_STATE },
    github: { ...IDLE_STATE },
  };
}

/**
 * Checks whether the current URL contains OAuth callback parameters.
 */
function hasOAuthCallbackParams(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('code') || params.has('error');
}

/**
 * Detects the provider from the URL state parameter or
 * falls back to the first provider in the list.
 */
function detectProviderFromUrl(providerNames: ProviderName[]): ProviderName | null {
  if (providerNames.length === 0) return null;
  return providerNames[0];
}

export function SociAuthProvider({ config, children }: SociAuthProviderProps) {
  const [providerStates, setProviderStates] = useState<Record<ProviderName, ProviderState>>(
    initProviderStates,
  );

  // Validate and resolve config via useMemo — recomputes only when config changes
  const resolvedConfig = useMemo(() => {
    const validation = validateConfig(config);
    if (!validation.valid) {
      for (const warning of validation.warnings) {
        console.warn(warning.message);
      }
    }
    return mergeConfig(config);
  }, [config]);

  // Resolve theme tokens and convert to CSS custom properties
  const resolvedTheme = useMemo(
    () => resolveTokens(resolvedConfig.theme),
    [resolvedConfig.theme],
  );

  const cssProperties = useMemo(
    () => toCSSProperties(resolvedTheme),
    [resolvedTheme],
  );

  // updateProviderState — allows children (e.g. SociAuthComponent) to update provider states
  const updateProviderState = useCallback(
    (providerName: ProviderName, state: ProviderState) => {
      setProviderStates((prev) => ({
        ...prev,
        [providerName]: state,
      }));
    },
    [],
  );

  // triggerOAuth — finds the provider config, sets state to loading, fires logging hook, initiates popup flow
  // Credentials are only passed to OAuthEngine for the immediate popup; never stored in context
  const triggerOAuth = useCallback(
    (providerName: ProviderName) => {
      const providerConfig = resolvedConfig.providers.find((p) => p.name === providerName);
      if (!providerConfig) return;

      setProviderStates((prev) => ({
        ...prev,
        [providerName]: { status: 'loading' as const },
      }));

      // Fire logging hook for initiation with non-sensitive data
      resolvedConfig.behavior.logging?.hook({
        provider: providerName,
        eventType: 'initiation',
        timestamp: Date.now(),
      });

      // Use popup flow instead of full-page redirect
      initiatePopupFlow(providerConfig).then((result) => {
        if (result.success) {
          setProviderStates((prev) => ({
            ...prev,
            [providerName]: {
              status: 'success' as const,
              response: result.response,
            },
          }));
          providerConfig.onSuccess?.(result.response);
          resolvedConfig.behavior.logging?.hook({
            provider: providerName,
            eventType: 'success',
            timestamp: Date.now(),
          });
          if (resolvedConfig.behavior.autoRedirect.enabled && resolvedConfig.behavior.autoRedirect.url) {
            window.location.assign(resolvedConfig.behavior.autoRedirect.url);
          }
        } else {
          setProviderStates((prev) => ({
            ...prev,
            [providerName]: {
              status: 'error' as const,
              error: result.error,
            },
          }));
          providerConfig.onError?.(result.error);
          resolvedConfig.behavior.logging?.hook({
            provider: providerName,
            eventType: 'failure',
            timestamp: Date.now(),
          });
        }
      });
    },
    [resolvedConfig.providers, resolvedConfig.behavior],
  );

  // Handle OAuth callback on mount — detect callback params, parse, update provider states,
  // fire callbacks and logging hooks, trigger auto-redirect
  useEffect(() => {
    if (!hasOAuthCallbackParams()) return;

    const providerNames = resolvedConfig.providers.map((p) => p.name);
    const detectedProvider = detectProviderFromUrl(providerNames);
    if (!detectedProvider) return;

    const result = handleCallback(window.location.href, detectedProvider);
    // Find the original (unsanitised) provider config for callbacks
    const providerConfig = resolvedConfig.providers.find((p) => p.name === detectedProvider);

    if (result.success) {
      // Update provider state to success
      setProviderStates((prev) => ({
        ...prev,
        [detectedProvider]: {
          status: 'success' as const,
          response: result.response,
        },
      }));

      // Invoke provider-specific success callback
      providerConfig?.onSuccess?.(result.response);

      // Fire logging hook with non-sensitive data
      resolvedConfig.behavior.logging?.hook({
        provider: detectedProvider,
        eventType: 'success',
        timestamp: Date.now(),
      });

      // Auto-redirect if configured
      if (resolvedConfig.behavior.autoRedirect.enabled && resolvedConfig.behavior.autoRedirect.url) {
        window.location.assign(resolvedConfig.behavior.autoRedirect.url);
      }
    } else {
      // Update provider state to error
      setProviderStates((prev) => ({
        ...prev,
        [detectedProvider]: {
          status: 'error' as const,
          error: result.error,
        },
      }));

      // Invoke provider-specific error callback
      providerConfig?.onError?.(result.error);

      // Fire logging hook with non-sensitive data
      resolvedConfig.behavior.logging?.hook({
        provider: detectedProvider,
        eventType: 'failure',
        timestamp: Date.now(),
      });
    }
    // Run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = useCallback(
    (providerName: ProviderName) => providerStates[providerName]?.status === 'loading',
    [providerStates],
  );

  // Build context value — strip credentials from the exposed config
  // ResolvedProviderConfig still carries clientId/redirectUri on the resolved objects,
  // so we create a sanitised copy that omits sensitive fields.
  const sanitisedConfig = useMemo(() => {
    const sanitisedProviders = resolvedConfig.providers.map(
      ({ clientId: _cid, redirectUri: _ruri, ...rest }) => ({
        ...rest,
        clientId: '',
        redirectUri: '',
      }),
    );
    return { ...resolvedConfig, providers: sanitisedProviders };
  }, [resolvedConfig]);

  const contextValue: SociAuthContextValue = useMemo(
    () => ({
      providers: providerStates,
      theme: resolvedTheme,
      config: sanitisedConfig,
      triggerOAuth,
      isLoading,
      updateProviderState,
    }),
    [providerStates, resolvedTheme, sanitisedConfig, triggerOAuth, isLoading, updateProviderState],
  );

  return (
    <SociAuthContext.Provider value={contextValue}>
      <div style={cssProperties as React.CSSProperties}>
        {children}
      </div>
    </SociAuthContext.Provider>
  );
}
