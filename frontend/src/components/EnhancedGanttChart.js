// Enhanced GanttChart.js - 用户友好的甘特图设计
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Progress,
  Tag,
  Typography,
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
  ProjectOutlined,
  DashboardOutlined,
  TeamOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  EditOutlined,
  WarningOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './EnhancedGanttChart.css';
import milestoneService from '../services/milestoneService';
import projectPhaseService from '../services/projectPhaseService';

const { Title } = Typography;
const { Option } = Select;

const EnhancedGanttChart = ({ loading, onUpdatePhase, projects = [] }) => {
  const [ganttData, setGanttData] = useState({ projects: [], statistics: {}, phaseStatistics: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  
  // 编辑功能的状态
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [isMilestoneEditVisible, setIsMilestoneEditVisible] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [isPhaseEditVisible, setIsPhaseEditVisible] = useState(false);
  const [milestoneForm] = Form.useForm();
  const [phaseForm] = Form.useForm();
  
  // 时间轴可调整大小的状态
  const [timelineWidth, setTimelineWidth] = useState(1000);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState('quarters'); // quarters, months, weeks

  // 标准项目阶段定义 - 按正确顺序
  const STANDARD_PHASES = [
    { name: 'ESTIMATED', label: 'Estimation', color: '#722ed1', description: 'Requirements analysis and estimation' },
    { name: 'PLANNING', label: 'Planning', color: '#13c2c2', description: 'Project planning and design' },
    { name: 'DEVELOPMENT', label: 'Development', color: '#1890ff', description: 'Development and implementation' },
    { name: 'SIT', label: 'SIT', color: '#52c41a', description: 'System Integration Testing' },
    { name: 'UAT', label: 'UAT', color: '#faad14', description: 'User Acceptance Testing' },
    { name: 'PPE', label: 'PPE', color: '#fa8c16', description: 'Pre-Production Environment' },
    { name: 'LIVE', label: 'LIVE', color: '#f5222d', description: 'Production deployment and go-live' }
  ];

  const loadGanttData = useCallback(async () => {
    setIsLoading(true);
    try {
      const convertedProjects = projects.map(project => {
        const phases = generateStandardPhasesForProject(project);
        const completedPhases = phases.filter(p => p.status === 'COMPLETED').length;
        const inProgressPhases = phases.filter(p => p.status === 'IN_PROGRESS').length;
        const delayedPhases = phases.filter(p => p.status === 'DELAYED' || p.isOverdue).length;
        
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
          completionRate: Math.round((completedPhases / phases.length) * 100)
        };
      });

      const statistics = {
        totalProjects: convertedProjects.length,
        completedProjects: convertedProjects.filter(p => p.overallStatus === 'COMPLETED').length,
        inProgressProjects: convertedProjects.filter(p => p.overallStatus === 'IN_PROGRESS').length,
        atRiskProjects: convertedProjects.filter(p => p.overallStatus === 'AT_RISK').length
      };

      const phaseStatistics = STANDARD_PHASES.map(standardPhase => {
        const phaseData = convertedProjects.flatMap(p => p.phases).filter(phase => phase.phaseName === standardPhase.name);
        return {
          phaseName: standardPhase.name,
          label: standardPhase.label,
          color: standardPhase.color,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  useEffect(() => {
    loadGanttData();
  }, [loadGanttData]);

  useEffect(() => {
    if (searchText) {
      const filtered = ganttData.projects.filter(project =>
        project.projectName?.toLowerCase().includes(searchText.toLowerCase()) ||
        project.projectManager?.toLowerCase().includes(searchText.toLowerCase()) ||
        (project.team && project.team.name?.toLowerCase().includes(searchText.toLowerCase())) ||
        (project.lead && project.lead.name?.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(ganttData.projects);
    }
  }, [searchText, ganttData.projects]);

  // 为项目生成标准7阶段数据
  const generateStandardPhasesForProject = (project) => {
    // 使用当前日期作为基准，动态生成项目阶段
    const currentDate = dayjs();
    const projectStartDate = project.startDate ? dayjs(project.startDate) : currentDate.subtract(4, 'months');
    const projectStatus = project.itProjectStatus || 'AMBER';
    
    const isProjectCompleted = projectStatus === 'GREEN';
    const isProjectAtRisk = projectStatus === 'RED';
    const hasEscalation = project.escalation || false;
    
    return STANDARD_PHASES.map((standardPhase, index) => {
      const phaseStartDays = index * 30; // 每个阶段间隔30天
      const phaseDuration = standardPhase.name === 'DEVELOPMENT' ? 60 : 
                           standardPhase.name === 'SIT' || standardPhase.name === 'UAT' ? 30 : 
                           standardPhase.name === 'PPE' || standardPhase.name === 'LIVE' ? 15 : 14;
      
      const plannedStart = projectStartDate.add(phaseStartDays, 'days');
      const plannedEnd = plannedStart.add(phaseDuration, 'days');
      const actualStart = plannedStart.add(Math.floor(Math.random() * 5 - 2), 'days'); // ±2天随机偏差
      const actualEnd = plannedEnd.add(Math.floor(Math.random() * 10 - 5), 'days'); // ±5天随机偏差
      
      // 根据项目状态、阶段顺序和当前日期确定状态
      let status = 'NOT_STARTED';
      let progressPercentage = 0;
      
      // 基于当前日期的动态状态计算
      const now = currentDate;
      const phaseHasStarted = now.isAfter(plannedStart);
      const phaseHasEnded = now.isAfter(plannedEnd);
      const phaseProgress = phaseHasStarted ? Math.min(100, Math.max(0, now.diff(plannedStart, 'days') / phaseDuration * 100)) : 0;
      
      if (phaseHasEnded || (isProjectCompleted && index <= 3)) {
        status = 'COMPLETED';
        progressPercentage = 100;
      } else if (phaseHasStarted) {
        if (isProjectAtRisk && phaseProgress < 80) {
          status = 'DELAYED';
          progressPercentage = Math.floor(phaseProgress * 0.7); // 延迟项目进度较慢
        } else {
          status = 'IN_PROGRESS';
          progressPercentage = Math.floor(phaseProgress + Math.random() * 20 - 10); // 添加一些随机性
          progressPercentage = Math.max(10, Math.min(95, progressPercentage)); // 确保在合理范围内
        }
      } else {
        status = 'NOT_STARTED';
        progressPercentage = 0;
      }
      
      return {
        id: `${project.id}-${index + 1}`,
        phaseName: standardPhase.name,
        phaseLabel: standardPhase.label,
        phaseColor: standardPhase.color,
        status,
        startDate: actualStart.format('YYYY-MM-DD'),
        endDate: actualEnd.format('YYYY-MM-DD'),
        plannedStartDate: plannedStart.format('YYYY-MM-DD'),
        plannedEndDate: plannedEnd.format('YYYY-MM-DD'),
        progressPercentage,
        isCompleted: status === 'COMPLETED',
        isOverdue: status === 'DELAYED' || (hasEscalation && index >= 2),
        description: `${project.projectName} - ${standardPhase.description}`,
        duration: phaseDuration,
        plannedDuration: phaseDuration
      };
    });
  };

  // 增强的甘特图渲染函数
  const renderEnhancedGantt = (record) => {
    // 动态计算时间范围：当前日期前后6个月
    const currentDate = dayjs();
    const startDate = currentDate.subtract(6, 'months').startOf('month');
    const endDate = currentDate.add(6, 'months').endOf('month');
    const totalDays = endDate.diff(startDate, 'days');
    const containerWidth = timelineWidth;

    // 生成时间标记 - 支持不同视图模式
    const generateTimeMarkers = () => {
      const markers = [];
      if (viewMode === 'quarters') {
        let currentDate = startDate.startOf('quarter');
        while (currentDate.isBefore(endDate)) {
          const left = Math.max(0, (currentDate.diff(startDate, 'days') / totalDays) * containerWidth);
          const nextQuarter = currentDate.add(3, 'months');
          const width = Math.min(
            (nextQuarter.diff(currentDate, 'days') / totalDays) * containerWidth,
            containerWidth - left
          );
          
          if (left >= 0 && left < containerWidth) {
            markers.push({
              left,
              width,
              label: currentDate.format('Q[Q] YYYY'),
              type: 'quarter',
              isCurrentPeriod: currentDate.isSame(dayjs(), 'quarter')
            });
          }
          currentDate = nextQuarter;
        }
      } else if (viewMode === 'months') {
        let currentDate = startDate.startOf('month');
        while (currentDate.isBefore(endDate)) {
          const left = Math.max(0, (currentDate.diff(startDate, 'days') / totalDays) * containerWidth);
          const nextMonth = currentDate.add(1, 'month');
          const width = Math.min(
            (nextMonth.diff(currentDate, 'days') / totalDays) * containerWidth,
            containerWidth - left
          );
          
          if (left >= 0 && left < containerWidth) {
            markers.push({
              left,
              width,
              label: currentDate.format('MMM YYYY'),
              type: 'month',
              isCurrentPeriod: currentDate.isSame(dayjs(), 'month')
            });
          }
          currentDate = nextMonth;
        }
      }
      return markers;
    };

    const timeMarkers = generateTimeMarkers();

    // 处理鼠标拖拽调整时间轴宽度
    const handleMouseDown = (e) => {
      setIsDragging(true);
      const startX = e.clientX;
      const startWidth = timelineWidth;

      const handleMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(600, Math.min(1600, startWidth + deltaX));
        setTimelineWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const phaseHeight = 45; // 每个阶段的高度
    const totalHeight = STANDARD_PHASES.length * phaseHeight + 40; // 总高度

    return (
      <div style={{ width: '100%', minWidth: '600px', position: 'relative', marginBottom: '20px' }}>
        {/* 项目信息头部 */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '6px 6px 0 0',
          padding: '12px 16px',
          borderLeft: '4px solid #1890ff',
          marginBottom: '0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                {record.projectName}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <span>Team: {record.team?.name || 'N/A'}</span>
                <span style={{ margin: '0 12px' }}>•</span>
                <span>Lead: {record.lead?.name || 'N/A'}</span>
                <span style={{ margin: '0 12px' }}>•</span>
                <span>Overall Progress: {record.completionRate}%</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Progress 
                type="circle" 
                percent={record.completionRate} 
                size={48}
                strokeWidth={8}
                strokeColor={{
                  '0%': record.completionRate < 30 ? '#ff4d4f' : record.completionRate < 70 ? '#faad14' : '#52c41a',
                  '100%': record.completionRate < 30 ? '#ff4d4f' : record.completionRate < 70 ? '#faad14' : '#52c41a'
                }}
              />
              <Tag color={record.statusColor === 'GREEN' ? 'success' : record.statusColor === 'RED' ? 'error' : 'warning'}>
                {record.overallStatus}
              </Tag>
            </div>
          </div>
        </div>

        {/* 时间轴 */}
        <div style={{ 
          height: '36px', 
          backgroundColor: '#fafafa', 
          border: '1px solid #e8e8e8',
          borderTop: 'none',
          position: 'relative',
          width: `${containerWidth}px`,
          cursor: isDragging ? 'col-resize' : 'default'
        }}>
          {timeMarkers.map((marker, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${marker.left}px`,
                width: `${marker.width}px`,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: marker.isCurrentPeriod ? '600' : '400',
                color: marker.isCurrentPeriod ? '#1890ff' : '#666',
                borderRight: index < timeMarkers.length - 1 ? '1px solid #e8e8e8' : 'none',
                userSelect: 'none',
                backgroundColor: marker.isCurrentPeriod ? '#e6f7ff' : 'transparent'
              }}
            >
              {marker.label}
            </div>
          ))}
          
          {/* 当前日期标记线 */}
          {(() => {
            const today = dayjs();
            const currentDatePosition = (today.diff(startDate, 'days') / totalDays) * containerWidth;
            if (currentDatePosition >= 0 && currentDatePosition <= containerWidth) {
              return (
                <div
                  style={{
                    position: 'absolute',
                    left: `${currentDatePosition}px`,
                    top: '0',
                    width: '2px',
                    height: '100%',
                    backgroundColor: '#ff4d4f',
                    zIndex: 15,
                    boxShadow: '0 0 4px rgba(255, 77, 79, 0.5)'
                  }}
                />
              );
            }
            return null;
          })()}
          
          {/* 拖拽手柄 */}
          <div
            style={{
              position: 'absolute',
              right: '-5px',
              top: '0',
              width: '10px',
              height: '100%',
              cursor: 'col-resize',
              backgroundColor: 'transparent',
              zIndex: 10
            }}
            onMouseDown={handleMouseDown}
          />
        </div>

        {/* 阶段甘特图主体 */}
        <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e8e8e8',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
          position: 'relative',
          width: `${containerWidth}px`,
          height: `${totalHeight}px`,
          overflow: 'visible'
        }}>
          {/* 当前日期标记线 - 延伸到甘特图区域 */}
          {(() => {
            const today = dayjs();
            const currentDatePosition = (today.diff(startDate, 'days') / totalDays) * containerWidth;
            if (currentDatePosition >= 0 && currentDatePosition <= containerWidth) {
              return (
                <div
                  style={{
                    position: 'absolute',
                    left: `${currentDatePosition}px`,
                    top: '0',
                    width: '2px',
                    height: '100%',
                    backgroundColor: '#ff4d4f',
                    zIndex: 20,
                    boxShadow: '0 0 4px rgba(255, 77, 79, 0.5)',
                    opacity: 0.8
                  }}
                />
              );
            }
            return null;
          })()}
          
          {STANDARD_PHASES.map((standardPhase, phaseIndex) => {
            const phase = record.phases.find(p => p.phaseName === standardPhase.name);
            const yPosition = phaseIndex * phaseHeight + 8;

            if (!phase) {
              // 显示未计划的阶段
              return (
                <div key={standardPhase.name} style={{
                  position: 'absolute',
                  top: `${yPosition}px`,
                  left: '12px',
                  right: '12px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  border: '1px dashed #d9d9d9',
                  padding: '0 12px'
                }}>
                  <div style={{ 
                    width: '120px', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#999' 
                  }}>
                    {standardPhase.label}
                  </div>
                  <span style={{ fontSize: '11px', color: '#999' }}>Not planned</span>
                </div>
              );
            }

            const phaseStart = dayjs(phase.startDate);
            const phaseEnd = dayjs(phase.endDate);
            const plannedStart = dayjs(phase.plannedStartDate);
            const plannedEnd = dayjs(phase.plannedEndDate);
            
            // 计算位置和宽度
            const plannedLeft = Math.max(0, (plannedStart.diff(startDate, 'days') / totalDays) * (containerWidth - 24)) + 12;
            const plannedWidth = Math.max(20, (plannedEnd.diff(plannedStart, 'days') / totalDays) * (containerWidth - 24));
            
            const actualLeft = Math.max(0, (phaseStart.diff(startDate, 'days') / totalDays) * (containerWidth - 24)) + 12;
            const actualWidth = Math.max(20, (phaseEnd.diff(phaseStart, 'days') / totalDays) * (containerWidth - 24));
            
            // 根据阶段状态确定颜色
            let statusColor = standardPhase.color;
            let statusBg = statusColor;
            let progressColor = statusColor;
            
            if (phase.status === 'COMPLETED') {
              statusBg = '#52c41a';
              progressColor = '#52c41a';
            } else if (phase.status === 'DELAYED') {
              statusBg = '#ff4d4f';
              progressColor = '#ff4d4f';
            } else if (phase.status === 'IN_PROGRESS') {
              statusBg = '#1890ff';
              progressColor = '#1890ff';
            }

            return (
              <div key={phase.id} style={{
                position: 'absolute',
                top: `${yPosition}px`,
                left: '0',
                right: '0',
                height: '36px',
                borderBottom: phaseIndex < STANDARD_PHASES.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}>
                {/* 阶段标签 */}
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  width: '120px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#333',
                  zIndex: 5
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: statusBg,
                    marginRight: '8px'
                  }} />
                  {phase.phaseLabel}
                </div>
                
                {/* 计划时间条 (背景) */}
                <Tooltip
                  title={
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '6px' }}>
                        {phase.phaseLabel} - Planned Timeline
                      </div>
                      <div>Planned: {plannedStart.format('MMM DD')} - {plannedEnd.format('MMM DD, YYYY')}</div>
                      <div>Duration: {phase.plannedDuration} days</div>
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
                      height: '14px',
                      backgroundColor: `${statusColor}40`, // 透明背景
                      border: `1px solid ${statusColor}`,
                      borderRadius: '2px',
                      top: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleEditPhase(phase)}
                  />
                </Tooltip>

                {/* 实际进度条 */}
                <Tooltip
                  title={
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '6px' }}>
                        {phase.phaseLabel} - Actual Progress
                      </div>
                      <div>Progress: {phase.progressPercentage}%</div>
                      <div>Actual: {phaseStart.format('MMM DD')} - {phaseEnd.format('MMM DD, YYYY')}</div>
                      <div>Status: {phase.status}</div>
                      <div>Duration: {phase.duration} days</div>
                      {phase.status === 'DELAYED' && (
                        <div style={{ color: '#ff4d4f', marginTop: '4px' }}>
                          <WarningOutlined /> This phase is delayed
                        </div>
                      )}
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
                      height: '14px',
                      backgroundColor: statusBg,
                      borderRadius: '2px',
                      top: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onClick={() => handleEditPhase(phase)}
                  >
                    {/* 进度填充 */}
                    <div style={{
                      width: `${phase.progressPercentage}%`,
                      height: '100%',
                      backgroundColor: progressColor,
                      transition: 'width 0.3s ease'
                    }} />
                    
                    {/* 进度文字 */}
                    {actualWidth > 40 && (
                      <div style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '10px',
                        color: '#fff',
                        fontWeight: '600',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}>
                        {phase.progressPercentage}%
                      </div>
                    )}
                  </div>
                </Tooltip>

                {/* 状态图标 */}
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {phase.status === 'COMPLETED' && (
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                  )}
                  {phase.status === 'IN_PROGRESS' && (
                    <PlayCircleOutlined style={{ color: '#1890ff', fontSize: '14px' }} />
                  )}
                  {phase.status === 'DELAYED' && (
                    <WarningOutlined style={{ color: '#ff4d4f', fontSize: '14px' }} />
                  )}
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#666', 
                    textAlign: 'right',
                    lineHeight: '1.2'
                  }}>
                    <div>P: {plannedStart.format('MM/DD')} - {plannedEnd.format('MM/DD')}</div>
                    <div>A: {phaseStart.format('MM/DD')} - {phaseEnd.format('MM/DD')}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 里程碑标记 */}
        {record.milestones && record.milestones.length > 0 && (
          <div style={{ position: 'relative', height: '24px', marginTop: '8px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '6px'
            }}>
              Key Milestones:
            </div>
            {record.milestones.map((milestone, index) => {
              const milestoneDate = dayjs(milestone.targetDate);
              const left = Math.max(0, (milestoneDate.diff(startDate, 'days') / totalDays) * (containerWidth - 24)) + 12;
              
              if (left >= 12 && left <= containerWidth - 12) {
                return (
                  <Tooltip
                    key={milestone.id}
                    title={
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          Milestone: {milestone.name}
                        </div>
                        <div>Target Date: {milestoneDate.format('YYYY-MM-DD')}</div>
                        <div>Priority: {milestone.priority}</div>
                        <div>Status: {milestone.status}</div>
                        <div style={{ marginTop: '8px' }}>
                          <Button 
                            type="link" 
                            size="small" 
                            icon={<EditOutlined />}
                            onClick={() => handleEditMilestone(milestone)}
                            style={{ padding: '0', color: 'white' }}
                          >
                            Edit Milestone
                          </Button>
                        </div>
                      </div>
                    }
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: `${left - 6}px`,
                        top: '0',
                        width: '12px',
                        height: '12px',
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
        )}
      </div>
    );
  };

  // 阶段编辑处理函数
  const handleEditPhase = (phase) => {
    setEditingPhase(phase);
    phaseForm.setFieldsValue({
      ...phase,
      startDate: phase.startDate ? dayjs(phase.startDate) : null,
      endDate: phase.endDate ? dayjs(phase.endDate) : null,
      plannedStartDate: phase.plannedStartDate ? dayjs(phase.plannedStartDate) : null,
      plannedEndDate: phase.plannedEndDate ? dayjs(phase.plannedEndDate) : null
    });
    setIsPhaseEditVisible(true);
  };

  // 里程碑编辑处理函数
  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    milestoneForm.setFieldsValue({
      ...milestone,
      dueDate: milestone.targetDate ? dayjs(milestone.targetDate) : null,
      actualCompletionDate: milestone.actualCompletionDate ? dayjs(milestone.actualCompletionDate) : null
    });
    setIsMilestoneEditVisible(true);
  };

  // 更新阶段
  const handleUpdatePhaseInline = async (values) => {
    try {
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        plannedStartDate: values.plannedStartDate ? values.plannedStartDate.format('YYYY-MM-DD') : null,
        plannedEndDate: values.plannedEndDate ? values.plannedEndDate.format('YYYY-MM-DD') : null,
        progressPercentage: values.progressPercentage || 0
      };

      await projectPhaseService.updateProjectPhase(editingPhase.id, formattedValues);
      
      setIsPhaseEditVisible(false);
      setEditingPhase(null);
      loadGanttData();
      message.success('Phase updated successfully');
    } catch (error) {
      console.error('Error updating phase:', error);
      message.error('Failed to update phase');
    }
  };

  // 更新里程碑
  const handleUpdateMilestone = async (values) => {
    try {
      const formattedValues = {
        ...values,
        targetDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
        actualCompletionDate: values.actualCompletionDate ? values.actualCompletionDate.format('YYYY-MM-DD') : null,
      };

      await milestoneService.updateMilestone(editingMilestone.id, formattedValues);
      
      setIsMilestoneEditVisible(false);
      setEditingMilestone(null);
      loadGanttData();
      message.success('Milestone updated successfully');
    } catch (error) {
      console.error('Error updating milestone:', error);
      message.error('Failed to update milestone');
    }
  };

  const columns = [
    {
      title: 'Project Information',
      key: 'projectInfo',
      width: 300,
      fixed: 'left',
      render: (_, record) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#1890ff', 
            marginBottom: '4px',
            cursor: 'pointer'
          }}>
            {record.projectName}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            <TeamOutlined style={{ marginRight: '4px' }} />
            {record.team?.name || 'No team assigned'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Lead: {record.lead?.name || 'Not assigned'}
          </div>
        </div>
      )
    },
    {
      title: 'Project Gantt Timeline',
      key: 'gantt',
      width: timelineWidth + 100,
      render: (_, record) => renderEnhancedGantt(record)
    }
  ];

  return (
    <div className="enhanced-gantt-chart" style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 头部控制区域 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            <ProjectOutlined style={{ marginRight: '8px' }} />
            Enhanced Project Gantt Chart
          </Title>
          <div style={{ color: '#666', marginTop: '4px' }}>
            Comprehensive project timeline with 7 standard phases
          </div>
        </div>
        
        <Space size="large">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            backgroundColor: '#e6f7ff',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #91d5ff'
          }}>
            <div style={{ fontSize: '11px', color: '#1890ff', fontWeight: '600' }}>
              Timeline Range
            </div>
            <div style={{ fontSize: '12px', color: '#333', fontWeight: '500' }}>
              {(() => {
                const currentDate = dayjs();
                const startDate = currentDate.subtract(6, 'months').startOf('month');
                const endDate = currentDate.add(6, 'months').endOf('month');
                return `${startDate.format('MMM YYYY')} - ${endDate.format('MMM YYYY')}`;
              })()}
            </div>
          </div>
          
          <Select
            value={viewMode}
            onChange={setViewMode}
            style={{ width: 120 }}
          >
            <Option value="quarters">Quarters</Option>
            <Option value="months">Months</Option>
          </Select>
          
          <Input.Search
            placeholder="Search projects..."
            allowClear
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Space>
      </div>

      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#1890ff' }}>
                {ganttData.statistics.totalProjects}
              </div>
              <div style={{ color: '#666' }}>Total Projects</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#52c41a' }}>
                {ganttData.statistics.completedProjects}
              </div>
              <div style={{ color: '#666' }}>Completed</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#faad14' }}>
                {ganttData.statistics.inProgressProjects}
              </div>
              <div style={{ color: '#666' }}>In Progress</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#ff4d4f' }}>
                {ganttData.statistics.atRiskProjects}
              </div>
              <div style={{ color: '#666' }}>At Risk</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 阶段统计 */}
      <Card 
        title="Phase Statistics" 
        style={{ marginBottom: '20px' }}
        size="small"
      >
        <Row gutter={16}>
          {ganttData.phaseStatistics.map((phaseStat) => (
            <Col span={24/7} key={phaseStat.phaseName}>
              <div style={{ textAlign: 'center', padding: '8px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: phaseStat.color,
                  marginBottom: '4px' 
                }}>
                  {phaseStat.label}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {phaseStat.completedCount}/{phaseStat.totalCount}
                </div>
                <Progress 
                  percent={phaseStat.totalCount > 0 ? Math.round((phaseStat.completedCount / phaseStat.totalCount) * 100) : 0} 
                  size="small" 
                  showInfo={false}
                  strokeColor={phaseStat.color}
                />
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 主甘特图表格 */}
      <Card 
        title="Project Timeline View" 
        style={{ borderRadius: '8px' }}
        styles={{ body: { padding: '0' } }}
      >
        <Table
          dataSource={filteredProjects}
          columns={columns}
          rowKey="id"
          loading={isLoading || loading}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} projects`
          }}
          size="small"
          scroll={{ x: timelineWidth + 400 }}
          rowClassName={() => 'gantt-row'}
        />
      </Card>

      {/* 阶段编辑模态框 */}
      <Modal
        title={`Edit Phase: ${editingPhase?.phaseLabel}`}
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
                name="progress"
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
    </div>
  );
};

export default EnhancedGanttChart;
