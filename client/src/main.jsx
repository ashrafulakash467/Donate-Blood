import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@gravity-ui/uikit'
import { Toast } from '@heroui/react'
import { BrowserRouter } from 'react-router-dom'
import '@gravity-ui/uikit/styles/fonts.css'
import '@gravity-ui/uikit/styles/styles.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme="light">
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toast.Provider placement="top end" />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
