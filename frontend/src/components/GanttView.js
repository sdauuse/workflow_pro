import React, { Component } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { Card, Spin, message, Button, Space, Select, Tooltip } from 'antd';
import { ReloadOutlined, ExpandOutlined, CompressOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import './GanttView.css';
import projectPhaseService from '../services/projectPhaseService';

const { Option } = Select;

export default class GanttView extends Component {
    constructor(props) {
        super(props);
        this.ganttContainer = React.createRef();
        this.state = {
            loading: false,
            zoomLevel: 'day',
            isFullscreen: false
        };
    }

    // 将后端数据转换为甘特图库格式
    formatDataForGantt = (phases) => {
        const tasks = phases.map(phase => {
            // 处理日期，确保有效性
            const startDate = phase.start_date ? new Date(phase.start_date) : 
                             (phase.planned_start_date ? new Date(phase.planned_start_date) : new Date());
            const endDate = phase.end_date ? new Date(phase.end_date) : 
                           (phase.planned_end_date ? new Date(phase.planned_end_date) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000));

            return {
                id: phase.id,
                text: phase.phase_name,
                start_date: gantt.date.date_to_str('%Y-%m-%d')(startDate),
                end_date: gantt.date.date_to_str('%Y-%m-%d')(endDate),
                duration: gantt.calculateDuration(startDate, endDate),
                progress: Math.min(phase.progress_percentage / 100, 1), // 确保进度在0-1之间
                
                // 基线数据（计划日期）
                planned_start: phase.planned_start_date ? gantt.date.date_to_str('%Y-%m-%d')(new Date(phase.planned_start_date)) : null,
                planned_end: phase.planned_end_date ? gantt.date.date_to_str('%Y-%m-%d')(new Date(phase.planned_end_date)) : null,
                
                // 状态数据
                status: phase.status,
                is_overdue: phase.is_overdue,
                is_completed: phase.is_completed,
                project_id: phase.project_id,
                
                // 其他属性
                open: true
            };
        });

        return { data: tasks };
    };

    componentDidMount() {
        this.configureGantt();
        this.loadData();
        this.attachGanttEvents();
    }

    loadData = async () => {
        const { projectId } = this.props;
        if (!projectId) {
            console.warn('No project ID provided for Gantt chart');
            return;
        }

        this.setState({ loading: true });
        try {
            const phases = await projectPhaseService.getProjectPhasesByProjectId(projectId);
            const formattedData = this.formatDataForGantt(phases);
            gantt.clearAll();
            gantt.parse(formattedData);
        } catch (error) {
            console.error("Failed to load Gantt data:", error);
            message.error('加载甘特图数据失败');
        } finally {
            this.setState({ loading: false });
        }
    };

    configureGantt = () => {
        // 启用插件
        gantt.plugins({
            tooltip: true,
            undo: true,
            keyboard_navigation: true,
            quick_info: true
        });

        // 配置日期格式
        gantt.config.date_format = '%Y-%m-%d';
        gantt.config.xml_date = '%Y-%m-%d';

        // 配置列
        gantt.config.columns = [
            { name: "text", label: "阶段名称", tree: true, width: 200 },
            { name: "start_date", label: "开始日期", align: "center", width: 100 },
            { name: "duration", label: "工期", align: "center", width: 60 },
            { name: "progress", label: "进度", align: "center", width: 80, template: function(obj) {
                return Math.round(obj.progress * 100) + "%";
            }},
            { name: "status", label: "状态", align: "center", width: 80, template: function(obj) {
                const statusMap = {
                    'NOT_STARTED': '未开始',
                    'IN_PROGRESS': '进行中',
                    'COMPLETED': '已完成',
                    'DELAYED': '延期',
                    'ON_HOLD': '暂停'
                };
                return statusMap[obj.status] || obj.status;
            }}
        ];

        // 配置任务条文本
        gantt.templates.task_text = function(start, end, task) {
            return `${task.text} (${Math.round(task.progress * 100)}%)`;
        };

        // 自定义任务条样式
        gantt.templates.task_class = function(start, end, task) {
            let cssClass = "";
            
            if (task.is_overdue) {
                cssClass += " gantt_overdue";
            }
            
            switch(task.status) {
                case 'COMPLETED':
                    cssClass += " gantt_completed";
                    break;
                case 'DELAYED':
                    cssClass += " gantt_delayed";
                    break;
                case 'ON_HOLD':
                    cssClass += " gantt_on_hold";
                    break;
                case 'IN_PROGRESS':
                    cssClass += " gantt_in_progress";
                    break;
                default:
                    cssClass += " gantt_not_started";
            }
            
            return cssClass;
        };

        // 配置工具提示
        gantt.templates.tooltip_text = function(start, end, task) {
            const startStr = gantt.date.date_to_str('%Y年%m月%d日')(start);
            const endStr = gantt.date.date_to_str('%Y年%m月%d日')(end);
            const progress = Math.round(task.progress * 100);
            
            let tooltip = `<b>${task.text}</b><br/>`;
            tooltip += `开始时间: ${startStr}<br/>`;
            tooltip += `结束时间: ${endStr}<br/>`;
            tooltip += `进度: ${progress}%<br/>`;
            tooltip += `状态: ${task.status}`;
            
            if (task.planned_start && task.planned_end) {
                tooltip += `<br/><br/><b>计划时间:</b><br/>`;
                tooltip += `${gantt.date.date_to_str('%Y年%m月%d日')(gantt.date.str_to_date('%Y-%m-%d')(task.planned_start))} - `;
                tooltip += `${gantt.date.date_to_str('%Y年%m月%d日')(gantt.date.str_to_date('%Y-%m-%d')(task.planned_end))}`;
            }
            
            return tooltip;
        };

        // 设置缩放级别
        this.setZoomLevel(this.state.zoomLevel);

        // 其他配置
        gantt.config.auto_scheduling = false;
        gantt.config.auto_scheduling_strict = false;
        gantt.config.drag_progress = true;
        gantt.config.drag_resize = true;
        gantt.config.drag_move = true;

        // 初始化甘特图
        gantt.init(this.ganttContainer.current);
    };

    attachGanttEvents = () => {
        // 任务更新事件
        gantt.attachEvent("onAfterTaskUpdate", async (id, task) => {
            console.log(`Task ${id} was updated.`, task);
            await this.syncTaskToBackend(id, task);
        });

        // 任务拖拽事件
        gantt.attachEvent("onAfterTaskDrag", async (id, mode, task) => {
            console.log(`Task ${id} was dragged (${mode}).`, task);
            await this.syncTaskToBackend(id, task);
        });

        // 进度更新事件
        gantt.attachEvent("onAfterProgressDrag", async (id, task) => {
            console.log(`Task ${id} progress was updated.`, task);
            await this.syncTaskToBackend(id, task);
        });
    };

    // 同步任务数据到后端
    syncTaskToBackend = async (taskId, task) => {
        try {
            const startDate = gantt.date.str_to_date('%Y-%m-%d')(task.start_date);
            const endDate = gantt.date.str_to_date('%Y-%m-%d')(task.end_date);
            
            const phaseData = {
                start_date: gantt.date.date_to_str('%Y-%m-%d')(startDate),
                end_date: gantt.date.date_to_str('%Y-%m-%d')(endDate),
                progress_percentage: Math.round(task.progress * 100),
                // 根据进度自动更新状态
                status: task.progress >= 1 ? 'COMPLETED' : 
                       (task.progress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'),
                is_completed: task.progress >= 1
            };

            await projectPhaseService.updateProjectPhase(taskId, phaseData);
            message.success('阶段信息更新成功');
            
            // 通知父组件数据已更新
            if (this.props.onPhaseUpdate) {
                this.props.onPhaseUpdate(taskId, phaseData);
            }
        } catch (error) {
            console.error("Failed to sync task to backend:", error);
            message.error('同步数据失败，请重试');
            // 重新加载数据以恢复状态
            this.loadData();
        }
    };

    // 设置缩放级别
    setZoomLevel = (level) => {
        switch(level) {
            case 'hour':
                gantt.config.scale_unit = 'day';
                gantt.config.date_scale = '%Y年%m月%d日';
                gantt.config.subscales = [
                    { unit: 'hour', step: 6, date: '%H:%i' }
                ];
                break;
            case 'day':
                gantt.config.scale_unit = 'week';
                gantt.config.date_scale = '第%W周';
                gantt.config.subscales = [
                    { unit: 'day', step: 1, date: '%j' }
                ];
                break;
            case 'week':
                gantt.config.scale_unit = 'month';
                gantt.config.date_scale = '%Y年%m月';
                gantt.config.subscales = [
                    { unit: 'week', step: 1, date: '第%W周' }
                ];
                break;
            case 'month':
                gantt.config.scale_unit = 'year';
                gantt.config.date_scale = '%Y年';
                gantt.config.subscales = [
                    { unit: 'month', step: 1, date: '%M' }
                ];
                break;
            default:
                this.setZoomLevel('day');
        }
        gantt.render();
    };

    // 切换全屏
    toggleFullscreen = () => {
        this.setState(prevState => ({
            isFullscreen: !prevState.isFullscreen
        }));
    };

    // 处理缩放变化
    handleZoomChange = (level) => {
        this.setState({ zoomLevel: level });
        this.setZoomLevel(level);
    };

    componentWillUnmount() {
        gantt.clearAll();
        gantt.detachAllEvents();
    }

    render() {
        const { loading, zoomLevel, isFullscreen } = this.state;
        const { title = "项目甘特图" } = this.props;

        return (
            <Card 
                title={title}
                className={`gantt-view-card ${isFullscreen ? 'fullscreen' : ''}`}
                extra={
                    <Space>
                        <Select
                            value={zoomLevel}
                            onChange={this.handleZoomChange}
                            style={{ width: 100 }}
                        >
                            <Option value="hour">小时</Option>
                            <Option value="day">天</Option>
                            <Option value="week">周</Option>
                            <Option value="month">月</Option>
                        </Select>
                        
                        <Tooltip title="刷新数据">
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={this.loadData}
                                loading={loading}
                            />
                        </Tooltip>
                        
                        <Tooltip title={isFullscreen ? "退出全屏" : "全屏显示"}>
                            <Button 
                                icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />} 
                                onClick={this.toggleFullscreen}
                            />
                        </Tooltip>
                    </Space>
                }
            >
                <Spin spinning={loading} tip="加载甘特图数据...">
                    <div 
                        ref={this.ganttContainer}
                        className="gantt-container"
                        style={{ 
                            width: '100%', 
                            height: isFullscreen ? '90vh' : '600px',
                            position: 'relative'
                        }}
                    />
                </Spin>
            </Card>
        );
    }
}
