import axios from 'axios'
import { Card, Form, Input, Button, Typography, App as AntdApp } from 'antd'
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type LoginForm = {
    email: string
    password: string
}

const { Title, Text } = Typography

export default function Login() {
    const { message } = AntdApp.useApp()
    const [form] = Form.useForm<LoginForm>()
    const navigate = useNavigate()
    const { login, isLoggingIn } = useAuth()

    const onFinish = async (values: LoginForm) => {
        try {
            await login({
                email: values.email,
                password: values.password,
            })
            message.success('Login successful!')
            setTimeout(() => {
                navigate('/dashboard')
            }, 100)
        } catch (err: unknown) {
            if (axios.isAxiosError<any>(err)) {
                const status = err.response?.status
                const url = err.config?.url
                const backendMsg = (err.response?.data && (err.response.data.message || err.response.data.detail)) || ''
                const msg = backendMsg || 'Login failed'
                if (/invalid credentials/i.test(msg)) {
                    message.error('Invalid email or password')
                } else {
                    message.error(`${status ?? ''} ${url ?? ''} ${msg}`.trim())
                }
                // eslint-disable-next-line no-console
                console.error('Login error:', { status, url, data: err.response?.data })
            } else {
                message.error('Login failed')
            }
        }
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #a8e6cf 0%, #7fcdcd 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{ width: '100%', maxWidth: 400 }}>
                {/* Logo and title */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        margin: '0 auto 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                        <UserOutlined style={{ fontSize: 32, color: 'white' }} />
                    </div>
                    <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 600 }}>
                        AI Shopping Assistant
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 16 }}>
                        Smart Shopping Guide & Personalized Recommendations
                    </Text>
                </div>

                <Card 
                    style={{ 
                        borderRadius: 20,
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                >
                    <Title level={4} style={{ textAlign: 'center', marginBottom: 32, color: '#333' }}>
                        Sign In
                    </Title>

                    <Form<LoginForm>
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark="optional"
                        autoComplete="off"
                    >
                        

                        <Form.Item
                            label="Email Address"
                            name="email"
                            rules={[
                                { required: true, message: 'Please enter email' },
                                { type: 'email', message: 'Invalid email format' },
                            ]}
                        >
                            <Input 
                                size="large" 
                                placeholder="your@example.com" 
                                prefix={<MailOutlined style={{ color: '#7fcdcd' }} />}
                                style={{ borderRadius: 12 }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please enter password' }]}
                        >
                            <Input.Password 
                                size="large" 
                                prefix={<LockOutlined style={{ color: '#7fcdcd' }} />}
                                style={{ borderRadius: 12 }}
                            />
                        </Form.Item>

                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            size="large" 
                            block 
                            loading={isLoggingIn}
                            style={{
                                height: 48,
                                borderRadius: 12,
                                background: 'linear-gradient(45deg, #a8e6cf, #7fcdcd)',
                                border: 'none',
                                fontSize: 16,
                                fontWeight: 600,
                                color: '#2d5a5a'
                            }}
                        >
                            Sign In
                        </Button>

                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <Text style={{ color: '#666' }}>Don't have an account?</Text>
                            <Button 
                                type="link" 
                                onClick={() => navigate('/register')}
                                style={{ 
                                    color: '#7fcdcd',
                                    fontWeight: 600,
                                    padding: 0,
                                    marginLeft: 8
                                }}
                            >
                                Sign Up
                            </Button>
                        </div>

                    </Form>
                </Card>
            </div>
        </div>
    )
}
