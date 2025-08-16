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
  EditOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './GanttChart.css';
import milestoneService from '../services/milestoneService';
import projectPhaseService from '../services/projectPhaseService';

const { Title } = Typography;
const { Option } = Select;

const GanttChart = ({ loading, onUpdatePhase, projects = [] }) => {
  const [ganttData, setGanttData] = useState({ projects: [], statistics: {}, phaseStatistics: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [displayProjects, setDisplayProjects] = useState([]);
  const [form] = Form.useForm();
  
  // 新增编辑功能的状�?
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [isMilestoneEditVisible, setIsMilestoneEditVisible] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [isPhaseEditVisible, setIsPhaseEditVisible] = useState(false);
  const [milestoneForm] = Form.useForm();
  const [phaseForm] = Form.useForm();
  
  // 新增月份时间轴可调整大小的状态
  const [timelineWidth, setTimelineWidth] = useState(800);
  const [isDragging, setIsDragging] = useState(false);
  
  // 项目阶段编辑相关状态
  const [editingProject, setEditingProject] = useState(null);
  const [isProjectEditVisible, setIsProjectEditVisible] = useState(false);
  const [projectPhases, setProjectPhases] = useState([]);

  // 为项目生成阶段数据 - 确保所有字段都有值，包含7个标准阶段
  const generatePhasesForProject = useCallback((project) => {
    // 使用2025年初作为项目开始基准日期
    const baseDate = dayjs('2025-01-01').startOf('year');
    const projectStatus = project.itProjectStatus || 'AMBER';
    
    // 根据项目状态计算各阶段的状态和进度
    const hasEscalation = project.escalation || false;
    
    // 计算当前日期在2025年内的进度，用于动态设置阶段状态
    const currentDate = dayjs();
    const year2025Start = dayjs('2025-01-01');
    const year2025End = dayjs('2025-12-31');
    const yearProgress = currentDate.isAfter(year2025End) ? 1 : 
                        currentDate.isBefore(year2025Start) ? 0 :
                        currentDate.diff(year2025Start, 'days') / year2025End.diff(year2025Start, 'days');
    
    const phases = [
      { 
        id: `${project.id}-1`, 
        phaseName: "EST", 
        status: "COMPLETED", 
        startDate: baseDate.format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(30, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(30, 'days').format('YYYY-MM-DD'), 
        progressPercentage: 100, 
        isCompleted: true, 
        isOverdue: false,
        description: `${project.projectName} - Estimation and initial analysis phase`
      },
      { 
        id: `${project.id}-2`, 
        phaseName: "PLAN", 
        status: yearProgress > 0.1 ? "COMPLETED" : "IN_PROGRESS", 
        startDate: baseDate.clone().add(31, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(75, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(31, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(75, 'days').format('YYYY-MM-DD'), 
        progressPercentage: yearProgress > 0.1 ? 100 : Math.min(100, Math.max(0, Math.floor(yearProgress * 1000))), 
        isCompleted: yearProgress > 0.1, 
        isOverdue: false,
        description: `${project.projectName} - Planning and design phase`
      },
      { 
        id: `${project.id}-3`, 
        phaseName: "DEV", 
        status: yearProgress > 0.6 ? "COMPLETED" : (yearProgress > 0.2 ? "IN_PROGRESS" : "NOT_STARTED"), 
        startDate: baseDate.clone().add(76, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(210, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(76, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(210, 'days').format('YYYY-MM-DD'), 
        progressPercentage: yearProgress > 0.6 ? 100 : (yearProgress > 0.2 ? Math.min(100, Math.max(0, Math.floor((yearProgress - 0.2) * 250))) : 0), 
        isCompleted: yearProgress > 0.6, 
        isOverdue: hasEscalation,
        description: `${project.projectName} - Development and implementation phase`
      },
      { 
        id: `${project.id}-4`, 
        phaseName: "SIT", 
        status: yearProgress > 0.75 ? "COMPLETED" : (yearProgress > 0.6 ? "IN_PROGRESS" : "NOT_STARTED"), 
        startDate: baseDate.clone().add(211, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(255, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(211, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(255, 'days').format('YYYY-MM-DD'), 
        progressPercentage: yearProgress > 0.75 ? 100 : (yearProgress > 0.6 ? Math.min(100, Math.max(0, Math.floor((yearProgress - 0.6) * 667))) : 0), 
        isCompleted: yearProgress > 0.75, 
        isOverdue: false,
        description: `${project.projectName} - System Integration Testing phase`
      },
      { 
        id: `${project.id}-5`, 
        phaseName: "UAT", 
        status: yearProgress > 0.85 ? "COMPLETED" : (yearProgress > 0.75 ? "IN_PROGRESS" : "NOT_STARTED"), 
        startDate: baseDate.clone().add(256, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(300, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(256, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(300, 'days').format('YYYY-MM-DD'), 
        progressPercentage: yearProgress > 0.85 ? 100 : (yearProgress > 0.75 ? Math.min(100, Math.max(0, Math.floor((yearProgress - 0.75) * 1000))) : 0), 
        isCompleted: yearProgress > 0.85, 
        isOverdue: false,
        description: `${project.projectName} - User Acceptance Testing phase`
      },
      { 
        id: `${project.id}-6`, 
        phaseName: "PPE", 
        status: yearProgress > 0.92 ? "COMPLETED" : (yearProgress > 0.85 ? "IN_PROGRESS" : "NOT_STARTED"), 
        startDate: baseDate.clone().add(301, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(330, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(301, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(330, 'days').format('YYYY-MM-DD'), 
        progressPercentage: yearProgress > 0.92 ? 100 : (yearProgress > 0.85 ? Math.min(100, Math.max(0, Math.floor((yearProgress - 0.85) * 1429))) : 0), 
        isCompleted: yearProgress > 0.92, 
        isOverdue: false,
        description: `${project.projectName} - Pre-Production Environment setup and testing phase`
      },
      { 
        id: `${project.id}-7`, 
        phaseName: "LIVE", 
        status: yearProgress > 0.98 ? "COMPLETED" : (yearProgress > 0.92 ? "IN_PROGRESS" : "NOT_STARTED"), 
        startDate: baseDate.clone().add(331, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(365, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(331, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(365, 'days').format('YYYY-MM-DD'), 
        progressPercentage: yearProgress > 0.98 ? 100 : (yearProgress > 0.92 ? Math.min(100, Math.max(0, Math.floor((yearProgress - 0.92) * 1667))) : 0), 
        isCompleted: yearProgress > 0.98, 
        isOverdue: false,
        description: `${project.projectName} - Production deployment and go-live phase`
      }
    ];

    return phases;
  }, []);

  const loadGanttData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 获取所有项目的阶段数据
      const projectsWithPhases = await Promise.all(
        projects.map(async (project) => {
          try {
            // 从数据库获取项目的真实阶段数据
            const phases = await projectPhaseService.getProjectPhasesByProjectId(project.id);
            
            // 如果数据库中没有阶段数据，则生成默认阶段
            const projectPhases = phases && phases.length > 0 ? phases : generatePhasesForProject(project);
            
            // 从数据库获取里程碑数据
            const milestones = await milestoneService.getMilestonesByProjectId(project.id);
            
            const completedPhases = projectPhases.filter(p => p.status === 'COMPLETED').length;
            const inProgressPhases = projectPhases.filter(p => p.status === 'IN_PROGRESS').length;
            const delayedPhases = projectPhases.filter(p => p.status === 'DELAYED' || p.isOverdue).length;
            
            // Calculate overall status based on phases
            let overallStatus = 'NOT_STARTED';
            let statusColor = 'GREEN';
            
            if (completedPhases === projectPhases.length) {
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
              phases: projectPhases,
              milestones: milestones || project.keyMilestones || [],
              overallStatus,
              statusColor,
              completionRate: projectPhases.length > 0 ? (completedPhases / projectPhases.length * 100) : 0
            };
          } catch (error) {
            console.error(`Error loading phases for project ${project.id}:`, error);
            // 如果API调用失败，回退到生成模拟数据
            const phases = generatePhasesForProject(project);
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
              completionRate: completedPhases / phases.length * 100
            };
          }
        })
      );

      // 计算统计信息
      const statistics = {
        totalProjects: projectsWithPhases.length,
        completedProjects: projectsWithPhases.filter(p => p.overallStatus === 'COMPLETED').length,
        inProgressProjects: projectsWithPhases.filter(p => p.overallStatus === 'IN_PROGRESS').length,
        atRiskProjects: projectsWithPhases.filter(p => p.overallStatus === 'AT_RISK').length
      };

      // 计算阶段统计
      const phaseStatistics = [
        'EST', 'PLAN', 'DEV', 'SIT', 'UAT', 'PPE', 'LIVE'
      ].map(phaseName => {
        const phaseData = projectsWithPhases.flatMap(p => p.phases).filter(phase => phase.phaseName === phaseName);
        return {
          phaseName,
          totalCount: phaseData.length,
          completedCount: phaseData.filter(p => p.status === 'COMPLETED').length,
          inProgressCount: phaseData.filter(p => p.status === 'IN_PROGRESS').length,
          delayedCount: phaseData.filter(p => p.status === 'DELAYED').length
        };
      });

      setGanttData({
        projects: projectsWithPhases,
        statistics,
        phaseStatistics
      });
      
      // 处理过滤和排序
      let filteredProjects = projectsWithPhases;
      
      if (searchTerm) {
        filteredProjects = filteredProjects.filter(project =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== 'ALL') {
        filteredProjects = filteredProjects.filter(project => 
          project.overallStatus === statusFilter
        );
      }

      setDisplayProjects(filteredProjects);
    } catch (error) {
      console.error('Error loading Gantt data:', error);
      setDisplayProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [projects, searchTerm, statusFilter, generatePhasesForProject]);

  useEffect(() => {
    loadGanttData();
  }, [loadGanttData]);

  useEffect(() => {
    if (searchTerm) {
      // This useEffect is no longer needed as filtering is handled in loadGanttData
      // Keeping for backward compatibility
    }
  }, [searchTerm, ganttData.projects]);

  // 为项目生成阶段数�?- 确保所有字段都有值，包含7个标准阶�?
  const generatePhasesForProject = (project) => {
    // 使用2025年初作为项目开始基准日期
    const baseDate = dayjs('2025-01-01').startOf('year');
    const projectStatus = project.itProjectStatus || 'AMBER';
    
    // 根据项目状态计算各阶段的状态和进度
    const isProjectCompleted = projectStatus === 'GREEN';
    const isProjectAtRisk = projectStatus === 'RED';
    const hasEscalation = project.escalation || false;
    
    // 计算当前日期在2025年内的进度，用于动态设置阶段状态
    const currentDate = dayjs();
    const year2025Start = dayjs('2025-01-01');
    const year2025End = dayjs('2025-12-31');
    const yearProgress = currentDate.isAfter(year2025End) ? 1 : 
                        currentDate.isBefore(year2025Start) ? 0 :
                        currentDate.diff(year2025Start, 'days') / year2025End.diff(year2025Start, 'days');
    
    const phases = [
      { 
        id: `${project.id}-1`, 
        phaseName: "EST", 
        status: "COMPLETED", 
        startDate: baseDate.format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(30, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(30, 'days').format('YYYY-MM-DD'), 
        progressPercentage: 100, 
        isCompleted: true, 
        isOverdue: false,
        description: `${project.projectName} - Estimation and requirements analysis phase`
      },
      { 
        id: `${project.id}-2`, 
        phaseName: "PLAN", 
        status: yearProgress > 0.1 ? "COMPLETED" : "IN_PROGRESS", 
        startDate: baseDate.clone().add(31, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(75, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(31, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(75, 'days').format('YYYY-MM-DD'), 
        progressPercentage: yearProgress > 0.1 ? 100 : Math.min(100, Math.max(0, Math.floor(yearProgress * 1000))), 
        isCompleted: yearProgress > 0.1, 
        isOverdue: false,
        description: `${project.projectName} - Planning and design phase`
      },
      { 
        id: `${project.id}-3`, 
        phaseName: "DEV", 
        status: yearProgress > 0.6 ? "COMPLETED" : (yearProgress > 0.2 ? "IN_PROGRESS" : "NOT_STARTED"), 
        startDate: baseDate.clone().add(76, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(210, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(76, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(210, 'days').format('YYYY-MM-DD'), 
        progressPercentage: yearProgress > 0.6 ? 100 : (yearProgress > 0.2 ? Math.min(100, Math.max(0, Math.floor((yearProgress - 0.2) * 250))) : 0), 
        isCompleted: yearProgress > 0.6, 
        isOverdue: hasEscalation,
        description: `${project.projectName} - Development and implementation phase`
      },
      { 
        id: `${project.id}-4`, 
        phaseName: "SIT", 
        status: yearProgress > 0.75 ? "COMPLETED" : (yearProgress > 0.6 ? "IN_PROGRESS" : "NOT_STARTED"), 
        startDate: baseDate.clone().add(211, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(255, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(211, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(255, 'days').format('YYYY-MM-DD'), 
        progressPercentage: yearProgress > 0.75 ? 100 : (yearProgress > 0.6 ? Math.min(100, Math.max(0, Math.floor((yearProgress - 0.6) * 667))) : 0), 
        isCompleted: yearProgress > 0.75, 
        isOverdue: false,
        description: `${project.projectName} - System Integration Testing phase`
      },
      { 
        id: `${project.id}-5`, 
        phaseName: "UAT", 
        status: yearProgress > 0.85 ? "COMPLETED" : (yearProgress > 0.75 ? "IN_PROGRESS" : "NOT_STARTED"), 
        startDate: baseDate.clone().add(256, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(300, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(256, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(300, 'days').format('YYYY-MM-DD'), 
        progressPercentage: yearProgress > 0.85 ? 100 : (yearProgress > 0.75 ? Math.min(100, Math.max(0, Math.floor((yearProgress - 0.75) * 1000))) : 0), 
        isCompleted: yearProgress > 0.85, 
        isOverdue: false,
        description: `${project.projectName} - User Acceptance Testing phase`
      },
      { 
        id: `${project.id}-6`, 
        phaseName: "PPE", 
        status: yearProgress > 0.92 ? "COMPLETED" : (yearProgress > 0.85 ? "IN_PROGRESS" : "NOT_STARTED"), 
        startDate: baseDate.clone().add(301, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(330, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(301, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(330, 'days').format('YYYY-MM-DD'), 
        progressPercentage: yearProgress > 0.92 ? 100 : (yearProgress > 0.85 ? Math.min(100, Math.max(0, Math.floor((yearProgress - 0.85) * 1429))) : 0), 
        isCompleted: yearProgress > 0.92, 
        isOverdue: false,
        description: `${project.projectName} - Pre-Production Environment testing phase`
      },
      { 
        id: `${project.id}-7`, 
        phaseName: "LIVE", 
        status: yearProgress > 0.98 ? "COMPLETED" : (yearProgress > 0.92 ? "IN_PROGRESS" : "NOT_STARTED"), 
        startDate: baseDate.clone().add(331, 'days').format('YYYY-MM-DD'), 
        endDate: baseDate.clone().add(364, 'days').format('YYYY-MM-DD'), 
        plannedStartDate: baseDate.clone().add(331, 'days').format('YYYY-MM-DD'), 
        plannedEndDate: baseDate.clone().add(364, 'days').format('YYYY-MM-DD'), 
        progressPercentage: yearProgress > 0.98 ? 100 : (yearProgress > 0.92 ? Math.min(100, Math.max(0, Math.floor((yearProgress - 0.92) * 1667))) : 0), 
        isCompleted: yearProgress > 0.98, 
        isOverdue: false,
        description: `${project.projectName} - Production deployment and go-live phase`
      }
    ];
    return phases;
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

  // 里程碑编辑相关函�?
  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    milestoneForm.setFieldsValue({
      ...milestone,
      dueDate: milestone.targetDate ? dayjs(milestone.targetDate) : null,
      actualCompletionDate: milestone.actualCompletionDate ? dayjs(milestone.actualCompletionDate) : null
    });
    setIsMilestoneEditVisible(true);
  };

  const handleUpdateMilestone = async (values) => {
    try {
      const formattedValues = {
        ...values,
        targetDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
        actualCompletionDate: values.actualCompletionDate ? values.actualCompletionDate.format('YYYY-MM-DD') : null,
      };

      // 调用API更新里程�?
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

  // 阶段编辑相关函数
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

  // 项目编辑相关函数
  const handleEditProject = async (project) => {
    try {
      setEditingProject(project);
      // 加载项目阶段数据
      const phases = await projectPhaseService.getProjectPhasesByProjectId(project.id);
      setProjectPhases(phases);
      setIsProjectEditVisible(true);
    } catch (error) {
      console.error('Error loading project phases:', error);
      // 如果API失败，使用模拟数据
      setProjectPhases(project.phases || []);
      setEditingProject(project);
      setIsProjectEditVisible(true);
    }
  };

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

      // 调用项目阶段服务API更新
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

  // 全新设计的甘特图渲染函数 - 改进用户体验
  const renderInlineGanttWithMilestones = (record) => {
    // 动态时间范围：2025年全年视图
    const startDate = dayjs('2025-01-01').startOf('year');
    const endDate = dayjs('2025-12-31').endOf('year');
    const totalDays = endDate.diff(startDate, 'days');
    const containerWidth = timelineWidth; // 使用可调整的宽度

    // 确保阶段按照正确顺序排序
    const phaseOrder = ['EST', 'PLAN', 'DEV', 'SIT', 'UAT', 'PPE', 'LIVE'];
    const sortedPhases = [...record.phases].sort((a, b) => {
      return phaseOrder.indexOf(a.phaseName) - phaseOrder.indexOf(b.phaseName);
    });

    // 生成更清晰的时间轴标记 - 按月份显示（只显示月份缩写）
    const generateTimeMarkers = () => {
      const markers = [];
      let currentMarkerDate = startDate.startOf('month');
      
      while (currentMarkerDate.isBefore(endDate)) {
        const left = (currentMarkerDate.diff(startDate, 'days') / totalDays) * containerWidth;
        const nextMonth = currentMarkerDate.add(1, 'month');
        const width = Math.min(
          (nextMonth.diff(currentMarkerDate, 'days') / totalDays) * containerWidth,
          containerWidth - left
        );
        
        if (left >= 0 && left < containerWidth) {
          markers.push({
            left,
            width,
            period: currentMarkerDate.format('MMM'), // 只显示月份缩写
            monthShort: currentMarkerDate.format('MMM'),
            isCurrentMonth: currentMarkerDate.isSame(dayjs(), 'month'),
            isPastMonth: currentMarkerDate.isBefore(dayjs(), 'month'),
            isFutureMonth: currentMarkerDate.isAfter(dayjs(), 'month')
          });
        }
        currentMarkerDate = nextMonth;
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
        const newWidth = Math.max(400, Math.min(1400, startWidth + deltaX)); // 限制宽度范围
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

    return (
      <div style={{ width: '100%', minWidth: '600px', position: 'relative' }}>
        {/* 增强版时间轴 - 按月份显示，突出当前月 */}
        <div style={{ 
          height: '32px', 
          backgroundColor: '#fafafa', 
          borderRadius: '6px 6px 0 0',
          border: '1px solid #e8e8e8',
          borderBottom: 'none',
          position: 'relative',
          width: `${containerWidth}px`,
          cursor: isDragging ? 'col-resize' : 'default'
        }}>
          {/* 月份标记 */}
          <div style={{ 
            height: '100%', 
            position: 'relative'
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
                  fontWeight: marker.isCurrentMonth ? '700' : '500',
                  color: marker.isCurrentMonth ? '#1890ff' : 
                         marker.isPastMonth ? '#999' : '#333',
                  borderRight: index < timeMarkers.length - 1 ? '1px solid #e8e8e8' : 'none',
                  userSelect: 'none',
                  backgroundColor: marker.isCurrentMonth ? '#e6f7ff' : 
                                 marker.isPastMonth ? '#f5f5f5' : 'transparent'
                }}
              >
                {marker.period}
              </div>
            ))}
            
            {/* 当前日期指示线 */}
            {(() => {
              const today = dayjs();
              const todayLeft = (today.diff(startDate, 'days') / totalDays) * containerWidth;
              if (todayLeft >= 0 && todayLeft <= containerWidth) {
                return (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${todayLeft}px`,
                      top: '0',
                      width: '2px',
                      height: '100%',
                      backgroundColor: '#ff4d4f',
                      zIndex: 20,
                      boxShadow: '0 0 4px rgba(255, 77, 79, 0.5)'
                    }}
                  />
                );
              }
              return null;
            })()}
          </div>
          
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

        {/* 甘特图条 - 增强版，显示计划vs实际日期 */}
        <div style={{ 
          display: 'flex', 
          height: '60px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '0 0 6px 6px',
          position: 'relative',
          marginBottom: '12px',
          border: '1px solid #e8e8e8',
          width: `${containerWidth}px`
        }}>
          {sortedPhases.map((phase, index) => {
            const phaseStart = dayjs(phase.startDate);
            const phaseEnd = dayjs(phase.endDate);
            const plannedStart = dayjs(phase.plannedStartDate);
            const plannedEnd = dayjs(phase.plannedEndDate);
            
            // 计划时间�?
            const plannedLeft = Math.max(0, (plannedStart.diff(startDate, 'days') / totalDays) * containerWidth);
            const plannedWidth = Math.max(16, (plannedEnd.diff(plannedStart, 'days') / totalDays) * containerWidth);
            
            // 实际时间�?
            const actualLeft = Math.max(0, (phaseStart.diff(startDate, 'days') / totalDays) * containerWidth);
            const actualWidth = Math.max(16, (phaseEnd.diff(phaseStart, 'days') / totalDays) * containerWidth);
            
            // 检查阶段是否在可视范围内
            const isPhaseVisible = (plannedLeft < containerWidth && plannedLeft + plannedWidth > 0) ||
                                  (actualLeft < containerWidth && actualLeft + actualWidth > 0);
            
            if (!isPhaseVisible) return null;
            
            // 根据阶段状态确定颜�?
            let backgroundColor, plannedColor;
            if (phase.status === 'COMPLETED' || phase.progressPercentage === 100) {
              backgroundColor = '#52c41a'; // 绿色 - 已完�?
              plannedColor = '#a0d911'; // 浅绿
            } else if (phase.status === 'IN_PROGRESS' || phase.progressPercentage > 0) {
              backgroundColor = '#1890ff'; // 蓝色 - 进行�?
              plannedColor = '#69c0ff'; // 浅蓝
            } else {
              backgroundColor = '#d9d9d9'; // 灰色 - 未开�?
              plannedColor = '#f0f0f0'; // 浅灰
            }

            return (
              <div key={phase.id} style={{ position: 'relative' }}>
                {/* 计划时间�?(上层) */}
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
                      {phase.phaseName}
                    </div>
                  </div>
                </Tooltip>

                {/* 实际时间�?(下层) */}
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

        {/* 里程碑标�?- 仅显示在时间范围内的里程碑 */}
        <div style={{ position: 'relative', height: '20px' }}>
          {record.milestones && record.milestones.map((milestone, index) => {
            const milestoneDate = dayjs(milestone.targetDate);
            const left = (milestoneDate.diff(startDate, 'days') / totalDays) * containerWidth;
            
            // 只显示在可视时间范围内的里程碑
            if (left >= 0 && left <= containerWidth && 
                milestoneDate.isAfter(startDate) && milestoneDate.isBefore(endDate)) {
              return (
                <Tooltip
                  key={milestone.id}
                  title={
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>Milestone: {milestone.name}</div>
                      <div>Target Date: {milestoneDate.format('YYYY-MM-DD')}</div>
                      <div>Priority: {milestone.priority}</div>
                      <div>Days from now: {milestoneDate.diff(dayjs(), 'days')} days</div>
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
          <div 
            style={{ 
              fontWeight: '600', 
              color: '#1890ff', 
              marginBottom: '4px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => handleEditProject(record)}
          >
            {text}
          </div>
        </div>
      )
    },
    {
      title: 'Team',
      dataIndex: 'team',
      key: 'team',
      width: 150,
      render: (team) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TeamOutlined style={{ color: '#1890ff' }} />
          <span>{team?.name || 'N/A'}</span>
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
          'COMPLETED': { color: '#52c41a', text: 'Completed', progressColor: '#52c41a' },
          'IN_PROGRESS': { color: '#1890ff', text: 'In Progress', progressColor: '#1890ff' },
          'AT_RISK': { color: '#faad14', text: 'At Risk', progressColor: '#faad14' },
          'NOT_STARTED': { color: '#d9d9d9', text: 'Not Started', progressColor: '#d9d9d9' }
        };
        const config = statusConfig[status] || statusConfig['NOT_STARTED'];
        
        // Enhanced progress color based on completion rate
        const completionRate = Math.round(record.completionRate || 0);
        let progressColor = config.progressColor;
        
        if (completionRate >= 80) {
          progressColor = '#52c41a'; // Green for high progress
        } else if (completionRate >= 50) {
          progressColor = '#1890ff'; // Blue for medium progress
        } else if (completionRate >= 20) {
          progressColor = '#faad14'; // Orange for low progress
        } else {
          progressColor = '#ff4d4f'; // Red for very low progress
        }
        
        return (
          <div>
            <Tag color={config.color}>{config.text}</Tag>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              <Progress 
                percent={completionRate} 
                size="small" 
                showInfo={false}
                strokeColor={{
                  '0%': progressColor,
                  '100%': progressColor,
                }}
                trailColor="#f0f0f0"
                strokeWidth={8}
              />
              <span style={{ 
                fontSize: '11px', 
                color: '#666', 
                fontWeight: '500',
                marginLeft: '4px'
              }}>
                {completionRate}%
              </span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Project Timeline & Milestones',
      key: 'gantt',
      width: timelineWidth + 50, // 动态宽度
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
              placeholder="Search projects, teams, or leads..."
              allowClear
              style={{ width: 250 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              placeholder="Filter by Status"
            >
              <Option value="ALL">All Status</Option>
              <Option value="NOT_STARTED">Not Started</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="AT_RISK">At Risk</Option>
            </Select>
          </div>
        </Space>
      </div>

      <Card 
        title="Project Gantt Chart" 
        style={{ borderRadius: '8px', marginBottom: '20px' }}
        styles={{ body: { padding: '12px' } }}
      >
        <Table
          dataSource={displayProjects}
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
          scroll={{ x: 1650 }}
        />
      </Card>

      {/* 项目日历 - 放在甘特图下�?*/}
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
          cellRender={(value, info) => {
            if (info.type !== 'date') return info.originNode;
            
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

      {/* 项目阶段编辑模态框 */}
      <Modal
        title={`Edit Project Phases - ${editingProject?.projectName}`}
        open={isProjectEditVisible}
        onCancel={() => {
          setIsProjectEditVisible(false);
          setEditingProject(null);
          setProjectPhases([]);
        }}
        width={900}
        footer={null}
      >
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {projectPhases.map((phase, index) => (
            <Card 
              key={phase.id || index}
              title={`${phase.phaseName} Phase`}
              size="small"
              style={{ marginBottom: '16px' }}
              extra={
                <Button 
                  size="small" 
                  onClick={() => {
                    setEditingPhase(phase);
                    phaseForm.setFieldsValue({
                      ...phase,
                      startDate: phase.startDate ? dayjs(phase.startDate) : null,
                      endDate: phase.endDate ? dayjs(phase.endDate) : null,
                      plannedStartDate: phase.plannedStartDate ? dayjs(phase.plannedStartDate) : null,
                      plannedEndDate: phase.plannedEndDate ? dayjs(phase.plannedEndDate) : null
                    });
                    setIsPhaseEditVisible(true);
                  }}
                >
                  Edit
                </Button>
              }
            >
              <Row gutter={16}>
                <Col span={6}>
                  <strong>Status:</strong> 
                  <Tag color={
                    phase.status === 'COMPLETED' ? 'green' :
                    phase.status === 'IN_PROGRESS' ? 'blue' :
                    phase.status === 'DELAYED' ? 'red' : 'default'
                  }>
                    {phase.status}
                  </Tag>
                </Col>
                <Col span={6}>
                  <strong>Progress:</strong> {phase.progressPercentage || 0}%
                </Col>
                <Col span={6}>
                  <strong>Start:</strong> {phase.startDate || 'Not set'}
                </Col>
                <Col span={6}>
                  <strong>End:</strong> {phase.endDate || 'Not set'}
                </Col>
              </Row>
              {phase.description && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Description:</strong> {phase.description}
                </div>
              )}
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default GanttChart;
