import React from 'react';
import { useSociAuth } from 'react-soci-auth';
import type { ProviderName } from 'react-soci-auth';

const containerStyle: React.CSSProperties = {
  borderRadius: '12px',
  background: '#1e1e2e',
  overflow: 'hidden',
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
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'rgba(255, 255, 255, 0.5)',
};

const contentStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '13px',
  lineHeight: 1.6,
  fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
  color: '#cdd6f4',
};

const emptyStyle: React.CSSProperties = {
  ...contentStyle,
  color: 'rgba(255, 255, 255, 0.3)',
  fontStyle: 'italic',
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const providerBlockStyle: React.CSSProperties = {
  marginBottom: '12px',
  padding: '12px',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};

const providerNameStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: '8px',
};

const statusColors: Record<string, string> = {
  success: '#22c55e',
  error: '#ef4444',
  loading: '#f59e0b',
  idle: '#64748b',
};

export const ResponsePanel: React.FC = () => {
  const { providers } = useSociAuth();

  const ALL_PROVIDERS: ProviderName[] = ['google', 'apple', 'facebook', 'github'];
  
  const activeProviders = ALL_PROVIDERS.filter(
    (name) => providers[name]?.status !== 'idle'
  );

  const hasResponses = activeProviders.length > 0;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={headerLabelStyle}>OAuth Response</span>
        {hasResponses && (
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)' }}>
            {activeProviders.length} provider{activeProviders.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      {!hasResponses ? (
        <div style={emptyStyle}>
          Authenticate with a provider to see the response here
        </div>
      ) : (
        <div style={contentStyle}>
          {activeProviders.map((name) => {
            const state = providers[name];
            const statusColor = statusColors[state.status] || '#64748b';
            
            // Build a clean response object to display
            const displayData: Record<string, unknown> = {
              provider: name,
              status: state.status,
            };
            
            if (state.response) {
              displayData.response = {
                code: state.response.code ? `${state.response.code.substring(0, 20)}...` : undefined,
                state: state.response.state,
                rawParams: state.response.rawParams,
              };
            }
            
            if (state.error) {
              displayData.error = {
                errorType: state.error.errorType,
                message: state.error.message,
              };
            }

            return (
              <div key={name} style={providerBlockStyle}>
                <div style={{ ...providerNameStyle, color: statusColor }}>
                  {name} — {state.status}
                </div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '12px' }}>
                  {JSON.stringify(displayData, null, 2)}
                </pre>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResponsePanel;