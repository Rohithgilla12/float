import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LandingPage } from './components/LandingPage';
import './index.css';

const Root: React.FC = () => {
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  const [fullscreenApp, setFullscreenApp] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('app') === 'true') {
      setFullscreenApp(true);
    }
  }, []);

  // Inside Tauri Desktop Window, ALWAYS render the native floating App
  if (isTauri) {
    return <App />;
  }

  // On Web (floatnotes.gilla.fun): either Fullscreen Web App or Landing Page with embedded live demo
  if (fullscreenApp) {
    return (
      <div className="relative w-screen h-screen bg-[#0C0D0E]">
        <button
          onClick={() => setFullscreenApp(false)}
          className="fixed top-3 right-3 z-50 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white/80 hover:text-white border border-white/20 text-xs font-mono backdrop-blur-md transition-all shadow-2xl flex items-center gap-1.5 cursor-pointer"
        >
          <span>&larr;</span>
          <span>Landing Page</span>
        </button>
        <App />
      </div>
    );
  }

  return <LandingPage onOpenAppFullscreen={() => setFullscreenApp(true)} />;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
