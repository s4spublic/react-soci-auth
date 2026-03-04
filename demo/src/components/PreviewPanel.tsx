import React from 'react';
import { SociAuthComponent } from 'react-soci-auth';

export interface PreviewPanelProps {
  title?: string;
  subtitle?: string;
}

const previewContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  padding: '32px',
  borderRadius: '16px',
  background:
    'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  position: 'relative',
  overflow: 'hidden',
};

const previewLabelStyle: React.CSSProperties = {
  position: 'absolute',
  top: '12px',
  left: '16px',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'rgba(255, 255, 255, 0.6)',
};

export const PreviewPanel: React.FC<PreviewPanelProps> = () => {
  return (
    <div style={previewContainerStyle}>
      <span style={previewLabelStyle}>Preview</span>
      <SociAuthComponent />
    </div>
  );
};

export default PreviewPanel;
