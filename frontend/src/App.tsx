import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { App as AntdApp } from 'antd'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import CustomerDashboard from './pages/CustomerDashboard.tsx'
import MerchantDashboard from './pages/MerchantDashboard.tsx'
import { useAuthStore } from './store/authStore'

function AppRoutes() {
    const { isAuthenticated, user } = useAuthStore()

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
                path="/dashboard" 
                element={
                    isAuthenticated ? (
                        user?.userType === 'customer' ? <CustomerDashboard /> : <MerchantDashboard />
                    ) : <Navigate to="/login" replace />
                } 
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AntdApp>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </AntdApp>
        </QueryClientProvider>
    )
}