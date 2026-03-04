/**
 * Library boundary guards for react-soci-auth.
 *
 * This module documents and enforces the non-responsibility boundaries
 * of the library. react-soci-auth is a social OAuth UI library only.
 *
 * It does NOT:
 * - Implement OTP, magic link, or password-based authentication flows
 * - Store, manage, or interpret user sessions or authentication tokens
 * - Make backend API calls on behalf of the consumer
 *
 * @see Requirements 12.3, 12.4, 12.5
 */

/**
 * Features that are explicitly outside the scope of react-soci-auth.
 */
export const UNSUPPORTED_FEATURES = [
  'otp',
  'magic-link',
  'password-auth',
  'session-management',
  'token-storage',
  'backend-api',
] as const;

export type UnsupportedFeature = (typeof UNSUPPORTED_FEATURES)[number];

const FEATURE_MESSAGES: Record<UnsupportedFeature, string> = {
  'otp': 'react-soci-auth does not support OTP authentication. Handle OTP flows in your own application.',
  'magic-link': 'react-soci-auth does not support magic link authentication. Handle magic link flows in your own application.',
  'password-auth': 'react-soci-auth does not support password-based authentication. Handle password flows in your own application.',
  'session-management': 'react-soci-auth does not manage user sessions. Handle session management in your own application.',
  'token-storage': 'react-soci-auth does not store or interpret auth tokens. Handle token storage in your own application.',
  'backend-api': 'react-soci-auth does not make backend API calls. Handle API communication in your own application.',
};

/**
 * Emits a console.warn when a consumer attempts to use an unsupported feature.
 * Returns the warning message for testability.
 */
export function warnUnsupported(feature: UnsupportedFeature): string {
  const message = FEATURE_MESSAGES[feature];
  console.warn(`[react-soci-auth] ${message}`);
  return message;
}
