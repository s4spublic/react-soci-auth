# react-soci-auth

A premium, glassmorphism-styled social authentication UI library for React.

## Features

- Google, Apple, Facebook, GitHub OAuth buttons
- Glassmorphism design with customizable themes
- Multiple button variants: icon-only, text-only, icon+text
- Layout controls: horizontal/vertical, alignment, spacing
- Effects: 3D depth, hover fill animation with custom colors
- Dark mode support
- Fully typed with TypeScript

## Install

```bash
npm install react-soci-auth
```

## Quick Start

```tsx
import { SociAuthProvider, SociAuthComponent } from 'react-soci-auth';

const config = {
  providers: [
    { name: 'google', clientId: 'your-google-client-id', redirectUri: '/callback' },
    { name: 'github', clientId: 'your-github-client-id', redirectUri: '/callback' },
  ],
  theme: { mode: 'light' },
  layout: { direction: 'vertical', alignment: 'center' },
};

function App() {
  return (
    <SociAuthProvider config={config}>
      <SociAuthComponent />
    </SociAuthProvider>
  );
}
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `providers` | `ProviderConfig[]` | `[]` | OAuth provider configurations |
| `theme` | `Partial<ThemeConfig>` | light mode | Theme customization |
| `layout` | `Partial<LayoutConfig>` | vertical/center | Layout options |
| `buttonVariant` | `ButtonVariant` | `'icon-plus-text'` | Button display style |
| `enable3DDepth` | `boolean` | `false` | 3D hover effect |
| `enableHoverFill` | `boolean` | `false` | Color fill on hover |
| `hoverFillColor` | `string` | `'#6366f1'` | Hover fill color |
| `showCard` | `boolean` | `true` | Show card wrapper |
| `contentAlignment` | `Alignment` | `'center'` | Button content alignment |

## Standalone Button

```tsx
import { SocialButton } from 'react-soci-auth';

<SocialButton provider="google" label="Continue with Google" onClick={() => {}} />
```

## License

MIT
