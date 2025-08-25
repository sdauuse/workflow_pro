import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Statistic, Progress, Select, Space } from 'antd';
import {
  ProjectOutlined,
  AlertOutlined,
  CalendarOutlined,
  TeamOutlined
} from '@ant-design/icons';
import GanttView from './GanttView';
import projectService from '../services/projectService';

const { Title } = Typography;
const { Option } = Select;

const Dashboard = ({ projects = [], teams = [], teamMembers = [] }) => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);

  useEffect(() => {
    // 获取所有项目列表
    const loadProjects = async () => {
      try {
        const projectsData = await projectService.getAllProjects();
        setAvailableProjects(projectsData);
        if (projectsData.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projectsData[0].id);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    };
    loadProjects();
  }, [selectedProjectId]);
  const getStatusCount = (status) => {
    return projects.filter(p => p.itProjectStatus === status).length;
  };

  const getEscalatedCount = () => {
    return projects.filter(p => p.escalation).length;
  };

  const getUpcomingMilestones = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return projects.filter(p => {
      if (!p.nextCheckDate) return false;
      const checkDate = new Date(p.nextCheckDate);
      return checkDate <= nextWeek;
    }).length;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'GREEN': return '#52c41a';
      case 'AMBER': return '#faad14';
      case 'RED': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const getHealthScore = () => {
    if (projects.length === 0) return 0;
    const greenProjects = getStatusCount('GREEN');
    return Math.round((greenProjects / projects.length) * 100);
  };

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={projects.length}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Teams"
              value={teams.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Team Members"
              value={teamMembers.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Escalated"
              value={getEscalatedCount()}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Project Status Overview">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Green Projects</span>
                <span>{getStatusCount('GREEN')}</span>
              </div>
              <Progress
                percent={projects.length ? (getStatusCount('GREEN') / projects.length) * 100 : 0}
                strokeColor={getStatusColor('GREEN')}
                showInfo={false}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Amber Projects</span>
                <span>{getStatusCount('AMBER')}</span>
              </div>
              <Progress
                percent={projects.length ? (getStatusCount('AMBER') / projects.length) * 100 : 0}
                strokeColor={getStatusColor('AMBER')}
                showInfo={false}
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Red Projects</span>
                <span>{getStatusCount('RED')}</span>
              </div>
              <Progress
                percent={projects.length ? (getStatusCount('RED') / projects.length) * 100 : 0}
                strokeColor={getStatusColor('RED')}
                showInfo={false}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Recent Projects">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} style={{ marginBottom: 12, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                <div style={{ fontWeight: 'bold' }}>{project.projectName}</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <span className={`status-badge status-${project.itProjectStatus?.toLowerCase()}`}>
                    {project.itProjectStatus}
                  </span>
                  {project.lead && (
                    <span style={{ marginLeft: 8 }}>Lead: {project.lead.name}</span>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* 甘特图区域 */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <span>项目甘特图</span>
                <Select
                  placeholder="选择项目"
                  style={{ width: 200 }}
                  value={selectedProjectId}
                  onChange={setSelectedProjectId}
                >
                  {availableProjects.map(project => (
                    <Option key={project.id} value={project.id}>
                      {project.projectName || project.project_name || `项目 ${project.id}`}
                    </Option>
                  ))}
                </Select>
              </Space>
            }
          >
            {selectedProjectId ? (
              <GanttView 
                projectId={selectedProjectId}
                onPhaseUpdate={(phaseId, phaseData) => {
                  console.log('Phase updated:', phaseId, phaseData);
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                请选择一个项目来查看甘特图
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
