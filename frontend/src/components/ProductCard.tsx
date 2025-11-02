import { Card, Typography, Button } from 'antd'
import { LinkOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface Product {
    id: number
    name: string
    source: string
    price?: number | null
}

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const handleClick = () => {
        if (product.source) {
            window.open(product.source, '_blank')
        }
    }

    return (
        <Card
            hoverable
            onClick={handleClick}
            style={{
                borderRadius: 16,
                cursor: 'pointer',
                background: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none'
            }}
            bodyStyle={{ padding: 16 }}
        >
            <div style={{ marginBottom: 12 }}>
                <Title level={5} style={{ margin: 0, fontSize: 16, lineHeight: 1.4 }}>
                    {product.name}
                </Title>
                {product.price !== null && product.price !== undefined && (
                    <Text strong style={{ fontSize: 18, color: '#7fcdcd', display: 'block', marginTop: 8 }}>
                        ${product.price.toFixed(2)}
                    </Text>
                )}
            </div>

            <Button
                type="primary"
                icon={<LinkOutlined />}
                onClick={(e) => {
                    e.stopPropagation()
                    handleClick()
                }}
                block
                style={{
                    height: 36,
                    borderRadius: 18,
                    background: 'linear-gradient(45deg, #a8e6cf, #7fcdcd)',
                    border: 'none',
                    fontWeight: 600
                }}
            >
                View Product
            </Button>
        </Card>
    )
}
