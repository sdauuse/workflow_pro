import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Select, 
  Space, 
  Button, 
  message,
  Tabs,
  Divider,
  Alert
} from 'antd';
import { 
  ProjectOutlined, 
  CalendarOutlined, 
  BarChartOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import GanttView from './GanttView';
import projectService from '../services/projectService';
import projectPhaseService from '../services/projectPhaseService';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const GanttDemo = () => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [projectPhases, setProjectPhases] = useState([]);
  const [loading, setLoading] = useState(false);

  // 模拟项目数据
  const mockProjects = [
    { id: 1, projectName: 'SAGE TWD Implementation', description: 'SAGE项目实施' },
    { id: 2, projectName: 'Customer Portal Redesign', description: '客户门户重设计' },
    { id: 3, projectName: 'API Gateway Implementation', description: 'API网关实施' }
  ];

  useEffect(() => {
    // 初始化项目列表
    setAvailableProjects(mockProjects);
    if (mockProjects.length > 0) {
      setSelectedProjectId(mockProjects[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectPhases();
    }
  }, [selectedProjectId]);

  const loadProjectPhases = async () => {
    if (!selectedProjectId) return;
    
    setLoading(true);
    try {
      const phases = await projectPhaseService.getProjectPhasesByProjectId(selectedProjectId);
      setProjectPhases(phases);
    } catch (error) {
      console.error('Failed to load project phases:', error);
      message.error('加载项目阶段失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePhaseUpdate = async (phaseId, phaseData) => {
    console.log('阶段更新:', phaseId, phaseData);
    message.success(`阶段 ${phaseId} 更新成功`);
    // 可以在这里添加额外的业务逻辑
  };

  const selectedProject = availableProjects.find(p => p.id === selectedProjectId);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={2}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  项目甘特图管理
                </Title>
                <Paragraph type="secondary">
                  基于 DHTMLX Gantt 的专业甘特图解决方案，支持拖拽调整、进度跟踪、基线对比等功能。
                </Paragraph>
              </div>

              <Alert
                message="设计特点"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>采用专业的 DHTMLX Gantt 库，避免重复造轮子</li>
                    <li>支持实时数据同步到后端数据库</li>
                    <li>可视化展示计划时间 vs 实际时间对比</li>
                    <li>支持任务拖拽、进度调整、状态更新</li>
                    <li>响应式设计，支持全屏显示</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Card 
                title={
                  <Space>
                    <ProjectOutlined />
                    <span>选择项目</span>
                  </Space>
                }
                size="small"
              >
                <Space>
                  <Select
                    placeholder="请选择项目"
                    style={{ width: 300 }}
                    value={selectedProjectId}
                    onChange={setSelectedProjectId}
                    loading={loading}
                  >
                    {availableProjects.map(project => (
                      <Option key={project.id} value={project.id}>
                        {project.projectName}
                      </Option>
                    ))}
                  </Select>
                  
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={loadProjectPhases}
                    loading={loading}
                  >
                    刷新数据
                  </Button>
                </Space>
                
                {selectedProject && (
                  <div style={{ marginTop: 8, color: '#666' }}>
                    当前项目: <strong>{selectedProject.projectName}</strong>
                    {selectedProject.description && (
                      <span> - {selectedProject.description}</span>
                    )}
                  </div>
                )}
              </Card>
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Tabs defaultActiveKey="gantt" type="card">
            <TabPane 
              tab={
                <span>
                  <BarChartOutlined />
                  甘特图视图
                </span>
              } 
              key="gantt"
            >
              {selectedProjectId ? (
                <GanttView 
                  projectId={selectedProjectId}
                  title={`${selectedProject?.projectName} - 项目甘特图`}
                  onPhaseUpdate={handlePhaseUpdate}
                />
              ) : (
                <Card style={{ textAlign: 'center', padding: 60 }}>
                  <ProjectOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                  <Title level={4} type="secondary">请选择一个项目</Title>
                  <Paragraph type="secondary">
                    选择上方的项目后，将显示对应的甘特图
                  </Paragraph>
                </Card>
              )}
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <ProjectOutlined />
                  阶段数据
                </span>
              } 
              key="phases"
            >
              <Card title="项目阶段信息">
                {projectPhases.length > 0 ? (
                  <div>
                    <Paragraph>
                      当前项目共有 <strong>{projectPhases.length}</strong> 个阶段：
                    </Paragraph>
                    {projectPhases.map((phase, index) => (
                      <Card key={phase.id} size="small" style={{ marginBottom: 8 }}>
                        <Row>
                          <Col span={6}>
                            <strong>{phase.phase_name}</strong>
                          </Col>
                          <Col span={4}>
                            状态: {phase.status}
                          </Col>
                          <Col span={4}>
                            进度: {phase.progress_percentage}%
                          </Col>
                          <Col span={5}>
                            计划: {phase.planned_start_date} ~ {phase.planned_end_date}
                          </Col>
                          <Col span={5}>
                            实际: {phase.start_date || '-'} ~ {phase.end_date || '-'}
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Paragraph type="secondary">
                      {selectedProjectId ? '该项目暂无阶段数据' : '请先选择一个项目'}
                    </Paragraph>
                  </div>
                )}
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      <Divider />
      
      <Card title="技术说明" size="small">
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" title="后端数据层">
              <ul>
                <li>MySQL 数据库</li>
                <li>project_phases 表结构</li>
                <li>RESTful API 服务</li>
              </ul>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="前端实现层">
              <ul>
                <li>React + DHTMLX Gantt</li>
                <li>GanttView 组件封装</li>
                <li>响应式设计</li>
              </ul>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="数据通信">
              <ul>
                <li>projectPhaseService 服务层</li>
                <li>实时数据同步</li>
                <li>格式转换适配</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default GanttDemo;
