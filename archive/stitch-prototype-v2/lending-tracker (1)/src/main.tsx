import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { getStoredSettings } from './lib/data';
import { applyThemeClass } from './lib/theme';
import './index.css';

applyThemeClass(getStoredSettings().theme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
