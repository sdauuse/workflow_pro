import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Alert, Spin, List } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SystemHealthCheck = () => {
    const [healthStatus, setHealthStatus] = useState({
        backend: 'checking',
        database: 'checking',
        api: 'checking'
    });
    const [apiTests, setApiTests] = useState([]);

    useEffect(() => {
        performHealthCheck();
    }, []);

    const performHealthCheck = async () => {
        // Test backend connectivity
        try {
            const response = await fetch('http://localhost:8080/api/projects', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                setHealthStatus(prev => ({ ...prev, backend: 'healthy', api: 'healthy' }));
                setApiTests(prev => [...prev, { test: 'Projects API', status: 'success', message: 'Connection successful' }]);
            } else {
                setHealthStatus(prev => ({ ...prev, backend: 'error', api: 'error' }));
                setApiTests(prev => [...prev, { test: 'Projects API', status: 'error', message: `HTTP ${response.status}` }]);
            }
        } catch (error) {
            setHealthStatus(prev => ({ ...prev, backend: 'error', api: 'error' }));
            setApiTests(prev => [...prev, { test: 'Projects API', status: 'error', message: error.message }]);
        }

        // Test milestones API
        try {
            const response = await fetch('http://localhost:8080/api/milestones', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                setApiTests(prev => [...prev, { test: 'Milestones API', status: 'success', message: 'Connection successful' }]);
            } else {
                setApiTests(prev => [...prev, { test: 'Milestones API', status: 'error', message: `HTTP ${response.status}` }]);
            }
        } catch (error) {
            setApiTests(prev => [...prev, { test: 'Milestones API', status: 'error', message: error.message }]);
        }

        // Test Swagger API documentation
        try {
            const response = await fetch('http://localhost:8080/swagger-ui.html');
            if (response.ok) {
                setApiTests(prev => [...prev, { test: 'API Documentation', status: 'success', message: 'Swagger UI accessible' }]);
            } else {
                setApiTests(prev => [...prev, { test: 'API Documentation', status: 'warning', message: 'Swagger UI not accessible' }]);
            }
        } catch (error) {
            setApiTests(prev => [...prev, { test: 'API Documentation', status: 'warning', message: 'Swagger UI not accessible' }]);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy':
            case 'success':
                return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
            case 'error':
                return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
            case 'checking':
                return <Spin size="small" />;
            default:
                return <CloseCircleOutlined style={{ color: '#faad14' }} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy':
            case 'success':
                return '#52c41a';
            case 'error':
                return '#f5222d';
            case 'checking':
                return '#1890ff';
            default:
                return '#faad14';
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>系统健康检查</Title>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
                <Card title="后端服务" size="small">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {getStatusIcon(healthStatus.backend)}
                        <Text style={{ color: getStatusColor(healthStatus.backend) }}>
                            {healthStatus.backend === 'checking' ? '检查中...' : 
                             healthStatus.backend === 'healthy' ? '运行正常' : '连接失败'}
                        </Text>
                    </div>
                    <Text type="secondary">Spring Boot 后端服务状态</Text>
                </Card>

                <Card title="API 接口" size="small">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {getStatusIcon(healthStatus.api)}
                        <Text style={{ color: getStatusColor(healthStatus.api) }}>
                            {healthStatus.api === 'checking' ? '检查中...' : 
                             healthStatus.api === 'healthy' ? '连接正常' : 'API 不可用'}
                        </Text>
                    </div>
                    <Text type="secondary">RESTful API 端点状态</Text>
                </Card>

                <Card title="数据库" size="small">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {getStatusIcon(healthStatus.backend === 'healthy' ? 'healthy' : healthStatus.backend)}
                        <Text style={{ color: getStatusColor(healthStatus.backend === 'healthy' ? 'healthy' : healthStatus.backend) }}>
                            {healthStatus.backend === 'checking' ? '检查中...' : 
                             healthStatus.backend === 'healthy' ? 'H2 数据库运行中' : '数据库连接失败'}
                        </Text>
                    </div>
                    <Text type="secondary">H2 内存数据库状态</Text>
                </Card>
            </div>

            <Card title="API 测试结果" style={{ marginBottom: 16 }}>
                <List
                    dataSource={apiTests}
                    renderItem={item => (
                        <List.Item>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                                {getStatusIcon(item.status)}
                                <div style={{ flex: 1 }}>
                                    <Text strong>{item.test}</Text>
                                    <br />
                                    <Text type="secondary">{item.message}</Text>
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>

            <Alert
                message="系统状态说明"
                description={
                    <div>
                        <p><strong>如果后端连接失败：</strong></p>
                        <ul>
                            <li>确保后端服务已启动 (端口 8080)</li>
                            <li>检查CORS配置是否正确</li>
                            <li>验证API端点路径</li>
                        </ul>
                        <p><strong>快速启动后端：</strong></p>
                        <code>cd backend && mvn spring-boot:run</code>
                    </div>
                }
                type="info"
                showIcon
            />

            <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Button type="primary" onClick={performHealthCheck}>
                    重新检查
                </Button>
            </div>
        </div>
    );
};

export default SystemHealthCheck;
