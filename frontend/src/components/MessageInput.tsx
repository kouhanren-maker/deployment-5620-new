import { SendOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { InputContainer, StyledTextArea, SendButton } from '../styles/ChatStyles'

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export const MessageInput = ({ onSend, disabled = false, placeholder = "Ask me anything! Try: 'Recommend some trendy clothes' or 'Compare prices for sneakers'..." }: MessageInputProps) => {
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return
    onSend(inputValue.trim())
    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <InputContainer>
      <StyledTextArea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
      />
      <SendButton
        $disabled={!inputValue.trim() || disabled}
        onClick={handleSend}
        disabled={!inputValue.trim() || disabled}
      >
        <SendOutlined style={{ color: 'white' }} />
      </SendButton>
    </InputContainer>
  )
}
