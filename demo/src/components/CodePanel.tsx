import React, { useState, useCallback, useMemo } from 'react';
import type { SociAuth_Config } from 'react-soci-auth';
import { generateCodeSnippet } from '../utils/codeGenerator';

export interface CodePanelProps {
  config: SociAuth_Config;
}

const containerStyle: React.CSSProperties = {
  position: 'relative',
  borderRadius: '12px',
  background: '#1e1e2e',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
};

const headerLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'rgba(255, 255, 255, 0.5)',
};

const codeBlockStyle: React.CSSProperties = {
  margin: 0,
  padding: '16px',
  overflowX: 'auto',
  fontSize: '13px',
  lineHeight: 1.6,
  fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
  color: '#cdd6f4',
  tabSize: 2,
};

const copyButtonBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 500,
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 150ms ease',
  background: 'rgba(255, 255, 255, 0.06)',
  color: 'rgba(255, 255, 255, 0.7)',
};

const copiedButtonStyle: React.CSSProperties = {
  ...copyButtonBase,
  background: 'rgba(34, 197, 94, 0.15)',
  borderColor: 'rgba(34, 197, 94, 0.4)',
  color: '#22c55e',
};

/**
 * Live code snippet panel that displays the corresponding JSX and
 * SociAuth_Config for the current configuration. Updates in real time
 * as any control changes. Includes a copy-to-clipboard button.
 */
export const CodePanel: React.FC<CodePanelProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  const codeSnippet = useMemo(() => generateCodeSnippet(config), [config]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text for manual copy
    }
  }, [codeSnippet]);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={headerLabelStyle}>Code</span>
        <button
          onClick={handleCopy}
          style={copied ? copiedButtonStyle : copyButtonBase}
          aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
        >
          {copied ? '✓ Copied!' : '⎘ Copy'}
        </button>
      </div>
      <pre style={codeBlockStyle}>
        <code>{codeSnippet}</code>
      </pre>
    </div>
  );
};

export default CodePanel;
