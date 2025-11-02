import { useChat } from '../hooks/useChat'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { MessageItem, LoadingMessage } from './MessageItem'
import { MessageInput } from './MessageInput'
import { ChatContainer, MessagesArea, InputArea } from '../styles/ChatStyles'

export default function ChatInterface() {
    const { messages, isLoading, sendMessage } = useChat()
    const scrollRef = useAutoScroll(messages, isLoading)

    return (
        <ChatContainer>
            <MessagesArea>
                {messages.map((message) => (
                    <MessageItem key={message.id} message={message} />
                ))}
                
                {isLoading && <LoadingMessage />}
                
                <div ref={scrollRef} />
            </MessagesArea>

            <InputArea>
                <MessageInput 
                    onSend={sendMessage} 
                    disabled={isLoading}
                />
            </InputArea>
        </ChatContainer>
    )
}

