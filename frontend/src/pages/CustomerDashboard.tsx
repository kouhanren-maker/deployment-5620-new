import { Layout, Typography, Button, Space, Avatar, Dropdown, Modal, Input, App as AntdApp } from 'antd'
import { UserOutlined, LogoutOutlined, MessageOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ChatInterface from '../components/ChatInterface'
import { useState } from 'react'
import { http } from '../api/http'
import type { MenuProps } from 'antd'

const { Header, Content } = Layout
const { Title } = Typography

export default function CustomerDashboard() {
    const navigate = useNavigate()
    const { user, logout, isLoggingOut } = useAuth()
    const { message } = AntdApp.useApp()
    const [prefOpen, setPrefOpen] = useState(false)
    const [prefText, setPrefText] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const openPreference = () => setPrefOpen(true)
    const closePreference = () => { if (!submitting) setPrefOpen(false) }
    const submitPreference = async () => {
        if (!user?.id) {
            message.error('User not found')
            return
        }
        const text = prefText.trim()
        if (!text) {
            message.warning('Please enter your preference')
            return
        }
        try {
            setSubmitting(true)
            // POST /api/customer/{user_id}/preferences/
            await http.post(`/customer/${user.id}/preferences/`, { preferences: text })
            message.success('Preference submitted')
            setPrefOpen(false)
            setPrefText('')
        } catch (err: any) {
            const status = err?.response?.status
            const detail = err?.response?.data?.message || err?.response?.data?.detail || 'Submit failed'
            message.error(`${status ?? ''} ${detail}`.trim())
        } finally {
            setSubmitting(false)
        }
    }

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: user?.username || 'User',
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
                            <MessageOutlined style={{ fontSize: 20, color: 'white' }} />
                        </div>
                        <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 600 }}>
                            AI Shopping Assistant
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
                                {user?.username || 'User'}
                            </Button>
                        </Dropdown>
                        <Button 
                            type="primary"
                            onClick={openPreference}
                            style={{
                                borderRadius: 20,
                                height: 40,
                                background: 'linear-gradient(45deg, #a8e6cf, #7fcdcd)',
                                border: 'none',
                                fontWeight: 600,
                                color: '#2d5a5a'
                            }}
                        >
                            Set Preference
                        </Button>
                    </Space>
                </div>
            </Header>

            <Content style={{ padding: '24px' }}>
                <div style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    height: 'calc(100vh - 112px)'
                }}>
                    <ChatInterface />
                </div>
            </Content>

            <Modal
                title="Your Preference"
                open={prefOpen}
                onOk={submitPreference}
                onCancel={closePreference}
                okText={submitting ? 'Submitting...' : 'Submit'}
                okButtonProps={{ loading: submitting }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Typography.Text type="secondary">
                        Describe your shopping preference (e.g., styles, colors, brands)
                    </Typography.Text>
                    <Input.TextArea
                        rows={5}
                        value={prefText}
                        onChange={(e) => setPrefText(e.target.value)}
                        placeholder="Write anything you like…"
                    />
                </div>
            </Modal>
        </Layout>
    )
}
