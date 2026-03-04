import { useContext } from 'react';
import { SociAuthContext } from '../context/SociAuthContext';
import type { SociAuthContextValue } from '../context/SociAuthContext';

/**
 * Custom hook to access the SociAuth context.
 * Exposes provider states, theme, config, and functions to
 * programmatically trigger OAuth flows without rendering the default UI.
 *
 * @throws Error if called outside of a SociAuthProvider
 */
export function useSociAuth(): SociAuthContextValue {
  const context = useContext(SociAuthContext);

  if (context === null) {
    throw new Error('useSociAuth must be used within a SociAuthProvider');
  }

  return context;
}
