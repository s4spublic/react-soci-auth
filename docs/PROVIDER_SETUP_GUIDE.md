# OAuth Provider Setup Guide

This guide walks through setting up OAuth credentials for each provider supported by `react-soci-auth`. You'll need a `clientId` and `redirectUri` for each provider you want to enable.

---

## Quick Reference

| Provider | Developer Console | clientId Field | HTTPS Required? | Redirect URI Notes |
|----------|------------------|----------------|-----------------|-------------------|
| Google | [console.cloud.google.com](https://console.cloud.google.com/) | Client ID | No (localhost exempt) | Must be registered in console |
| Apple | [developer.apple.com](https://developer.apple.com/) | Services ID | Yes (always) | No localhost — use ngrok or similar |
| Facebook | [developers.facebook.com](https://developers.facebook.com/) | App ID | No (localhost exempt) | Must be registered in Login settings |
| GitHub | [github.com/settings/developers](https://github.com/settings/developers) | Client ID | No | Single callback URL per OAuth App |

---

## Google

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one from the project dropdown.
3. Navigate to **APIs & Services → OAuth consent screen**.
4. Configure the consent screen:
   - Choose **External** user type (unless you're restricting to a Google Workspace org).
   - Fill in the required app name, user support email, and developer contact email.
   - Add scopes: `openid`, `email`, `profile`.
   - Save and continue through the remaining steps.
5. Go to **APIs & Services → Credentials**.
6. Click **Create Credentials → OAuth client ID**.
7. Select **Web application** as the application type.
8. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173/callback` (for local development)
   - Your production callback URL when ready.
9. Click **Create** and copy the **Client ID**.

**Recommended scopes:** `openid`, `email`, `profile`

---

## Apple

> Apple requires an active [Apple Developer Program](https://developer.apple.com/programs/) membership ($99/year).

1. Go to the [Apple Developer Portal](https://developer.apple.com/) and sign in.
2. Navigate to **Certificates, Identifiers & Profiles → Identifiers**.
3. Register an **App ID** (if you don't have one):
   - Select **App IDs** and click the **+** button.
   - Choose **App** as the type.
   - Enter a description and Bundle ID.
   - Under **Capabilities**, enable **Sign in with Apple**.
   - Click **Continue** and **Register**.
4. Create a **Services ID** (this becomes your `clientId`):
   - Go back to **Identifiers** and click **+**.
   - Select **Services IDs** as the type.
   - Enter a description and an identifier (e.g., `com.yourapp.auth`).
   - Click **Continue** and **Register**.
5. Click on the newly created Services ID to configure it:
   - Enable **Sign in with Apple**.
   - Click **Configure**.
   - Set the **Primary App ID** to the App ID from step 3.
   - Add your **Domains** (e.g., `localhost` won't work — see note below).
   - Add your **Return URLs** (redirect URI).
   - Click **Save**, then **Continue**, then **Save** again.
6. Copy the **Services ID identifier** — this is your `clientId`.

**Important:** Apple does not allow `http://localhost` as a redirect URI. For local development, use a tunneling service like [ngrok](https://ngrok.com/) to get an HTTPS URL, and register that as your redirect URI.

**Recommended scopes:** `name`, `email`

---

## Facebook

1. Go to [Meta for Developers](https://developers.facebook.com/) and log in.
2. Click **My Apps → Create App**.
3. Select **Consumer** as the app type, then click **Next**.
4. Fill in the app name and contact email, then click **Create App**.
5. On the app dashboard, find **Facebook Login** and click **Set Up**.
6. Choose **Web** as the platform.
7. In the left sidebar, go to **Facebook Login → Settings**.
8. Under **Valid OAuth Redirect URIs**, add:
   - `http://localhost:5173/callback` (for local development)
   - Your production callback URL when ready.
9. Click **Save Changes**.
10. Go to **Settings → Basic** in the left sidebar.
11. Copy the **App ID** — this is your `clientId`.

**Recommended scopes:** `email`, `public_profile`

---

## GitHub

1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. Fill in the registration form:
   - **Application name**: Your app name.
   - **Homepage URL**: `http://localhost:5173` (for development).
   - **Authorization callback URL**: `http://localhost:5173/callback`.
4. Click **Register application**.
5. Copy the **Client ID** from the app page.

> GitHub OAuth Apps only support a single callback URL. If you need different URLs for dev and production, create separate OAuth Apps for each environment.

**Recommended scopes:** `read:user`, `user:email`

---

## Example Configuration

Here's a full config with all 4 providers:

```ts
import { SociAuth_Config } from 'react-soci-auth';

const config: SociAuth_Config = {
  providers: [
    {
      name: 'google',
      clientId: 'YOUR_GOOGLE_CLIENT_ID',
      redirectUri: 'http://localhost:5173/callback',
      scopes: ['openid', 'email', 'profile'],
    },
    {
      name: 'apple',
      clientId: 'YOUR_APPLE_SERVICES_ID',
      redirectUri: 'https://your-tunnel.ngrok.io/callback',
      scopes: ['name', 'email'],
    },
    {
      name: 'facebook',
      clientId: 'YOUR_FACEBOOK_APP_ID',
      redirectUri: 'http://localhost:5173/callback',
      scopes: ['email', 'public_profile'],
    },
    {
      name: 'github',
      clientId: 'YOUR_GITHUB_CLIENT_ID',
      redirectUri: 'http://localhost:5173/callback',
      scopes: ['read:user', 'user:email'],
    },
  ],
};
```

---

## Updating the Demo App

The demo app ships with placeholder credentials in `demo/src/hooks/useDemoState.ts`:

```ts
clientId: 'demo-client-id',
redirectUri: 'https://demo.example.com/callback',
```

To test with real OAuth flows, replace these with your actual credentials.

### Option 1: Edit directly

Open `demo/src/hooks/useDemoState.ts` and replace the placeholder values for each provider with your real `clientId` and `redirectUri`.

### Option 2: Use environment variables

1. Create a `.env` file in the `demo/` directory:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APPLE_CLIENT_ID=your-apple-services-id
VITE_FACEBOOK_CLIENT_ID=your-facebook-app-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_REDIRECT_URI=http://localhost:5173/callback
```

2. Reference them in your config:

```ts
{
  name: 'google',
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  redirectUri: import.meta.env.VITE_REDIRECT_URI,
  scopes: ['openid', 'email', 'profile'],
}
```

3. Add `.env` to `.gitignore` so credentials aren't committed.

---

## Localhost and HTTPS Notes

- **Google**: Allows `http://localhost` redirect URIs for development. No HTTPS required locally.
- **Apple**: Requires HTTPS for all redirect URIs, including development. Use a tunnel like [ngrok](https://ngrok.com/) (`ngrok http 5173`) to get an HTTPS URL.
- **Facebook**: Allows `http://localhost` redirect URIs for development. Enforces HTTPS in production.
- **GitHub**: Allows `http://localhost` redirect URIs. No special requirements for development.

For production, all providers expect HTTPS redirect URIs.
