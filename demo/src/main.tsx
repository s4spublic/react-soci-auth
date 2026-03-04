import React from 'react';
import { createRoot } from 'react-dom/client';
import { DemoApp } from './DemoApp';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <DemoApp />
  </React.StrictMode>
);
