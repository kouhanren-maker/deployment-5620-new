import { create } from 'zustand'
import type { Message } from '../types/chat'

interface ChatState {
  messages: Message[]
  isLoading: boolean
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
}

export type { Message }

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI Shopping Assistant 🤖\n\nI support two features:\n• Personalized product recommendations\n• Price comparisons\n\nTell me what you\'re looking for, and I\'ll help!',
      timestamp: new Date()
    }
  ],
  isLoading: false,
  
  addMessage: (message: Message) => {
    set((state) => ({ 
      messages: [...state.messages, message] 
    }))
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
  
  clearMessages: () => {
    set({ 
      messages: [{
        id: '1',
        type: 'ai',
        content: 'Hello! I\'m your AI Shopping Assistant 🤖\n\nI support two features:\n• Personalized product recommendations\n• Price comparisons\n\nTell me what you\'re looking for, and I\'ll help!',
        timestamp: new Date()
      }]
    })
  },
}))
