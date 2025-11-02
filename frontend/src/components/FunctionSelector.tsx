import { Button } from 'antd'
import { BarChartOutlined, TeamOutlined } from '@ant-design/icons'
import type { MerchantFunction } from '../store/merchantChatStore'

interface FunctionSelectorProps {
  onSelect: (func: MerchantFunction) => void
  disabled?: boolean
}

export const FunctionSelector = ({ onSelect, disabled = false }: FunctionSelectorProps) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: 16, 
      justifyContent: 'center',
      marginTop: 16,
      flexWrap: 'wrap'
    }}>
      <Button
        type="primary"
        size="large"
        icon={<BarChartOutlined />}
        onClick={() => onSelect('quarterly_report')}
        disabled={disabled}
        style={{
          height: 60,
          minWidth: 200,
          borderRadius: 12,
          background: 'linear-gradient(45deg, #a8e6cf, #7fcdcd)',
          border: 'none',
          fontSize: 16,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        Generate Quarterly Report
      </Button>
      
      <Button
        type="primary"
        size="large"
        icon={<TeamOutlined />}
        onClick={() => onSelect('user_portrait')}
        disabled={disabled}
        style={{
          height: 60,
          minWidth: 200,
          borderRadius: 12,
          background: 'linear-gradient(45deg, #7fcdcd, #5ba3a3)',
          border: 'none',
          fontSize: 16,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        Generate User Portrait
      </Button>
    </div>
  )
}
