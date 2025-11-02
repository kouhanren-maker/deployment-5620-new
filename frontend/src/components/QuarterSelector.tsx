import { Button } from 'antd'
import type { Quarter } from '../store/merchantChatStore'

interface QuarterSelectorProps {
  onSelect: (quarter: Quarter) => void
  disabled?: boolean
}

export const QuarterSelector = ({ onSelect, disabled = false }: QuarterSelectorProps) => {
  const quarters: { quarter: Quarter; label: string; color: string }[] = [
    { quarter: 'Q1', label: 'Q1 (Jan-Mar)', color: '#ff4d4f' },
    { quarter: 'Q2', label: 'Q2 (Apr-Jun)', color: '#1890ff' },
    { quarter: 'Q3', label: 'Q3 (Jul-Sep)', color: '#52c41a' },
    { quarter: 'Q4', label: 'Q4 (Oct-Dec)', color: '#faad14' }
  ]

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
      gap: 12,
      marginTop: 16
    }}>
      {quarters.map(({ quarter, label, color }) => (
        <Button
          key={quarter}
          size="large"
          onClick={() => onSelect(quarter)}
          disabled={disabled}
          style={{
            height: 50,
            borderRadius: 12,
            background: color,
            border: 'none',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
