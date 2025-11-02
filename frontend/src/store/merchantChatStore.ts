import { create } from 'zustand'

export interface MerchantMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  data?: any
}

export type MerchantFunction = 'quarterly_report' | 'user_portrait' | null
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4' | null

interface MerchantChatState {
  messages: MerchantMessage[]
  isLoading: boolean
  currentFunction: MerchantFunction
  selectedQuarter: Quarter
  waitingForInput: boolean
  addMessage: (message: MerchantMessage) => void
  setLoading: (loading: boolean) => void
  setCurrentFunction: (func: MerchantFunction) => void
  setSelectedQuarter: (quarter: Quarter) => void
  setWaitingForInput: (waiting: boolean) => void
  clearMessages: () => void
  resetState: () => void
}

export const useMerchantChatStore = create<MerchantChatState>((set) => ({
  messages: [
    {
      id: '1',
      type: 'ai',
      content: 'Welcome to Merchant Dashboard! 🏪\n\nI can help you with:\n• Generate quarterly reports\n• Analyze user portraits\n\nWhat would you like to do today?',
      timestamp: new Date(),
      data: { showOptions: true }
    }
  ],
  isLoading: false,
  currentFunction: null,
  selectedQuarter: null,
  waitingForInput: false,
  
  addMessage: (message: MerchantMessage) => {
    set((state) => ({ 
      messages: [...state.messages, message] 
    }))
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
  
  setCurrentFunction: (func: MerchantFunction) => {
    set({ currentFunction: func })
  },
  
  setSelectedQuarter: (quarter: Quarter) => {
    set({ selectedQuarter: quarter })
  },
  
  setWaitingForInput: (waiting: boolean) => {
    set({ waitingForInput: waiting })
  },
  
  clearMessages: () => {
    set({ 
      messages: [{
        id: '1',
        type: 'ai',
        content: 'Welcome to Merchant Dashboard! 🏪\n\nI can help you with:\n• Generate quarterly reports\n• Analyze user portraits\n\nWhat would you like to do today?',
        timestamp: new Date(),
        data: { showOptions: true }
      }]
    })
  },
  
  resetState: () => {
    set({
      currentFunction: null,
      selectedQuarter: null,
      waitingForInput: false,
      isLoading: false
    })
  },
}))
