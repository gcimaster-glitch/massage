import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';

// Global error handler
window.addEventListener('error', (event) => {
  console.error('❌ Global error:', event.error);
  // Display error to user
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: sans-serif;">
      <h1 style="color: #dc2626;">エラーが発生しました</h1>
      <p style="color: #666; margin: 20px 0;">${event.error?.message || 'アプリケーションの起動に失敗しました'}</p>
      <p style="color: #999; font-size: 14px;">ページをリロードしてください</p>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #14b8a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
        リロード
      </button>
    </div>
  `;
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason);
});

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('✅ React app initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize React app:', error);
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: sans-serif;">
      <h1 style="color: #dc2626;">初期化エラー</h1>
      <p style="color: #666; margin: 20px 0;">${error instanceof Error ? error.message : 'アプリケーションの起動に失敗しました'}</p>
      <p style="color: #999; font-size: 14px;">ページをリロードしてください</p>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #14b8a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
        リロード
      </button>
    </div>
  `;
}