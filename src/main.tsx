import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/sidepanel.css';
import { SidePanelLayout } from './layout/SidePanelLayout';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SidePanelLayout>
      <App />
    </SidePanelLayout>
  </StrictMode>,
);
