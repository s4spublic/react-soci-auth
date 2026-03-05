<p align="center">
  <h1 align="center">react-soci-auth</h1>
  <p align="center">
    A premium, glassmorphism-styled social authentication UI library for React.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-soci-auth"><img src="https://img.shields.io/npm/v/react-soci-auth.svg?style=flat-square" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/react-soci-auth"><img src="https://img.shields.io/bundlephobia/minzip/react-soci-auth?style=flat-square" alt="bundle size" /></a>
  <a href="https://github.com/s4spublic/react-soci-auth/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/react-soci-auth.svg?style=flat-square" alt="license" /></a>
</p>

<p align="center">
  <a href="https://s4spublic.github.io/react-soci-auth/">Live Demo</a> · <a href="#quick-start">Quick Start</a> · <a href="#configuration">Configuration</a> · <a href="#examples">Examples</a>
</p>

---

Drop-in social login buttons for Google, Apple, Facebook, and GitHub with glassmorphism styling, dark mode, 3D depth effects, and full TypeScript support. Zero CSS imports required.

**[See it in action →](https://s4spublic.github.io/react-soci-auth/)**

## Features

- 🔐 **OAuth 2.0** popup-based flow for Google, Apple, Facebook, and GitHub
- 🎨 **Glassmorphism** design with blur, transparency, and gradient effects
- 🌗 **Dark & Light** mode with full color customization
- 🧩 **Multiple button variants** — icon-only, text-only, icon + text
- 📐 **Flexible layouts** — horizontal / vertical, left / center / right alignment
- ✨ **Effects** — 3D depth tilt on hover, animated color fill
- 📦 **Tree-shakeable** — import only what you need
- 🔒 **TypeScript-first** — every prop, config, and return type is fully typed
- ♿ **Accessible** — semantic HTML, ARIA attributes, keyboard navigation
- 🎯 **Standalone components** — use `SocialButton`, `AuthCard`, `Divider`, or `Banner` independently

## Install

```bash
npm install react-soci-auth
```

```bash
yarn add react-soci-auth
```

```bash
pnpm add react-soci-auth
```

> **Peer dependencies:** `react >= 18.0.0` and `react-dom >= 18.0.0`

## Quick Start

```tsx
import { SociAuthProvider, SociAuthComponent } from 'react-soci-auth';
import type { SociAuth_Config, ProviderResponse, OAuthError } from 'react-soci-auth';

const config: SociAuth_Config = {
  providers: [
    {
      name: 'google',
      clientId: 'YOUR_GOOGLE_CLIENT_ID',
      redirectUri: window.location.origin + '/callback.html',
      scopes: ['openid', 'email', 'profile'],
      onSuccess: (response: ProviderResponse) => {
        console.log('Google auth code:', response.code);
        // Send response.code to your backend to exchange for tokens
      },
      onError: (error: OAuthError) => {
        console.error('Google auth failed:', error.message);
      },
    },
    {
      name: 'github',
      clientId: 'YOUR_GITHUB_CLIENT_ID',
      redirectUri: window.location.origin + '/callback.html',
      scopes: ['read:user', 'user:email'],
      onSuccess: (response: ProviderResponse) => {
        console.log('GitHub auth code:', response.code);
      },
      onError: (error: OAuthError) => {
        console.error('GitHub auth failed:', error.message);
      },
    },
  ],
  theme: { mode: 'dark' },
  buttonVariant: 'icon-plus-text',
  showCard: true,
  cardTitle: 'Welcome Back',
  cardSubtitle: 'Sign in to continue',
};

function App() {
  return (
    <SociAuthProvider config={config}>
      <SociAuthComponent />
    </SociAuthProvider>
  );
}

export default App;
```

No CSS import needed — styles are bundled automatically when you import any component.

## Configuration

### SociAuth_Config

The top-level configuration object passed to `<SociAuthProvider>`.

| Property | Type | Default | Description |
|---|---|---|---|
| `providers` | `ProviderConfig[]` | *required* | Array of OAuth provider configurations |
| `theme` | `Partial<ThemeConfig>` | — | Global theme overrides |
| `layout` | `Partial<LayoutConfig>` | — | Global layout overrides |
| `behavior` | `Partial<BehaviorConfig>` | — | Behavioral settings |
| `buttonVariant` | `ButtonVariant` | `'icon-plus-text'` | Default button display style |
| `enable3DDepth` | `boolean` | `false` | Enable 3D tilt effect on hover |
| `showCard` | `boolean` | `true` | Wrap buttons in a card container |
| `enableHoverFill` | `boolean` | `false` | Enable animated color fill on hover |
| `hoverFillColor` | `string` | `'#6366f1'` | Color used for hover fill animation |
| `cardTitle` | `string` | `'Welcome Back'` | Title displayed in the auth card |
| `cardSubtitle` | `string` | `'Sign in to continue'` | Subtitle displayed in the auth card |
| `contentAlignment` | `Alignment` | `'center'` | Alignment of button content (`'left'` \| `'center'` \| `'right'`) |

### ProviderConfig

Configuration for each OAuth provider.

| Property | Type | Default | Description |
|---|---|---|---|
| `name` | `ProviderName` | *required* | `'google'` \| `'apple'` \| `'facebook'` \| `'github'` |
| `clientId` | `string` | *required* | OAuth client ID from the provider |
| `redirectUri` | `string` | *required* | Redirect URI registered with the provider |
| `scopes` | `string[]` | — | OAuth scopes to request |
| `label` | `string` | — | Custom button label (overrides default) |
| `icon` | `React.ReactNode` | — | Custom icon element (overrides built-in icon) |
| `onSuccess` | `(response: ProviderResponse) => void` | — | Called with the auth code on success |
| `onError` | `(error: OAuthError) => void` | — | Called when authentication fails |
| `theme` | `Partial<ThemeConfig>` | — | Per-provider theme overrides |
| `layout` | `Partial<LayoutConfig>` | — | Per-provider layout overrides |
| `buttonVariant` | `ButtonVariant` | — | Per-provider button variant override |


### ThemeConfig

Full theme customization. All properties are optional when using `Partial<ThemeConfig>`.

| Property | Type | Default | Description |
|---|---|---|---|
| `mode` | `ThemeMode` | `'light'` | `'light'` \| `'dark'` |
| `colors.primary` | `string` | `'#6366f1'` | Primary accent color |
| `colors.background` | `string` | `'rgba(255, 255, 255, 0.05)'` | Background color |
| `colors.surface` | `string` | `'rgba(255, 255, 255, 0.1)'` | Surface / card color |
| `colors.text` | `string` | `'#ffffff'` | Primary text color |
| `colors.textSecondary` | `string` | `'rgba(255, 255, 255, 0.7)'` | Secondary text color |
| `colors.border` | `string` | `'rgba(255, 255, 255, 0.18)'` | Border color |
| `colors.success` | `string` | `'#22c55e'` | Success state color |
| `colors.error` | `string` | `'#ef4444'` | Error state color |
| `spacing` | `{ xs, sm, md, lg, xl }` | — | Spacing scale |
| `radius` | `{ sm, md, lg, full }` | — | Border radius scale |
| `glass.blur` | `string` | `'12px'` | Glassmorphism blur amount |
| `glass.opacity` | `number` | `0.15` | Glass layer opacity |
| `glass.gradient` | `string[]` | — | Gradient stops for glass effect |
| `glass.shadow` | `string` | — | Box shadow for glass elements |
| `motion.duration` | `string` | `'200ms'` | Transition duration |
| `motion.easing` | `string` | — | Transition easing function |
| `button.shape` | `ButtonShape` | `'rounded'` | `'pill'` \| `'rounded'` \| `'square'` |
| `button.iconPosition` | `IconPosition` | `'left'` | `'left'` \| `'right'` \| `'top'` |
| `button.size` | `ButtonSize` | `'medium'` | `'small'` \| `'medium'` \| `'large'` |

### LayoutConfig

| Property | Type | Default | Description |
|---|---|---|---|
| `alignment` | `Alignment` | `'center'` | `'left'` \| `'center'` \| `'right'` |
| `spacing` | `string` | `'12px'` | Gap between buttons |
| `showLabels` | `boolean` | `true` | Show text labels on buttons |
| `showDividers` | `boolean` | `false` | Show dividers between buttons |
| `direction` | `'horizontal'` \| `'vertical'` | `'vertical'` | Button layout direction |

## Components

### SociAuthComponent

The main all-in-one component. Renders the full auth UI based on your config — card, buttons, dividers, and banner.

```tsx
import { SociAuthProvider, SociAuthComponent } from 'react-soci-auth';

<SociAuthProvider config={config}>
  <SociAuthComponent />
</SociAuthProvider>
```

### SocialButton

A standalone social login button. Use it outside of `SociAuthProvider` for custom layouts.

```tsx
import { SocialButton } from 'react-soci-auth';

<SocialButton
  provider="google"
  label="Continue with Google"
  variant="icon-plus-text"
  onClick={() => console.log('clicked')}
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `provider` | `ProviderName` | *required* | `'google'` \| `'apple'` \| `'facebook'` \| `'github'` |
| `label` | `string` | — | Button text |
| `icon` | `React.ReactNode` | — | Custom icon element |
| `variant` | `ButtonVariant` | `'icon-plus-text'` | `'text-only'` \| `'icon-plus-text'` \| `'icon-only'` |
| `theme` | `Partial<ThemeConfig>` | — | Theme overrides |
| `layout` | `Partial<LayoutConfig>` | — | Layout overrides |
| `enable3DDepth` | `boolean` | `false` | 3D tilt on hover |
| `enableHoverFill` | `boolean` | `false` | Animated color fill on hover |
| `hoverFillColor` | `string` | `'#6366f1'` | Hover fill color |
| `contentAlignment` | `Alignment` | `'center'` | Content alignment within button |
| `onClick` | `() => void` | — | Click handler |
| `disabled` | `boolean` | `false` | Disable the button |
| `className` | `string` | — | Additional CSS class |
| `style` | `React.CSSProperties` | — | Inline styles |

### AuthCard

The glassmorphism card container used by `SociAuthComponent`. Can be used independently.

```tsx
import { AuthCard } from 'react-soci-auth';

<AuthCard title="Sign In" subtitle="Choose a provider">
  {/* your content */}
</AuthCard>
```

### Divider

A styled divider with optional text label.

```tsx
import { Divider } from 'react-soci-auth';

<Divider label="or" />
```

### Banner

A notification banner for displaying success or error messages.

```tsx
import { Banner } from 'react-soci-auth';

<Banner type="success" message="Successfully authenticated!" />
<Banner type="error" message="Authentication failed. Please try again." />
```

## Hooks

### useSociAuth

Access the auth context from any component inside `<SociAuthProvider>`.

```tsx
import { useSociAuth } from 'react-soci-auth';

function MyComponent() {
  const { config, theme, providers, triggerOAuth } = useSociAuth();

  return (
    <div>
      <p>Current theme mode: {theme.mode}</p>
      <button onClick={() => triggerOAuth('google')}>
        Sign in with Google
      </button>
      {providers.google?.loading && <p>Authenticating...</p>}
    </div>
  );
}
```

| Return Value | Type | Description |
|---|---|---|
| `config` | `ResolvedSociAuthConfig` | The fully resolved configuration |
| `theme` | `ThemeConfig` | The resolved theme object |
| `providers` | `Record<ProviderName, ProviderState>` | State for each configured provider |
| `triggerOAuth` | `(provider: ProviderName) => void` | Programmatically trigger the OAuth flow |

## OAuth Flow

react-soci-auth uses a **popup-based OAuth flow**:

1. User clicks a social button
2. A popup window opens and navigates to the provider's authorization URL
3. User authenticates with the provider
4. Provider redirects back to your `redirectUri` with an authorization code
5. The popup communicates the result back to the parent window via `postMessage`
6. Your `onSuccess` / `onError` callbacks fire

### Setting Up callback.html

Create a `callback.html` file in your `public/` directory. This page runs inside the popup and relays the OAuth response back to your app:

```html
<!DOCTYPE html>
<html>
<head><title>OAuth Callback</title></head>
<body>
  <script>
    // Grab the query params from the redirect
    const params = new URLSearchParams(window.location.search);
    const data = Object.fromEntries(params.entries());

    // Send them back to the parent window
    if (window.opener) {
      window.opener.postMessage(
        { type: 'soci-auth-callback', payload: data },
        window.location.origin
      );
    }
    window.close();
  </script>
</body>
</html>
```

Register the full URL (e.g. `https://yourapp.com/callback.html`) as an authorized redirect URI in each provider's OAuth console.

### Handling Responses

The `ProviderResponse` object passed to `onSuccess`:

```ts
interface ProviderResponse {
  provider: ProviderName;  // Which provider completed auth
  code?: string;           // The authorization code
  state?: string;          // The state parameter (CSRF protection)
  rawParams: Record<string, string>; // All query params from the redirect
}
```

The `OAuthError` object passed to `onError`:

```ts
interface OAuthError {
  provider: ProviderName;
  errorType: string;
  message: string;
}
```

> **Important:** The authorization `code` should be exchanged for tokens on your backend server. Never expose client secrets in frontend code.

## Theming

### Custom Colors

```tsx
const config: SociAuth_Config = {
  providers: [/* ... */],
  theme: {
    mode: 'dark',
    colors: {
      primary: '#8b5cf6',
      background: 'rgba(0, 0, 0, 0.6)',
      surface: 'rgba(139, 92, 246, 0.1)',
      text: '#f8fafc',
      textSecondary: 'rgba(248, 250, 252, 0.6)',
      border: 'rgba(139, 92, 246, 0.3)',
    },
  },
};
```

### Glassmorphism

Customize the glass effect on cards and buttons:

```tsx
const config: SociAuth_Config = {
  providers: [/* ... */],
  theme: {
    glass: {
      blur: '20px',
      opacity: 0.2,
      gradient: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
  },
};
```

### Button Shapes & Sizes

```tsx
const config: SociAuth_Config = {
  providers: [/* ... */],
  theme: {
    button: {
      shape: 'pill',       // 'pill' | 'rounded' | 'square'
      size: 'large',       // 'small' | 'medium' | 'large'
      iconPosition: 'left', // 'left' | 'right' | 'top'
    },
  },
};
```

### Dark Mode

Set `theme.mode` to `'dark'` for a dark color scheme. The default color palette adapts automatically.

```tsx
const config: SociAuth_Config = {
  providers: [/* ... */],
  theme: { mode: 'dark' },
};
```


## Examples

### Basic Setup — Google + GitHub

```tsx
import { SociAuthProvider, SociAuthComponent } from 'react-soci-auth';
import type { SociAuth_Config } from 'react-soci-auth';

const config: SociAuth_Config = {
  providers: [
    {
      name: 'google',
      clientId: 'YOUR_GOOGLE_CLIENT_ID',
      redirectUri: window.location.origin + '/callback.html',
    },
    {
      name: 'github',
      clientId: 'YOUR_GITHUB_CLIENT_ID',
      redirectUri: window.location.origin + '/callback.html',
    },
  ],
  cardTitle: 'Sign In',
  cardSubtitle: 'Choose your account',
};

function LoginPage() {
  return (
    <SociAuthProvider config={config}>
      <SociAuthComponent />
    </SociAuthProvider>
  );
}
```

### Dark Mode with Custom Colors

```tsx
const config: SociAuth_Config = {
  providers: [
    { name: 'google', clientId: '...', redirectUri: '/callback.html' },
    { name: 'apple', clientId: '...', redirectUri: '/callback.html' },
    { name: 'facebook', clientId: '...', redirectUri: '/callback.html' },
    { name: 'github', clientId: '...', redirectUri: '/callback.html' },
  ],
  theme: {
    mode: 'dark',
    colors: {
      primary: '#ec4899',
      background: 'rgba(15, 15, 25, 0.8)',
      text: '#fdf2f8',
      border: 'rgba(236, 72, 153, 0.25)',
    },
    glass: {
      blur: '16px',
      opacity: 0.12,
    },
  },
  enable3DDepth: true,
  cardTitle: 'Welcome',
  cardSubtitle: 'Pick a provider to get started',
};
```

### Horizontal Layout with Icon-Only Buttons

```tsx
const config: SociAuth_Config = {
  providers: [
    { name: 'google', clientId: '...', redirectUri: '/callback.html' },
    { name: 'apple', clientId: '...', redirectUri: '/callback.html' },
    { name: 'facebook', clientId: '...', redirectUri: '/callback.html' },
    { name: 'github', clientId: '...', redirectUri: '/callback.html' },
  ],
  buttonVariant: 'icon-only',
  layout: {
    direction: 'horizontal',
    alignment: 'center',
    spacing: '16px',
  },
  theme: {
    button: {
      shape: 'pill',
      size: 'large',
    },
  },
};
```

### Custom Hover Fill Effect

```tsx
const config: SociAuth_Config = {
  providers: [
    { name: 'google', clientId: '...', redirectUri: '/callback.html' },
    { name: 'github', clientId: '...', redirectUri: '/callback.html' },
  ],
  enableHoverFill: true,
  hoverFillColor: '#8b5cf6',
  theme: {
    button: { shape: 'rounded', size: 'large' },
    motion: { duration: '300ms' },
  },
};
```

### Handling OAuth Responses

```tsx
import type { SociAuth_Config, ProviderResponse, OAuthError } from 'react-soci-auth';

function handleSuccess(response: ProviderResponse) {
  // Send the authorization code to your backend
  fetch('/api/auth/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: response.provider,
      code: response.code,
      state: response.state,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      // Store tokens, redirect, etc.
      console.log('Authenticated:', data);
    });
}

function handleError(error: OAuthError) {
  console.error(`[${error.provider}] ${error.errorType}: ${error.message}`);
}

const config: SociAuth_Config = {
  providers: [
    {
      name: 'google',
      clientId: 'YOUR_GOOGLE_CLIENT_ID',
      redirectUri: window.location.origin + '/callback.html',
      scopes: ['openid', 'email', 'profile'],
      onSuccess: handleSuccess,
      onError: handleError,
    },
    {
      name: 'github',
      clientId: 'YOUR_GITHUB_CLIENT_ID',
      redirectUri: window.location.origin + '/callback.html',
      scopes: ['read:user', 'user:email'],
      onSuccess: handleSuccess,
      onError: handleError,
    },
  ],
};
```

### Using Standalone SocialButton

Use `SocialButton` outside of the provider for fully custom layouts:

```tsx
import { SocialButton } from 'react-soci-auth';

function CustomLoginForm() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2>Sign in</h2>

      <SocialButton
        provider="google"
        label="Continue with Google"
        variant="icon-plus-text"
        enable3DDepth
        theme={{ button: { shape: 'pill', size: 'large' } }}
        onClick={() => console.log('Google clicked')}
      />

      <SocialButton
        provider="github"
        label="Continue with GitHub"
        variant="icon-plus-text"
        enableHoverFill
        hoverFillColor="#333"
        onClick={() => console.log('GitHub clicked')}
      />

      <SocialButton
        provider="apple"
        variant="icon-only"
        theme={{ button: { shape: 'pill' } }}
        onClick={() => console.log('Apple clicked')}
      />
    </div>
  );
}
```

## TypeScript

react-soci-auth is written in TypeScript and ships with full type definitions. All config objects, props, and return types are exported.

### Key Exported Types

```ts
import type {
  SociAuth_Config,
  ProviderConfig,
  ThemeConfig,
  LayoutConfig,
  BehaviorConfig,
  ProviderResponse,
  OAuthError,
  ProviderName,
  ButtonVariant,
  ButtonShape,
  ButtonSize,
  IconPosition,
  ThemeMode,
  Alignment,
  ResolvedSociAuthConfig,
  ResolvedProviderConfig,
  ProviderState,
  SocialButtonProps,
  SociAuthComponentProps,
  AuthCardProps,
  DividerProps,
  BannerProps,
  SociAuthContextValue,
} from 'react-soci-auth';
```

## Browser Support

| Browser | Version |
|---|---|
| Chrome | 80+ |
| Firefox | 78+ |
| Safari | 14+ |
| Edge | 80+ |

> Popup-based OAuth requires that popups are not blocked by the browser. Users may need to allow popups for your domain.

## License

[MIT](https://github.com/s4spublic/react-soci-auth/blob/main/LICENSE) © react-soci-auth contributors
