// GanttChart.js 清理后的代码
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Progress,
  Tag,
  Typography,
  Statistic,
  Calendar,
  Tooltip,
  Button,
  Space,
  Modal,
  Form,
  DatePicker,
  Select,
  InputNumber,
  Input,
  message
} from 'antd';
import {
  CalendarOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EditOutlined,
  ReloadOutlined,
  TeamOutlined
} from '@ant-design/icons';
import moment from 'moment';
import './GanttChart.css';
import milestoneService from '../services/milestoneService';

const { Title, Text } = Typography;
const { Option } = Select;

const GanttChart = ({ loading, onUpdatePhase, projects = [] }) => {
  const [ganttData, setGanttData] = useState({ projects: [], statistics: {}, phaseStatistics: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [form] = Form.useForm();
  
  // 新增编辑功能的状态
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [isMilestoneEditVisible, setIsMilestoneEditVisible] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [isPhaseEditVisible, setIsPhaseEditVisible] = useState(false);
  const [milestoneForm] = Form.useForm();
  const [phaseForm] = Form.useForm();

  const loadGanttData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 将传入的项目数据转换为甘特图格式
      const convertedProjects = projects.map(project => {
        const phases = generatePhasesForProject(project);
        const completedPhases = phases.filter(p => p.status === 'COMPLETED').length;
        const inProgressPhases = phases.filter(p => p.status === 'IN_PROGRESS').length;
        const delayedPhases = phases.filter(p => p.status === 'DELAYED' || p.isOverdue).length;
        
        // Calculate overall status based on phases
        let overallStatus = 'NOT_STARTED';
        let statusColor = 'GREEN';
        
        if (completedPhases === phases.length) {
          overallStatus = 'COMPLETED';
          statusColor = 'GREEN';
        } else if (inProgressPhases > 0) {
          overallStatus = 'IN_PROGRESS';
          statusColor = delayedPhases > 0 ? 'RED' : 'AMBER';
        } else if (delayedPhases > 0) {
          overallStatus = 'AT_RISK';
          statusColor = 'RED';
        }

        return {
          ...project,
          phases,
          milestones: project.keyMilestones || [],
          overallStatus,
          statusColor,
          completionRate: completedPhases / phases.length * 100
        };
      });

      // 计算统计信息
      const statistics = {
        totalProjects: convertedProjects.length,
        completedProjects: convertedProjects.filter(p => p.overallStatus === 'COMPLETED').length,
        inProgressProjects: convertedProjects.filter(p => p.overallStatus === 'IN_PROGRESS').length,
        atRiskProjects: convertedProjects.filter(p => p.overallStatus === 'AT_RISK').length
      };

      // 计算阶段统计
      const phaseStatistics = [
        'ESTIMATED', 'PLANNING', 'DEVELOPMENT', 'SIT', 'UAT', 'PPE', 'LIVE'
      ].map(phaseName => {
        const phaseData = convertedProjects.flatMap(p => p.phases).filter(phase => phase.phaseName === phaseName);
        return {
          phaseName,
          totalCount: phaseData.length,
          completedCount: phaseData.filter(p => p.status === 'COMPLETED').length,
          inProgressCount: phaseData.filter(p => p.status === 'IN_PROGRESS').length,
          delayedCount: phaseData.filter(p => p.status === 'DELAYED').length
        };
      });

      setGanttData({
        projects: convertedProjects,
        statistics,
        phaseStatistics
      });
    } catch (error) {
      console.error('Error loading gantt data:', error);
      message.error('Failed to load gantt data');
    }
    setIsLoading(false);
  }, [projects]);

  useEffect(() => {
    loadGanttData();
  }, [loadGanttData]);

  useEffect(() => {
    if (searchText) {
      const filtered = ganttData.projects.filter(project =>
        project.projectName?.toLowerCase().includes(searchText.toLowerCase()) ||
        project.projectManager?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(ganttData.projects);
    }
  }, [searchText, ganttData.projects]);

  // 为项目生成阶段数据 - 确保所有字段都有值，包含7个标准阶段
  const generatePhasesForProject = (project) => {
    const baseDate = moment('2024-07-01');
    const projectStatus = project.itProjectStatus || 'AMBER';
    
    // 根据项目状态计算各阶段的状态和进度
    const isProjectCompleted = projectStatus === 'GREEN';
    const isProjectAtRisk = projectStatus === 'RED';
    const hasEscalation = project.escalation || false;
    
    const phases = [
      { 
        id: `${project.id}-1`, 
        phaseName: "ESTIMATED", 
        status: "COMPLETED", 
        startDate: baseDate.format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(14, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(14, 'days').format('YYYY-MM-DD'), 
        progressPercentage: 100, 
        isCompleted: true, 
        isOverdue: false,
        description: `${project.projectName} - Estimation and requirements analysis phase`
      },
      { 
        id: `${project.id}-2`, 
        phaseName: "PLANNING", 
        status: "COMPLETED", 
        startDate: baseDate.clone().add(15, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(29, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(15, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(29, 'days').format('YYYY-MM-DD'), 
        progressPercentage: 100, 
        isCompleted: true, 
        isOverdue: false,
        description: `${project.projectName} - Planning and design phase`
      },
      { 
        id: `${project.id}-3`, 
        phaseName: "DEVELOPMENT", 
        status: isProjectCompleted ? "COMPLETED" : (isProjectAtRisk ? "DELAYED" : "IN_PROGRESS"), 
        startDate: baseDate.clone().add(30, 'days').format('YYYY-MM-DD'), 
        endDate: isProjectCompleted ? baseDate.clone().add(89, 'days').format('YYYY-MM-DD') : baseDate.clone().add(75, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(30, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(89, 'days').format('YYYY-MM-DD'), 
        progressPercentage: isProjectCompleted ? 100 : (isProjectAtRisk ? Math.floor(Math.random() * 40 + 10) : Math.floor(Math.random() * 60 + 40)), 
        isCompleted: isProjectCompleted, 
        isOverdue: hasEscalation,
        description: `${project.projectName} - Development and implementation phase`
      },
      { 
        id: `${project.id}-4`, 
        phaseName: "SIT", 
        status: isProjectCompleted ? "COMPLETED" : "NOT_STARTED", 
        startDate: isProjectCompleted ? baseDate.clone().add(90, 'days').format('YYYY-MM-DD') : baseDate.clone().add(90, 'days').format('YYYY-MM-DD'), 
        endDate: isProjectCompleted ? baseDate.clone().add(119, 'days').format('YYYY-MM-DD') : baseDate.clone().add(119, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(90, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(119, 'days').format('YYYY-MM-DD'), 
        progressPercentage: isProjectCompleted ? 100 : 0, 
        isCompleted: isProjectCompleted, 
        isOverdue: false,
        description: `${project.projectName} - System Integration Testing phase`
      },
      { 
        id: `${project.id}-5`, 
        phaseName: "UAT", 
        status: isProjectCompleted ? "IN_PROGRESS" : "NOT_STARTED", 
        startDate: isProjectCompleted ? baseDate.clone().add(120, 'days').format('YYYY-MM-DD') : baseDate.clone().add(120, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(149, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(120, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(149, 'days').format('YYYY-MM-DD'), 
        progressPercentage: isProjectCompleted ? Math.floor(Math.random() * 40 + 20) : 0, 
        isCompleted: false, 
        isOverdue: false,
        description: `${project.projectName} - User Acceptance Testing phase`
      },
      { 
        id: `${project.id}-6`, 
        phaseName: "PPE", 
        status: "NOT_STARTED", 
        startDate: baseDate.clone().add(150, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(164, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(150, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(164, 'days').format('YYYY-MM-DD'), 
        progressPercentage: 0, 
        isCompleted: false, 
        isOverdue: false,
        description: `${project.projectName} - Pre-Production Environment testing phase`
      },
      { 
        id: `${project.id}-7`, 
        phaseName: "LIVE", 
        status: "NOT_STARTED", 
        startDate: baseDate.clone().add(165, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(179, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(165, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(179, 'days').format('YYYY-MM-DD'), 
        progressPercentage: 0, 
        isCompleted: false, 
        isOverdue: false,
        description: `${project.projectName} - Production deployment and go-live phase`
      }
    ];
    return phases;
  };

  const handlePhaseClick = (phase) => {
    setSelectedPhase(phase);
    form.setFieldsValue({
      ...phase,
      startDate: phase.startDate ? moment(phase.startDate) : null,
      endDate: phase.endDate ? moment(phase.endDate) : null,
      plannedStartDate: phase.plannedStartDate ? moment(phase.plannedStartDate) : null,
      plannedEndDate: phase.plannedEndDate ? moment(phase.plannedEndDate) : null
    });
    setIsModalVisible(true);
  };

  const handleUpdatePhase = async (values) => {
    try {
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        plannedStartDate: values.plannedStartDate ? values.plannedStartDate.format('YYYY-MM-DD') : null,
        plannedEndDate: values.plannedEndDate ? values.plannedEndDate.format('YYYY-MM-DD') : null,
      };

      if (onUpdatePhase) {
        await onUpdatePhase(selectedPhase.id, formattedValues);
      }
      
      setIsModalVisible(false);
      setSelectedPhase(null);
      loadGanttData();
      message.success('Phase updated successfully');
    } catch (error) {
      console.error('Error updating phase:', error);
      message.error('Failed to update phase');
    }
  };

  // 里程碑编辑相关函数
  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    milestoneForm.setFieldsValue({
      ...milestone,
      dueDate: milestone.dueDate ? moment(milestone.dueDate) : null,
      actualCompletionDate: milestone.actualCompletionDate ? moment(milestone.actualCompletionDate) : null
    });
    setIsMilestoneEditVisible(true);
  };

  const handleUpdateMilestone = async (values) => {
    try {
      const formattedValues = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
        actualCompletionDate: values.actualCompletionDate ? values.actualCompletionDate.format('YYYY-MM-DD') : null,
      };

      // 调用API更新里程碑
      await milestoneService.updateMilestoneProgress(editingMilestone.id, formattedValues);
      
      setIsMilestoneEditVisible(false);
      setEditingMilestone(null);
      loadGanttData();
      message.success('Milestone updated successfully');
    } catch (error) {
      console.error('Error updating milestone:', error);
      message.error('Failed to update milestone');
    }
  };

  // 阶段编辑相关函数
  const handleEditPhase = (phase) => {
    setEditingPhase(phase);
    phaseForm.setFieldsValue({
      ...phase,
      startDate: phase.startDate ? moment(phase.startDate) : null,
      endDate: phase.endDate ? moment(phase.endDate) : null,
      plannedStartDate: phase.plannedStartDate ? moment(phase.plannedStartDate) : null,
      plannedEndDate: phase.plannedEndDate ? moment(phase.plannedEndDate) : null
    });
    setIsPhaseEditVisible(true);
  };

  const handleUpdatePhaseInline = async (values) => {
    try {
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        plannedStartDate: values.plannedStartDate ? values.plannedStartDate.format('YYYY-MM-DD') : null,
        plannedEndDate: values.plannedEndDate ? values.plannedEndDate.format('YYYY-MM-DD') : null,
      };

      if (onUpdatePhase) {
        await onUpdatePhase(editingPhase.id, formattedValues);
      }
      
      setIsPhaseEditVisible(false);
      setEditingPhase(null);
      loadGanttData();
      message.success('Phase updated successfully');
    } catch (error) {
      console.error('Error updating phase:', error);
      message.error('Failed to update phase');
    }
  };

  // 带时间轴和里程碑的甘特图渲染函数
  const renderInlineGanttWithMilestones = (record) => {
    const startDate = moment().subtract(30, 'days');
    const endDate = moment().add(120, 'days');
    const totalDays = endDate.diff(startDate, 'days');
    const containerWidth = 800;

    return (
      <div style={{ width: '100%', minWidth: '800px' }}>
        {/* 甘特图条 - 增强版，显示计划vs实际日期 */}
        <div style={{ 
          display: 'flex', 
          height: '60px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '6px',
          position: 'relative',
          marginBottom: '12px',
          border: '1px solid #e8e8e8'
        }}>
          {record.phases.map((phase, index) => {
            const phaseStart = moment(phase.startDate);
            const phaseEnd = moment(phase.endDate);
            const plannedStart = moment(phase.plannedStartDate);
            const plannedEnd = moment(phase.plannedEndDate);
            
            // 计划时间线
            const plannedLeft = Math.max(0, (plannedStart.diff(startDate, 'days') / totalDays) * containerWidth);
            const plannedWidth = Math.max(16, (plannedEnd.diff(plannedStart, 'days') / totalDays) * containerWidth);
            
            // 实际时间线
            const actualLeft = Math.max(0, (phaseStart.diff(startDate, 'days') / totalDays) * containerWidth);
            const actualWidth = Math.max(16, (phaseEnd.diff(phaseStart, 'days') / totalDays) * containerWidth);
            
            // 根据阶段状态确定颜色
            let backgroundColor, plannedColor;
            if (phase.status === 'COMPLETED' || phase.progressPercentage === 100) {
              backgroundColor = '#52c41a'; // 绿色 - 已完成
              plannedColor = '#a0d911'; // 浅绿
            } else if (phase.status === 'IN_PROGRESS' || phase.progressPercentage > 0) {
              backgroundColor = '#1890ff'; // 蓝色 - 进行中
              plannedColor = '#69c0ff'; // 浅蓝
            } else {
              backgroundColor = '#d9d9d9'; // 灰色 - 未开始
              plannedColor = '#f0f0f0'; // 浅灰
            }

            return (
              <div key={phase.id} style={{ position: 'relative' }}>
                {/* 计划时间线 (上层) */}
                <Tooltip
                  title={
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{phase.phaseName} - Planned Timeline</div>
                      <div>Planned Start: {plannedStart.format('YYYY-MM-DD')}</div>
                      <div>Planned End: {plannedEnd.format('YYYY-MM-DD')}</div>
                      <div style={{ marginTop: '8px' }}>
                        <Button 
                          type="link" 
                          size="small" 
                          icon={<EditOutlined />}
                          onClick={() => handleEditPhase(phase)}
                          style={{ padding: '0', color: 'white' }}
                        >
                          Edit Phase
                        </Button>
                      </div>
                    </div>
                  }
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: `${plannedLeft}px`,
                      width: `${plannedWidth}px`,
                      height: '16px',
                      backgroundColor: plannedColor,
                      margin: '4px 0',
                      borderRadius: '4px 4px 0 0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                    onClick={() => handleEditPhase(phase)}
                  >
                    <div style={{
                      fontSize: '9px',
                      color: '#666',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      Planned
                    </div>
                  </div>
                </Tooltip>

                {/* 实际时间线 (下层) */}
                <Tooltip
                  title={
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{phase.phaseName} - Actual Timeline</div>
                      <div>Progress: {phase.progressPercentage}%</div>
                      <div>Actual Start: {phaseStart.format('YYYY-MM-DD')}</div>
                      <div>Actual End: {phaseEnd.format('YYYY-MM-DD')}</div>
                      <div>Status: {phase.status}</div>
                      <div style={{ marginTop: '8px' }}>
                        <Button 
                          type="link" 
                          size="small" 
                          icon={<EditOutlined />}
                          onClick={() => handleEditPhase(phase)}
                          style={{ padding: '0', color: 'white' }}
                        >
                          Edit Phase
                        </Button>
                      </div>
                    </div>
                  }
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: `${actualLeft}px`,
                      width: `${actualWidth}px`,
                      height: '20px',
                      backgroundColor,
                      margin: '20px 0 4px',
                      borderRadius: '0 0 4px 4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                    onClick={() => handleEditPhase(phase)}
                  >
                    <div style={{
                      fontSize: '10px',
                      color: backgroundColor === '#d9d9d9' ? '#666' : '#fff',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      {phase.progressPercentage}%
                    </div>
                  </div>
                </Tooltip>
              </div>
            );
          })}
        </div>

        {/* 里程碑标记 */}
        <div style={{ position: 'relative', height: '20px' }}>
          {record.milestones && record.milestones.map((milestone, index) => {
            const milestoneDate = moment(milestone.targetDate);
            const left = (milestoneDate.diff(startDate, 'days') / totalDays) * containerWidth;
            
            if (left >= 0 && left <= containerWidth) {
              return (
                <Tooltip
                  key={milestone.id}
                  title={
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>Milestone: {milestone.name}</div>
                      <div>Target Date: {milestoneDate.format('YYYY-MM-DD')}</div>
                      <div>Priority: {milestone.priority}</div>
                      <div style={{ marginTop: '8px' }}>
                        <Button 
                          type="link" 
                          size="small" 
                          icon={<EditOutlined />}
                          onClick={() => handleEditMilestone(milestone)}
                          style={{ padding: '0', color: 'white' }}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  }
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: `${left - 8}px`,
                      top: '2px',
                      width: '16px',
                      height: '16px',
                      backgroundColor: milestone.priority?.toLowerCase() === 'critical' ? '#ff4d4f' : 
                                     milestone.priority?.toLowerCase() === 'high' ? '#faad14' : 
                                     milestone.priority?.toLowerCase() === 'medium' ? '#1890ff' : '#52c41a',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      zIndex: 10
                    }}
                    onClick={() => handleEditMilestone(milestone)}
                  />
                </Tooltip>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      fixed: 'left',
      render: (text, record) => (
        <div style={{ minWidth: '180px' }}>
          <div style={{ fontWeight: '600', color: '#1890ff', marginBottom: '4px' }}>
            {text}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            Manager: {record.projectManager || 'N/A'}
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'overallStatus',
      key: 'status',
      width: 120,
      render: (status, record) => {
        const statusConfig = {
          'COMPLETED': { color: 'green', text: 'Completed' },
          'IN_PROGRESS': { color: 'blue', text: 'In Progress' },
          'AT_RISK': { color: 'red', text: 'At Risk' },
          'NOT_STARTED': { color: 'gray', text: 'Not Started' }
        };
        const config = statusConfig[status] || statusConfig['NOT_STARTED'];
        
        return (
          <div>
            <Tag color={config.color}>{config.text}</Tag>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              <Progress 
                percent={Math.round(record.completionRate || 0)} 
                size="small" 
                showInfo={false}
                strokeColor={config.color}
              />
              <span style={{ fontSize: '11px', color: '#666' }}>
                {Math.round(record.completionRate || 0)}%
              </span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Project Timeline & Milestones',
      key: 'gantt',
      width: 900,
      render: (_, record) => renderInlineGanttWithMilestones(record)
    }
  ];

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          <ProjectOutlined style={{ marginRight: '8px' }} />
          Project Gantt Chart
        </Title>
        
        <Space size="large">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Input.Search
              placeholder="Search projects..."
              allowClear
              style={{ width: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={loadGanttData}
              loading={isLoading}
            >
              Refresh
            </Button>
          </div>
        </Space>
      </div>

      <Card 
        title="Project Gantt Chart" 
        style={{ borderRadius: '8px', marginBottom: '20px' }}
        bodyStyle={{ padding: '12px' }}
      >
        <Table
          dataSource={filteredProjects}
          columns={columns}
          rowKey="id"
          loading={isLoading || loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} projects`
          }}
          size="middle"
          scroll={{ x: 1500 }}
        />
      </Card>

      {/* 项目日历 - 放在甘特图下方 */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarOutlined style={{ color: '#52c41a' }} />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>Project Calendar</span>
          </div>
        }
        style={{ borderRadius: '8px', marginBottom: '20px' }}
      >
        <Calendar
          fullscreen={false}
          style={{ 
            fontSize: '14px',
            width: '100%'
          }}
          dateCellRender={(value) => {
            const dateStr = value.format('YYYY-MM-DD');
            const milestonesForDate = ganttData.projects
              .flatMap(project => project.milestones || [])
              .filter(milestone => milestone.targetDate === dateStr);

            if (milestonesForDate.length > 0) {
              return (
                <div>
                  {milestonesForDate.map((milestone) => (
                    <Tooltip key={milestone.id} title={`${milestone.name} - Priority: ${milestone.priority}`}>
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#fff',
                          backgroundColor: milestone.priority?.toLowerCase() === 'critical' ? '#ff4d4f' : 
                                         milestone.priority?.toLowerCase() === 'high' ? '#faad14' : 
                                         milestone.priority?.toLowerCase() === 'medium' ? '#1890ff' : '#52c41a',
                          borderRadius: '2px',
                          padding: '1px 3px',
                          marginTop: '1px',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleEditMilestone(milestone)}
                      >
                        {milestone.name.length > 8 ? `${milestone.name.substring(0, 8)}...` : milestone.name}
                      </div>
                    </Tooltip>
                  ))}
                </div>
              );
            } else {
              return undefined;
            }
          }}
        />
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={8}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span style={{ fontSize: '16px', fontWeight: '600' }}>Project Completion Rate</span>
              </div>
            }
            style={{ borderRadius: '8px' }}
          >
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Project data will be displayed here
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClockCircleOutlined style={{ color: '#ff4d4f' }} />
                <span style={{ fontSize: '16px', fontWeight: '600' }}>Project Overdue Rate</span>
              </div>
            }
            style={{ borderRadius: '8px' }}
          >
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Overdue data will be displayed here
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ProjectOutlined style={{ color: '#1890ff' }} />
                <span style={{ fontSize: '16px', fontWeight: '600' }}>Phase Statistics</span>
              </div>
            }
            style={{ borderRadius: '8px' }}
          >
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Phase statistics will be displayed here
            </div>
          </Card>
        </Col>
      </Row>

      {/* 编辑阶段模态框 */}
      <Modal
        title="Edit Phase"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedPhase(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdatePhase}
          initialValues={selectedPhase}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Phase Name"
                name="phaseName"
                rules={[{ required: true, message: 'Please enter phase name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select>
                  <Option value="NOT_STARTED">Not Started</Option>
                  <Option value="IN_PROGRESS">In Progress</Option>
                  <Option value="COMPLETED">Completed</Option>
                  <Option value="DELAYED">Delayed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Start Date"
                name="startDate"
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="End Date"
                name="endDate"
                rules={[{ required: true, message: 'Please select end date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Planned Start Date"
                name="plannedStartDate"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Planned End Date"
                name="plannedEndDate"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Progress (%)"
            name="progressPercentage"
            rules={[{ required: true, message: 'Please enter progress' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Phase
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 里程碑编辑模态框 */}
      <Modal
        title="Edit Milestone"
        open={isMilestoneEditVisible}
        onCancel={() => {
          setIsMilestoneEditVisible(false);
          setEditingMilestone(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={milestoneForm}
          layout="vertical"
          onFinish={handleUpdateMilestone}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Milestone Name"
                name="name"
                rules={[{ required: true, message: 'Please enter milestone name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Priority"
                name="priority"
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select>
                  <Option value="CRITICAL">Critical</Option>
                  <Option value="HIGH">High</Option>
                  <Option value="MEDIUM">Medium</Option>
                  <Option value="LOW">Low</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select>
                  <Option value="NOT_STARTED">Not Started</Option>
                  <Option value="IN_PROGRESS">In Progress</Option>
                  <Option value="COMPLETED">Completed</Option>
                  <Option value="DELAYED">Delayed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Progress (%)"
                name="progressPercentage"
                rules={[{ required: true, message: 'Please enter progress' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Target Date"
                name="dueDate"
                rules={[{ required: true, message: 'Please select target date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Actual Completion Date"
                name="actualCompletionDate"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Owner"
            name="owner"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Deliverables"
            name="deliverables"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Dependencies"
            name="dependencies"
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            label="Success Criteria"
            name="successCriteria"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Milestone
              </Button>
              <Button onClick={() => setIsMilestoneEditVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 阶段编辑模态框 */}
      <Modal
        title="Edit Phase"
        open={isPhaseEditVisible}
        onCancel={() => {
          setIsPhaseEditVisible(false);
          setEditingPhase(null);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={phaseForm}
          layout="vertical"
          onFinish={handleUpdatePhaseInline}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Phase Name"
                name="phaseName"
                rules={[{ required: true, message: 'Please enter phase name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select>
                  <Option value="NOT_STARTED">Not Started</Option>
                  <Option value="IN_PROGRESS">In Progress</Option>
                  <Option value="COMPLETED">Completed</Option>
                  <Option value="DELAYED">Delayed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Progress (%)"
                name="progressPercentage"
                rules={[{ required: true, message: 'Please enter progress' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Is Completed"
                name="isCompleted"
              >
                <Select>
                  <Option value={true}>Yes</Option>
                  <Option value={false}>No</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Planned Start Date"
                name="plannedStartDate"
                rules={[{ required: true, message: 'Please select planned start date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Planned End Date"
                name="plannedEndDate"
                rules={[{ required: true, message: 'Please select planned end date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Actual Start Date"
                name="startDate"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Actual End Date"
                name="endDate"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Phase
              </Button>
              <Button onClick={() => setIsPhaseEditVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GanttChart;
