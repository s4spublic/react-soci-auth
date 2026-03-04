import type { SociAuth_Config } from 'react-soci-auth';

/**
 * Generates a formatted JSX code snippet showing how to use the library
 * with the given configuration. The output includes SociAuthProvider and
 * SociAuthComponent usage with the config object inline.
 */
export function generateCodeSnippet(config: SociAuth_Config): string {
  const indent = '  ';
  const lines: string[] = [];

  lines.push("import {");
  lines.push(`${indent}SociAuthProvider,`);
  lines.push(`${indent}SociAuthComponent,`);
  lines.push("} from 'react-soci-auth';");
  lines.push("");
  lines.push("const config = {");

  // ─── Providers ─────────────────────────────────────────────────
  lines.push(`${indent}providers: [`);
  for (const provider of config.providers) {
    lines.push(`${indent}${indent}{`);
    lines.push(`${indent}${indent}${indent}name: '${provider.name}',`);
    lines.push(`${indent}${indent}${indent}clientId: 'YOUR_${provider.name.toUpperCase()}_CLIENT_ID',`);
    lines.push(`${indent}${indent}${indent}redirectUri: 'https://your-app.com/callback',`);
    if (provider.scopes && provider.scopes.length > 0) {
      lines.push(`${indent}${indent}${indent}scopes: [${provider.scopes.map((s: string) => `'${s}'`).join(', ')}],`);
    }
    lines.push(`${indent}${indent}},`);
  }
  lines.push(`${indent}],`);

  // ─── Button Variant ────────────────────────────────────────────
  if (config.buttonVariant) {
    lines.push(`${indent}buttonVariant: '${config.buttonVariant}',`);
  }

  // ─── Theme ─────────────────────────────────────────────────────
  if (config.theme) {
    lines.push(`${indent}theme: {`);
    if (config.theme.mode) {
      lines.push(`${indent}${indent}mode: '${config.theme.mode}',`);
    }
    if (config.theme.glass) {
      lines.push(`${indent}${indent}glass: {`);
      if (config.theme.glass.blur !== undefined) {
        lines.push(`${indent}${indent}${indent}blur: '${config.theme.glass.blur}',`);
      }
      if (config.theme.glass.opacity !== undefined) {
        lines.push(`${indent}${indent}${indent}opacity: ${config.theme.glass.opacity},`);
      }
      lines.push(`${indent}${indent}},`);
    }
    if (config.theme.button) {
      lines.push(`${indent}${indent}button: {`);
      if (config.theme.button.shape) {
        lines.push(`${indent}${indent}${indent}shape: '${config.theme.button.shape}',`);
      }
      if (config.theme.button.iconPosition) {
        lines.push(`${indent}${indent}${indent}iconPosition: '${config.theme.button.iconPosition}',`);
      }
      if (config.theme.button.size) {
        lines.push(`${indent}${indent}${indent}size: '${config.theme.button.size}',`);
      }
      lines.push(`${indent}${indent}},`);
    }
    lines.push(`${indent}},`);
  }

  // ─── Layout ────────────────────────────────────────────────────
  if (config.layout) {
    lines.push(`${indent}layout: {`);
    if (config.layout.alignment) {
      lines.push(`${indent}${indent}alignment: '${config.layout.alignment}',`);
    }
    if (config.layout.spacing !== undefined) {
      lines.push(`${indent}${indent}spacing: '${config.layout.spacing}',`);
    }
    if (config.layout.showLabels !== undefined) {
      lines.push(`${indent}${indent}showLabels: ${config.layout.showLabels},`);
    }
    if (config.layout.showDividers !== undefined) {
      lines.push(`${indent}${indent}showDividers: ${config.layout.showDividers},`);
    }
    lines.push(`${indent}},`);
  }

  lines.push("};");
  lines.push("");
  lines.push("function App() {");
  lines.push(`${indent}return (`);
  lines.push(`${indent}${indent}<SociAuthProvider config={config}>`);
  lines.push(`${indent}${indent}${indent}<SociAuthComponent />`);
  lines.push(`${indent}${indent}</SociAuthProvider>`);
  lines.push(`${indent});`);
  lines.push("}");

  return lines.join('\n');
}
