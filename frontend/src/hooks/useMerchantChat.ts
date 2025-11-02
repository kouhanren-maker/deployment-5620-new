import { useMutation } from '@tanstack/react-query'
import { http } from '../api/http'
import { useMerchantChatStore } from '../store/merchantChatStore'
import { useAuthStore } from '../store/authStore'
import type { MerchantMessage, MerchantFunction, Quarter } from '../store/merchantChatStore'

export const useMerchantChat = () => {
  const { 
    messages, 
    isLoading, 
    currentFunction, 
    selectedQuarter, 
    waitingForInput,
    addMessage, 
    setLoading, 
    setCurrentFunction, 
    setSelectedQuarter, 
    setWaitingForInput,
    resetState
  } = useMerchantChatStore()
  const { user } = useAuthStore()

  const generateQuarterlyReportMutation = useMutation({
    mutationFn: async (query: string) => {
      const userId = user?.id
      if (!userId) throw new Error('User not found')
      // POST /api/merchant/report/<user_id>/ - requires token (merchant_required)
      // Note: baseURL is already '/api', so we don't need to prefix with '/api' again
      const response = await http.post(`/merchant/report/${userId}/`, {
        query,
      })
      return response.data
    },
    onMutate: async (query: string) => {
      const userMessage: MerchantMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: query,
        timestamp: new Date()
      }
      addMessage(userMessage)
      setLoading(true)
    },
    onSuccess: (data) => {
      // Format the quarterly report from backend data
      // New format: { data: { quarter: "2024-Q3", products: [...] } }
      const quarter = data?.data?.quarter
      const products = data?.data?.products || []
      
      let reportContent = ''
      if (quarter) {
        reportContent = `📊 **Quarterly Report: ${quarter}**\n\n`
        reportContent += `Top ${products.length} Trending Products:\n\n`
        
        products.forEach((product: any) => {
          const rank = product.rank || ''
          reportContent += `${rank}. **${product.name}**\n`
          if (product.category) {
            reportContent += `   📂 Category: ${product.category}\n`
          }
          if (product.price !== undefined && product.price !== null) {
            reportContent += `   💰 Price: $${product.price.toFixed(2)}\n`
          }
          if (product.sales !== undefined && product.sales !== null) {
            reportContent += `   📊 Sales: ${product.sales.toLocaleString()}\n`
          }
          reportContent += '\n'
        })
      } else {
        reportContent = data?.data?.answer || 'Report generated successfully.'
      }
      
      const aiMessage: MerchantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: reportContent,
        timestamp: new Date(),
        data: data
      }
      addMessage(aiMessage)
      
      setTimeout(() => {
        const continueMessage: MerchantMessage = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: 'What would you like to do next?',
          timestamp: new Date(),
          data: { showOptions: true }
        }
        addMessage(continueMessage)
      }, 1000)
      
      resetState()
    },
    onError: (error: any) => {
      console.error('Quarterly report error:', error)
      const errorMessage: MerchantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, there was an error generating the quarterly report. Please try again.',
        timestamp: new Date()
      }
      addMessage(errorMessage)
      resetState()
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  const generateUserPortraitMutation = useMutation({
    mutationFn: async (question: string) => {
      const userId = user?.id
      if (!userId) throw new Error('User not found')
      // POST /merchant/<user_id>/user_portrait/ - token will be added automatically by interceptor
      // Use empty baseURL to call /merchant/ directly (without /api prefix)
      const response = await http.post(`/merchant/${userId}/user_portrait/`, {
        question,
      }, {
        baseURL: ''  // Override baseURL for this request (token still added by interceptor)
      })
      return response.data
    },
    onMutate: async (question: string) => {
      const userMessage: MerchantMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: question,
        timestamp: new Date()
      }
      addMessage(userMessage)
      setLoading(true)
    },
    onSuccess: (data) => {
      // Backend returns: { data: { product, category, gender, age_range, summary } }
      const profileData = data?.data || {}
      
      let portraitContent = ''
      
      // Check if we have profile data (backend returns flat structure)
      if (profileData.product || profileData.category || profileData.age_range) {
        portraitContent += `📋 **User Portrait**\n\n`
        
        if (profileData.product) {
          portraitContent += ` Product: ${profileData.product}\n`
        }
        if (profileData.category) {
          portraitContent += ` Category: ${profileData.category}\n`
        }
        if (profileData.gender) {
          portraitContent += ` Gender: ${profileData.gender}\n`
        }
        if (profileData.age_range) {
          portraitContent += ` Age Range: ${profileData.age_range}\n`
        }
        if (profileData.summary) {
          portraitContent += `\n Summary:\n${profileData.summary}\n`
        }
      } else {
        // Fallback if no data
        portraitContent = 'User portrait analysis completed.'
      }
      
      const aiMessage: MerchantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: portraitContent,
        timestamp: new Date(),
        data: data
      }
      addMessage(aiMessage)
      
      setTimeout(() => {
        const continueMessage: MerchantMessage = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: 'What would you like to do next?',
          timestamp: new Date(),
          data: { showOptions: true }
        }
        addMessage(continueMessage)
      }, 1000)
      
      resetState()
    },
    onError: (error: any) => {
      console.error('User portrait error:', error)
      const errorMessage: MerchantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, there was an error generating the user portrait. Please try again.',
        timestamp: new Date()
      }
      addMessage(errorMessage)
      resetState()
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  const handleFunctionSelect = (func: MerchantFunction) => {
    setCurrentFunction(func)
    
    if (func === 'quarterly_report') {
      const aiMessage: MerchantMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Please select which quarter you want to generate a report for:',
        timestamp: new Date(),
        data: { showQuarterOptions: true }
      }
      addMessage(aiMessage)
      setWaitingForInput(false)
    } else if (func === 'user_portrait') {
      const aiMessage: MerchantMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Build a target audience profile for...',
        timestamp: new Date()
      }
      addMessage(aiMessage)
      setWaitingForInput(true)
    }
  }

  const getQuarterEnd = (year: number, q: Quarter) => {
    if (q === 'Q1') return new Date(year, 2, 31, 23, 59, 59, 999) // Mar 31
    if (q === 'Q2') return new Date(year, 5, 30, 23, 59, 59, 999) // Jun 30
    if (q === 'Q3') return new Date(year, 8, 30, 23, 59, 59, 999) // Sep 30
    if (q === 'Q4') return new Date(year, 11, 31, 23, 59, 59, 999) // Dec 31
    return new Date()
  }

  const handleQuarterSelect = (quarter: Quarter) => {
    setSelectedQuarter(quarter)
    const year = new Date().getFullYear()
    const now = new Date()
    const quarterEnd = getQuarterEnd(year, quarter)

    // Frontend constraint: Only show current-year data; if the selected quarter isn't finished yet, show notice instead of calling backend
    if (now <= quarterEnd) {
      const infoMessage: MerchantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `The report for ${quarter} ${year} is not available yet because the quarter hasn't finished. Please select a completed quarter.`,
        timestamp: new Date()
      }
      addMessage(infoMessage)
      resetState()
      return
    }

    const query = `Show me top products for ${year} ${quarter}`
    generateQuarterlyReportMutation.mutate(query)
  }

  const handleUserInput = (input: string) => {
    if (currentFunction === 'user_portrait' && waitingForInput) {
      const question = input.trim()
      generateUserPortraitMutation.mutate(question)
    }
  }

  const showFunctionOptions = () => {
    const aiMessage: MerchantMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: 'What would you like to do next?',
      timestamp: new Date(),
      data: { showOptions: true }
    }
    addMessage(aiMessage)
  }

  return {
    messages,
    isLoading,
    currentFunction,
    selectedQuarter,
    waitingForInput,
    handleFunctionSelect,
    handleQuarterSelect,
    handleUserInput,
    showFunctionOptions,
    isGeneratingReport: generateQuarterlyReportMutation.isPending,
    isGeneratingPortrait: generateUserPortraitMutation.isPending,
  }
}

