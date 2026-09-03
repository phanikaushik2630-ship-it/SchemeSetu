import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './phase2.css'
import './phase3.css'
import './civic-theme.css'
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
