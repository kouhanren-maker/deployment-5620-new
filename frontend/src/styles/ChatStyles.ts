import styled from 'styled-components'

export const ChatContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
`

export const MessagesArea = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.05);
`

export const InputArea = styled.div`
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`

export const MessageContainer = styled.div<{ $isUser: boolean }>`
  display: flex;
  justify-content: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 16px;
  animation: fadeInUp 0.3s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

export const MessageContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 80%;
`

export const MessageCard = styled.div<{ $isUser: boolean }>`
  border-radius: 20px;
  background: ${props => props.$isUser 
    ? 'linear-gradient(45deg, #a8e6cf, #7fcdcd)' 
    : 'white'};
  color: ${props => props.$isUser ? 'white' : '#333'};
  border: none;
  box-shadow: ${props => props.$isUser 
    ? '0 4px 20px rgba(102, 126, 234, 0.3)'
    : '0 4px 20px rgba(0, 0, 0, 0.1)'};
  max-width: 100%;
  padding: 16px 20px;
`

export const MessageText = styled.div`
  white-space: pre-wrap;
  margin-bottom: 8px;
`

export const Timestamp = styled.div<{ $isUser: boolean }>`
  font-size: 12px;
  color: ${props => props.$isUser ? 'rgba(255, 255, 255, 0.7)' : '#999'};
  margin-top: 4px;
  display: block;
`

export const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`

export const StyledTextArea = styled.textarea`
  flex: 1;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  resize: none;
  padding: 12px 16px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  
  &:focus {
    outline: none;
    border-color: rgba(168, 230, 207, 0.6);
  }
  
  &::placeholder {
    color: #999;
  }
`

export const SendButton = styled.button<{ $disabled: boolean }>`
  height: 40px;
  width: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #a8e6cf, #7fcdcd);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.6 : 1};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`

