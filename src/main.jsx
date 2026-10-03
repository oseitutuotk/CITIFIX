import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DesktopFrame from './components/DesktopFrame.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DesktopFrame>
      <App />
    </DesktopFrame>
  </StrictMode>,
)
