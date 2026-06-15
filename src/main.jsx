import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/variables.css';
import './styles/global.css';
import App from './App';

// avant ReactDOM.createRoot
if (!import.meta.env.VITE_API_BASE_URL) {
  document.body.innerHTML = '<div style="padding:2rem;font-family:sans-serif;color:red"><h1>Configuration manquante</h1><p>VITE_API_BASE_URL non définie. Vérifiez le fichier .env</p></div>';
  throw new Error('VITE_API_BASE_URL manquante');
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
