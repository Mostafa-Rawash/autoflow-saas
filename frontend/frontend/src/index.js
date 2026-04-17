import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import errorCatcher from './utils/errorCatcher';

// Initialize error catching
errorCatcher.init();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);