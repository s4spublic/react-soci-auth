import React from 'react';
import { SociAuthProvider } from 'react-soci-auth';
import { useDemoState } from './hooks/useDemoState';
import { ControlPanel } from './components/ControlPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { ResponsePanel } from './components/ResponsePanel';
import { CodePanel } from './components/CodePanel';

const appContainerStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  background: '#f1f5f9',
  color: '#1e293b',
};

const controlsSidebarStyle: React.CSSProperties = {
  width: '300px',
  minWidth: '300px',
  background: '#ffffff',
  borderRight: '1px solid #e2e8f0',
  overflowY: 'auto',
};

const providerWrapperStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflowY: 'auto',
};

const mainContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '24px',
};

export const DemoApp: React.FC = () => {
  const { state, config, setters, resetToDefaults } = useDemoState();

  return (
    <div style={appContainerStyle}>
      <div style={controlsSidebarStyle}>
        <ControlPanel state={state} setters={setters} onReset={resetToDefaults} />
      </div>
      <div style={providerWrapperStyle}>
        <SociAuthProvider config={config}>
          <div style={mainContentStyle}>
            <PreviewPanel />
            <ResponsePanel />
            <CodePanel config={config} />
          </div>
        </SociAuthProvider>
      </div>
    </div>
  );
};

export default DemoApp;
