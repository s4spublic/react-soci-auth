import type { ProviderConfig, ProviderName, ProviderResponse, OAuthError } from '../types';

export type OAuthResult =
  | { success: true; provider: ProviderName; response: ProviderResponse }
  | { success: false; provider: ProviderName; error: OAuthError };

const PROVIDER_ENDPOINTS: Record<ProviderName, string> = {
  google: 'https://accounts.google.com/o/oauth2/v2/auth',
  apple: 'https://appleid.apple.com/auth/authorize',
  facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
  github: 'https://github.com/login/oauth/authorize',
};

/**
 * Constructs the OAuth authorization URL for a given provider.
 * Credentials exist only as in-memory references during URL construction.
 */
export function buildAuthUrl(provider: ProviderConfig): string {
  const endpoint = PROVIDER_ENDPOINTS[provider.name];
  const url = new URL(endpoint);

  url.searchParams.set('client_id', provider.clientId);
  url.searchParams.set('redirect_uri', provider.redirectUri);
  url.searchParams.set('response_type', 'code');

  if (provider.scopes && provider.scopes.length > 0) {
    url.searchParams.set('scope', provider.scopes.join(' '));
  }

  // Generate a random state parameter for CSRF protection
  const state = generateState();
  url.searchParams.set('state', state);

  return url.toString();
}

/**
 * Initiates the OAuth redirect flow for a given provider.
 * Constructs the auth URL and redirects via window.location.assign().
 */
export function initiateFlow(provider: ProviderConfig): void {
  const url = buildAuthUrl(provider);
  window.location.assign(url);
}

/**
 * Initiates the OAuth flow in a popup window.
 * Returns a Promise that resolves with the callback URL when the popup redirects.
 */
export function initiatePopupFlow(provider: ProviderConfig): Promise<OAuthResult> {
  const url = buildAuthUrl(provider);

  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    url,
    'soci-auth-popup',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  );

  if (!popup) {
    return Promise.resolve({
      success: false,
      provider: provider.name,
      error: {
        provider: provider.name,
        errorType: 'popup_blocked',
        message: 'Popup was blocked by the browser. Please allow popups for this site.',
      },
    });
  }

  return new Promise<OAuthResult>((resolve) => {
    // Poll for popup URL changes (cross-origin safe)
    const interval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(interval);
          resolve({
            success: false,
            provider: provider.name,
            error: {
              provider: provider.name,
              errorType: 'user_cancelled',
              message: 'Authentication popup was closed',
            },
          });
          return;
        }

        // Try to read the popup URL - this will work once it redirects back to our origin
        const popupUrl = popup.location.href;
        if (popupUrl && popupUrl.startsWith(provider.redirectUri)) {
          clearInterval(interval);
          popup.close();
          resolve(handleCallback(popupUrl, provider.name));
        }
      } catch {
        // Cross-origin - popup is still on the provider's domain, keep polling
      }
    }, 200);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (!popup.closed) {
        popup.close();
      }
      resolve({
        success: false,
        provider: provider.name,
        error: {
          provider: provider.name,
          errorType: 'timeout',
          message: 'Authentication timed out',
        },
      });
    }, 5 * 60 * 1000);
  });
}


/**
 * Parses the OAuth callback URL and returns an OAuthResult.
 * Extracts provider name from state or infers from URL structure.
 */
export function handleCallback(url: string, providerName: ProviderName): OAuthResult {
  try {
    const parsedUrl = new URL(url);
    const params = new URLSearchParams(parsedUrl.search);
    const hashParams = new URLSearchParams(parsedUrl.hash.replace('#', ''));

    // Merge search and hash params (some providers use hash fragments)
    const allParams: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      allParams[key] = value;
    }
    for (const [key, value] of hashParams.entries()) {
      if (!allParams[key]) {
        allParams[key] = value;
      }
    }

    // Check for error response from provider
    if (allParams['error']) {
      const errorType = allParams['error'] === 'access_denied' ? 'user_cancelled' : 'auth_error';
      return {
        success: false,
        provider: providerName,
        error: {
          provider: providerName,
          errorType,
          message: allParams['error_description'] || `OAuth flow failed: ${allParams['error']}`,
        },
      };
    }

    // Check for authorization code
    const code = allParams['code'];
    const state = allParams['state'];

    if (!code) {
      return {
        success: false,
        provider: providerName,
        error: {
          provider: providerName,
          errorType: 'parse_error',
          message: 'No authorization code found in callback URL',
        },
      };
    }

    const response: ProviderResponse = {
      provider: providerName,
      code,
      state,
      rawParams: allParams,
    };

    return {
      success: true,
      provider: providerName,
      response,
    };
  } catch {
    return {
      success: false,
      provider: providerName,
      error: {
        provider: providerName,
        errorType: 'parse_error',
        message: 'Failed to parse callback URL',
      },
    };
  }
}

/**
 * Generates a random state parameter for CSRF protection.
 */
function generateState(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
