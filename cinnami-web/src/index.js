import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { LoaderProvider } from './context/LoaderContext';
import { BrowserRouter as Router } from 'react-router-dom'; // Agrega esto

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LoaderProvider>
      <Router>       {/* <--- AQUÍ SOLO UNO */}
        <App />
      </Router>
    </LoaderProvider>
  </React.StrictMode>
);

reportWebVitals();
