import axios from 'axios'
import { Card, Form, Input, Button, Typography, App as AntdApp, Select } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'
import { http } from '../api/http'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

type RegisterForm = {
    email: string
    password: string
    confirm?: string
    userType: string
}

const { Title, Text } = Typography

export default function Register() {
    const { message } = AntdApp.useApp()
    const [form] = Form.useForm<RegisterForm>()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const onFinish = async (values: RegisterForm) => {
        try {
            setLoading(true)
            const res = await http.post('/register/', {
                email: values.email,
                password: values.password,
                role: values.userType
            })
            if ((res.status === 201 && res.data?.id) || (res.data && res.data.id)) {
                message.success('Registration successful! Please sign in')
                form.resetFields()
                navigate('/login')
            } else {
                message.error(res.data?.message || 'Registration failed')
            }
        } catch (err: unknown) {
            if (axios.isAxiosError<any>(err)) {
                const status = err.response?.status
                const url = err.config?.url
                const backendMsg = (err.response?.data && (err.response.data.message || err.response.data.detail)) || ''
                const msg = backendMsg || 'Registration failed'
                if (status === 409 || /duplicate|exist|unique/i.test(msg)) {
                    form.setFields([{ name: 'email', errors: ['Email already exists'] }])
                } else {
                    message.error(`${status ?? ''} ${url ?? ''} ${msg}`.trim())
                }
                // eslint-disable-next-line no-console
                console.error('Register error:', { status, url, data: err.response?.data })
            } else {
                message.error('Registration failed')
            }
        } finally {
            setLoading(false)
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
                        Create Account
                    </Title>

                    <Form<RegisterForm>
                        form={form} 
                        layout="vertical" 
                        onFinish={onFinish}
                        requiredMark="optional" 
                        autoComplete="off"
                        initialValues={{ userType: 'customer' }}
                    >
                        <Form.Item
                            label="User Type"
                            name="userType"
                            rules={[{ required: true, message: 'Please select user type' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select user type"
                                options={[
                                    { value: 'customer', label: 'Customer' },
                                    { value: 'merchant', label: 'Merchant' }
                                ]}
                            />
                        </Form.Item>

                        {/* Username removed as backend does not require it */}

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
                            hasFeedback
                            validateTrigger="onBlur"
                            rules={[
                                { required: true, message: 'Please enter password' },
                                {
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/,
                                    message: 'Password must be ≥8 chars with uppercase, lowercase and special characters',
                                },
                            ]}
                            extra={
                                <span style={{ display: 'block', textAlign: 'left', color: 'rgba(0,0,0,0.45)' }}>
                                At least 8 characters with uppercase, lowercase and special characters (e.g. !@#$%).
                                </span>
                            }
                        >
                            <Input.Password 
                                size="large" 
                                prefix={<LockOutlined style={{ color: '#7fcdcd' }} />}
                                style={{ borderRadius: 12 }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Confirm Password" 
                            name="confirm" 
                            dependencies={['password']} 
                            hasFeedback
                            rules={[
                                { required: true, message: 'Please confirm password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value: string) {
                                        return !value || getFieldValue('password') === value
                                            ? Promise.resolve()
                                            : Promise.reject(new Error('Passwords do not match'))
                                    },
                                }),
                            ]}
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
                            loading={loading}
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
                            Sign Up
                        </Button>

                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <Text style={{ color: '#666' }}>Already have an account?</Text>
                            <Button 
                                type="link" 
                                onClick={() => navigate('/login')}
                                style={{ 
                                    color: '#7fcdcd',
                                    fontWeight: 600,
                                    padding: 0,
                                    marginLeft: 8
                                }}
                            >
                                Sign In
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    )
}
