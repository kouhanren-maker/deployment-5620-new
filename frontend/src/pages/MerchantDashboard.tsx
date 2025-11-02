import { Layout, Typography, Button, Space, Avatar, Dropdown } from 'antd'
import { UserOutlined, LogoutOutlined, ShopOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import MerchantChatInterface from '../components/MerchantChatInterface'
import type { MenuProps } from 'antd'

const { Header, Content } = Layout
const { Title } = Typography

export default function MerchantDashboard() {
    const navigate = useNavigate()
    const { user, logout, isLoggingOut } = useAuth()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: user?.username || 'Merchant',
            disabled: true,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sign Out',
            onClick: handleLogout,
        },
    ]

    return (
        <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #a8e6cf 0%, #7fcdcd 100%)' }}>
            <Header style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '0 24px' 
            }}>
                <div style={{
                    maxWidth: 1200, 
                    margin: '0 auto', 
                    height: 64,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <ShopOutlined style={{ fontSize: 20, color: 'white' }} />
                        </div>
                        <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 600 }}>
                            Merchant Dashboard
                        </Title>
                    </div>

                    <Space>
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <Button 
                                type="text" 
                                style={{ 
                                    color: 'white',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: 20,
                                    height: 40,
                                    padding: '0 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}
                                loading={isLoggingOut}
                            >
                                <Avatar size="small" icon={<UserOutlined />} />
                                {user?.username || 'Merchant'}
                            </Button>
                        </Dropdown>
                    </Space>
                </div>
            </Header>

            <Content style={{ padding: '24px' }}>
                <div style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    height: 'calc(100vh - 112px)'
                }}>
                    <MerchantChatInterface />
                </div>
            </Content>
        </Layout>
    )
}