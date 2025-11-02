import { useMerchantChat } from '../hooks/useMerchantChat'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { MerchantMessageItem, MerchantLoadingMessage } from './MerchantMessageItem'
import { MessageInput } from './MessageInput'
import { ChatContainer, MessagesArea, InputArea } from '../styles/ChatStyles'

export default function MerchantChatInterface() {
    const { 
        messages, 
        isLoading, 
        currentFunction, 
        waitingForInput,
        handleFunctionSelect, 
        handleQuarterSelect, 
        handleUserInput,
        showFunctionOptions,
        isGeneratingReport,
        isGeneratingPortrait
    } = useMerchantChat()
    
    const scrollRef = useAutoScroll(messages, isLoading || isGeneratingReport || isGeneratingPortrait)

    const handleSendMessage = (message: string) => {
        if (currentFunction === 'user_portrait' && waitingForInput) {
            handleUserInput(message)
        } else {
            showFunctionOptions()
        }
    }

    return (
        <ChatContainer>
            <MessagesArea>
                {messages.map((message) => (
                    <MerchantMessageItem 
                        key={message.id} 
                        message={message}
                        onFunctionSelect={handleFunctionSelect}
                        onQuarterSelect={handleQuarterSelect}
                        disabled={isLoading || isGeneratingReport || isGeneratingPortrait}
                    />
                ))}
                
                {(isLoading || isGeneratingReport || isGeneratingPortrait) && <MerchantLoadingMessage />}
                
                <div ref={scrollRef} />
            </MessagesArea>

            <InputArea>
                <MessageInput 
                    onSend={handleSendMessage} 
                    disabled={isLoading || isGeneratingReport || isGeneratingPortrait}
                    placeholder="Type your message here..."
                />
            </InputArea>
        </ChatContainer>
    )
}


