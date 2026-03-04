// react-soci-auth - Social Authentication UI Library for React

// Styles
import './styles/soci-auth.css';

// Components
export { SociAuthComponent } from './components/SociAuthComponent';
export type { SociAuthComponentProps } from './components/SociAuthComponent';
export { SocialButton } from './components/SocialButton';
export type { SocialButtonProps } from './components/SocialButton';
export { AuthCard } from './components/AuthCard';
export type { AuthCardProps } from './components/AuthCard';
export { Divider } from './components/Divider';
export type { DividerProps } from './components/Divider';
export { Banner } from './components/Banner';
export type { BannerProps } from './components/Banner';

// Context
export { SociAuthProvider } from './context/SociAuthProvider';
export { SociAuthContext } from './context/SociAuthContext';
export type { SociAuthContextValue } from './context/SociAuthContext';

// Hooks
export { useSociAuth } from './hooks/useSociAuth';

// Guards (library boundary utilities)
export { UNSUPPORTED_FEATURES, warnUnsupported } from './guards';
export type { UnsupportedFeature } from './guards';

// Types
export type {
  SociAuth_Config,
  ProviderConfig,
  ThemeConfig,
  LayoutConfig,
  BehaviorConfig,
  ProviderResponse,
  ButtonVariant,
  OAuthError,
  ProviderName,
  ButtonShape,
  IconPosition,
  ButtonSize,
  ThemeMode,
  Alignment,
  LogEvent,
  AnalyticsEvent,
  ResolvedProviderConfig,
  ResolvedSociAuthConfig,
  ProviderState,
  ValidationResult,
  ValidationWarning,
} from './types';
