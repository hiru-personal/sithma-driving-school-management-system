import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
// Global Date Picker auto-open on click anywhere on date inputs
if (typeof window !== 'undefined') {
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.tagName === 'INPUT' && target.type === 'date') {
      try {
        target.showPicker();
      } catch (err) {
        // Fallback for older browsers
      }
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
