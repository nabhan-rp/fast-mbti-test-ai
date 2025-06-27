
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { HashRouter } from 'react-router-dom';

// Simple check for API_KEY (in a real app, this would be handled more robustly)
if (!process.env.API_KEY) {
  console.warn(
    "Gemini API Key (process.env.API_KEY) is not set. The application's AI features will not work. " +
    "Please ensure the API_KEY environment variable is configured. " +
    "For local development, you might need to set it up in your .env file or development server configuration. " +
    "Refer to the project documentation for more details."
  );
  // Optionally, render a message to the user in the UI
  // For now, we'll let the app load but AI calls will fail.
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
