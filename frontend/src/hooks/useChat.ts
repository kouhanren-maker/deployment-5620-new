import { useMutation } from '@tanstack/react-query'
import { http } from '../api/http'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'

export const useChat = () => {
  const { messages, isLoading, addMessage, setLoading, clearMessages } = useChatStore()
  const { user } = useAuthStore()

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const userId = user?.id
      if (!userId) {
        throw new Error('User ID not found. Please log in again.')
      }
      // POST /customer/{user_id}/ - token will be added automatically by interceptor
      const response = await http.post(`/customer/${userId}/`, {
        question: message,
      }, {
        baseURL: ''  // Override baseURL for this request (token still added by interceptor)
      })
      return response.data
    },
    onMutate: async (message: string) => {
      const userMessage = {
        id: Date.now().toString(),
        type: 'user' as const,
        content: message,
        timestamp: new Date()
      }
      addMessage(userMessage)
      setLoading(true)
    },
    onSuccess: (data) => {
      // Backend returns { data: { product: [...], answer }, response: {...} }
      const answer = data?.data?.answer || data?.answer || ''
      const products = data?.data?.product || data?.products || []
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: answer || 'Here are the results I found.',
        timestamp: new Date(),
        data: {
          products: products.map((p: any) => ({
            id: p.id,
            name: p.name,
            source: p.source,
            price: p.price || null
          })),
          raw: data,
        }
      }
      addMessage(aiMessage)
    },
    onError: (error: any) => {
      // eslint-disable-next-line no-console
      console.error('Chat error:', error)
      
      let errorMessage = 'Sorry, there was an error processing your request.'
      
      if (error?.response) {
        const responseData = error.response.data
        
        if (typeof responseData === 'object' && responseData !== null) {
          errorMessage = responseData.detail || responseData.message || responseData.error || errorMessage
        } 
        else if (typeof responseData === 'string' && responseData.includes('<!DOCTYPE html>')) {
          errorMessage = `Server error (${error.response.status}). Please check the backend server logs for details.`
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: `❌ ${errorMessage}`,
        timestamp: new Date(),
      }
      addMessage(errorMsg)
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  const sendMessage = (message: string) => {
    if (!message.trim() || isLoading) return
    sendMessageMutation.mutate(message.trim())
  }

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    isSending: sendMessageMutation.isPending,
  }
}


