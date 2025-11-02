import { Avatar, Card, Typography, Spin } from 'antd'
import { RobotOutlined, UserOutlined } from '@ant-design/icons'
import type { Message } from '../types/chat'
import ProductCard from './ProductCard'
import { 
  MessageContainer, 
  MessageContent, 
  MessageCard, 
  MessageText, 
  Timestamp 
} from '../styles/ChatStyles'

const { Text } = Typography

interface MessageItemProps {
  message: Message
}

export const MessageItem = ({ message }: MessageItemProps) => {
  const isUser = message.type === 'user'
  
  const products = message.data?.products || []
  
  return (
    <MessageContainer $isUser={isUser}>
      <MessageContent>
        {!isUser && (
          <Avatar 
            icon={<RobotOutlined />} 
            style={{ 
              background: 'linear-gradient(45deg, #a8e6cf, #7fcdcd)',
              flexShrink: 0
            }} 
          />
        )}
        
        <div style={{ flex: 1 }}>
          <MessageCard $isUser={isUser}>
            <MessageText>{message.content}</MessageText>
            
            {products.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: 16,
                  marginTop: 16
                }}>
                  {products.map((product: any) => (
                    <ProductCard key={product.id || product.source} product={product} />
                  ))}
                </div>
              </div>
            )}
          </MessageCard>
          
          <Timestamp $isUser={isUser}>
            {message.timestamp.toLocaleTimeString()}
          </Timestamp>
        </div>

        {isUser && (
          <Avatar 
            icon={<UserOutlined />} 
            style={{ 
              background: 'linear-gradient(45deg, #a8e6cf, #7fcdcd)',
              flexShrink: 0
            }} 
          />
        )}
      </MessageContent>
    </MessageContainer>
  )
}

export const LoadingMessage = () => (
  <MessageContainer $isUser={false}>
    <MessageContent>
      <Avatar 
        icon={<RobotOutlined />} 
        style={{ 
          background: 'linear-gradient(45deg, #a8e6cf, #7fcdcd)',
          flexShrink: 0
        }} 
      />
      <Card
        style={{
          borderRadius: 20,
          background: 'white',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Spin size="small" />
          <Text style={{ color: '#666' }}>AI is thinking...</Text>
        </div>
      </Card>
    </MessageContent>
  </MessageContainer>
)
