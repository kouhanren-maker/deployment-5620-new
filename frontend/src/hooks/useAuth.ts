import { useMutation } from '@tanstack/react-query'
import { http, setToken } from '../api/http'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { useMerchantChatStore } from '../store/merchantChatStore'

export const useAuth = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore()
  const { clearMessages: clearCustomerMessages } = useChatStore()
  const { clearMessages: clearMerchantMessages, resetState: resetMerchantState } = useMerchantChatStore()

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await http.post('/login/', {
        email: credentials.email,
        password: credentials.password,
      })
      return response.data
    },
    onSuccess: (data) => {
      const role: string = String(data?.user?.role || '').toLowerCase()
      const mappedUser = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username ?? (data.user.email?.split?.('@')?.[0] ?? ''),
        userType: (role === 'merchant' ? 'merchant' : 'customer') as 'merchant' | 'customer',
      }
      
      // Clear chat history before login to ensure fresh start
      if (mappedUser.userType === 'merchant') {
        clearMerchantMessages()
        resetMerchantState()
      } else {
        clearCustomerMessages()
      }
      
      setToken(data.token)
      login(mappedUser, data.token)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // POST /api/logout/ - requires Bearer token (added automatically by interceptor)
      const response = await http.post('/logout/')
      return response.data
    },
    onSuccess: () => {
      // Clear all chat histories on logout
      clearCustomerMessages()
      clearMerchantMessages()
      resetMerchantState()
      
      setToken(null)
      logout()
    },
    onError: () => {
      // Even if backend logout fails, clear local state
      // This ensures user can still log out even if backend is unreachable
      clearCustomerMessages()
      clearMerchantMessages()
      resetMerchantState()
      
      setToken(null)
      logout()
    },
  })

  return {
    user,
    isAuthenticated,
    isLoading: false,
    error: undefined,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
