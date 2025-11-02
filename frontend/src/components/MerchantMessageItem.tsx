import { Avatar, Card, Typography, Spin } from 'antd'
import { RobotOutlined, UserOutlined } from '@ant-design/icons'
import type { MerchantMessage, MerchantFunction, Quarter } from '../store/merchantChatStore'
import { FunctionSelector } from './FunctionSelector'
import { QuarterSelector } from './QuarterSelector'
import { 
  MessageContainer,
  MessageContent,
  MessageCard,
  MessageText,
  Timestamp,
} from '../styles/ChatStyles'

const { Text } = Typography

interface MerchantMessageItemProps {
  message: MerchantMessage
  onFunctionSelect: (func: MerchantFunction) => void
  onQuarterSelect: (quarter: Quarter) => void
  disabled?: boolean
}

export const MerchantMessageItem = ({
  message,
  onFunctionSelect,
  onQuarterSelect,
  disabled = false,
}: MerchantMessageItemProps) => {
  const isUser = message.type === 'user'

  return (
    <MessageContainer $isUser={isUser}>
      <MessageContent>
        {!isUser && (
          <Avatar 
            icon={<RobotOutlined />} 
            style={{ 
              background: 'linear-gradient(45deg, #a8e6cf, #7fcdcd)',
              flexShrink: 0,
            }} 
          />
        )}

        <div style={{ flex: 1 }}>
          <MessageCard $isUser={isUser}>
            <MessageText>{message.content}</MessageText>

            {message.data?.showOptions && (
              <FunctionSelector onSelect={onFunctionSelect} disabled={disabled} />
            )}

            {message.data?.showQuarterOptions && (
              <QuarterSelector onSelect={onQuarterSelect} disabled={disabled} />
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
              flexShrink: 0,
            }} 
          />
        )}
      </MessageContent>
    </MessageContainer>
  )
}

export const MerchantLoadingMessage = () => (
  <MessageContainer $isUser={false}>
    <MessageContent>
      <Avatar 
        icon={<RobotOutlined />} 
        style={{ 
          background: 'linear-gradient(45deg, #a8e6cf, #7fcdcd)',
          flexShrink: 0,
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
          <Text style={{ color: '#666' }}>Generating insights...</Text>
        </div>
      </Card>
    </MessageContent>
  </MessageContainer>
)


