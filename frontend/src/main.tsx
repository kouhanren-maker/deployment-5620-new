import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#7fcdcd',
          colorSuccess: '#a8e6cf',
          colorWarning: '#ffd93d',
          colorError: '#ff6b6b',
          borderRadius: 12,
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)