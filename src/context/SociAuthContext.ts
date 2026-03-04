import { createContext } from 'react';
import type {
  ProviderName,
  ProviderState,
  ThemeConfig,
  ResolvedSociAuthConfig,
} from '../types';

export interface SociAuthContextValue {
  providers: Record<ProviderName, ProviderState>;
  theme: ThemeConfig;
  config: ResolvedSociAuthConfig;
  triggerOAuth: (provider: ProviderName) => void;
  isLoading: (provider: ProviderName) => boolean;
  updateProviderState: (provider: ProviderName, state: ProviderState) => void;
}


export const SociAuthContext = createContext<SociAuthContextValue | null>(null);
