import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Progress, Tooltip, Modal, message, Input, Select, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import moment from 'moment';
import MilestoneForm from './MilestoneForm';
import milestoneService from '../services/milestoneService';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const MilestoneList = ({ projectId }) => {
    const [milestones, setMilestones] = useState([]);
    const [filteredMilestones, setFilteredMilestones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [filters, setFilters] = useState({
        status: null,
        priority: null,
        owner: null,
        dateRange: null,
        searchTerm: ''
    });

    useEffect(() => {
        fetchMilestones();
    }, [projectId]);

    useEffect(() => {
        applyFilters();
    }, [milestones, filters]);

    const fetchMilestones = async () => {
        setLoading(true);
        try {
            let data;
            if (projectId) {
                data = await milestoneService.getMilestonesByProjectId(projectId);
            } else {
                data = await milestoneService.getAllMilestones();
            }
            setMilestones(data);
            setFilteredMilestones(data);
        } catch (error) {
            message.error('Failed to fetch milestones');
            console.error('Error fetching milestones:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...milestones];

        // Status filter
        if (filters.status) {
            filtered = filtered.filter(milestone => milestone.status === filters.status);
        }

        // Priority filter
        if (filters.priority) {
            filtered = filtered.filter(milestone => milestone.priority === filters.priority);
        }

        // Owner filter
        if (filters.owner) {
            filtered = filtered.filter(milestone => 
                milestone.owner && milestone.owner.toLowerCase().includes(filters.owner.toLowerCase())
            );
        }

        // Date range filter
        if (filters.dateRange && filters.dateRange.length === 2) {
            const [startDate, endDate] = filters.dateRange;
            filtered = filtered.filter(milestone => {
                const targetDate = moment(milestone.targetDate);
                return targetDate.isBetween(startDate, endDate, 'day', '[]');
            });
        }

        // Search term filter
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(milestone => 
                milestone.name.toLowerCase().includes(searchLower) ||
                (milestone.description && milestone.description.toLowerCase().includes(searchLower)) ||
                (milestone.owner && milestone.owner.toLowerCase().includes(searchLower))
            );
        }

        setFilteredMilestones(filtered);
    };

    const handleCreate = () => {
        setEditingMilestone(null);
        setIsModalVisible(true);
    };

    const handleEdit = (milestone) => {
        setEditingMilestone(milestone);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this milestone?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await milestoneService.deleteMilestone(id);
                    message.success('Milestone deleted successfully');
                    fetchMilestones();
                } catch (error) {
                    message.error('Failed to delete milestone');
                    console.error('Error deleting milestone:', error);
                }
            },
        });
    };

    const handleComplete = async (id) => {
        try {
            await milestoneService.completeMilestone(id);
            message.success('Milestone marked as completed');
            fetchMilestones();
        } catch (error) {
            message.error('Failed to complete milestone');
            console.error('Error completing milestone:', error);
        }
    };

    const handleProgressUpdate = async (id, progress) => {
        try {
            await milestoneService.updateMilestoneProgress(id, progress);
            message.success('Progress updated successfully');
            fetchMilestones();
        } catch (error) {
            message.error('Failed to update progress');
            console.error('Error updating progress:', error);
        }
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setEditingMilestone(null);
    };

    const handleModalSuccess = () => {
        setIsModalVisible(false);
        setEditingMilestone(null);
        fetchMilestones();
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            status: null,
            priority: null,
            owner: null,
            dateRange: null,
            searchTerm: ''
        });
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            'PENDING': { color: 'orange', text: 'Pending' },
            'IN_PROGRESS': { color: 'blue', text: 'In Progress' },
            'COMPLETED': { color: 'green', text: 'Completed' },
            'AT_RISK': { color: 'red', text: 'At Risk' },
            'DELAYED': { color: 'red', text: 'Delayed' },
            'CANCELLED': { color: 'gray', text: 'Cancelled' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const getPriorityTag = (priority) => {
        const priorityConfig = {
            'LOW': { color: 'green', text: 'Low' },
            'MEDIUM': { color: 'orange', text: 'Medium' },
            'HIGH': { color: 'red', text: 'High' },
            'CRITICAL': { color: 'red', text: 'Critical' }
        };
        const config = priorityConfig[priority] || { color: 'default', text: priority };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const getTimelineStatus = (milestone) => {
        const targetDate = moment(milestone.targetDate);
        const today = moment();
        
        if (milestone.status === 'COMPLETED') {
            return <Tag color="green">Completed</Tag>;
        } else if (targetDate.isBefore(today, 'day')) {
            return <Tag color="red">Overdue</Tag>;
        } else if (targetDate.diff(today, 'days') <= 7) {
            return <Tag color="orange">Due Soon</Tag>;
        } else {
            return <Tag color="blue">On Track</Tag>;
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{text}</div>
                    {record.description && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.description.length > 50 
                                ? `${record.description.substring(0, 50)}...` 
                                : record.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Target Date',
            dataIndex: 'targetDate',
            key: 'targetDate',
            width: 120,
            render: (date) => moment(date).format('MMM DD, YYYY'),
            sorter: (a, b) => moment(a.targetDate).unix() - moment(b.targetDate).unix(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => getStatusTag(status),
            filters: [
                { text: 'Pending', value: 'PENDING' },
                { text: 'In Progress', value: 'IN_PROGRESS' },
                { text: 'Completed', value: 'COMPLETED' },
                { text: 'At Risk', value: 'AT_RISK' },
                { text: 'Delayed', value: 'DELAYED' },
                { text: 'Cancelled', value: 'CANCELLED' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            width: 100,
            render: (priority) => getPriorityTag(priority),
            filters: [
                { text: 'Low', value: 'LOW' },
                { text: 'Medium', value: 'MEDIUM' },
                { text: 'High', value: 'HIGH' },
                { text: 'Critical', value: 'CRITICAL' },
            ],
            onFilter: (value, record) => record.priority === value,
        },
        {
            title: 'Progress',
            dataIndex: 'progress',
            key: 'progress',
            width: 150,
            render: (progress, record) => (
                <Progress 
                    percent={progress || 0} 
                    size="small" 
                    status={record.status === 'COMPLETED' ? 'success' : 'active'}
                />
            ),
        },
        {
            title: 'Owner',
            dataIndex: 'owner',
            key: 'owner',
            width: 120,
            render: (owner) => owner || '-',
        },
        {
            title: 'Timeline',
            key: 'timeline',
            width: 100,
            render: (_, record) => getTimelineStatus(record),
        },
        {
            title: 'Budget',
            dataIndex: 'budget',
            key: 'budget',
            width: 100,
            render: (budget) => budget ? `$${budget.toLocaleString()}` : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {record.status !== 'COMPLETED' && (
                        <Tooltip title="Mark as Complete">
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                size="small"
                                onClick={() => handleComplete(record.id)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
    };

    return (
        <div>
            {/* Filter Section */}
            <div style={{ marginBottom: 16, padding: 16, background: '#fafafa', borderRadius: 4 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Search
                        placeholder="Search milestones..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        style={{ width: 250 }}
                        prefix={<SearchOutlined />}
                    />
                    
                    <Select
                        placeholder="Filter by Status"
                        value={filters.status}
                        onChange={(value) => handleFilterChange('status', value)}
                        style={{ width: 150 }}
                        allowClear
                    >
                        <Option value="PENDING">Pending</Option>
                        <Option value="IN_PROGRESS">In Progress</Option>
                        <Option value="COMPLETED">Completed</Option>
                        <Option value="AT_RISK">At Risk</Option>
                        <Option value="DELAYED">Delayed</Option>
                        <Option value="CANCELLED">Cancelled</Option>
                    </Select>

                    <Select
                        placeholder="Filter by Priority"
                        value={filters.priority}
                        onChange={(value) => handleFilterChange('priority', value)}
                        style={{ width: 150 }}
                        allowClear
                    >
                        <Option value="LOW">Low</Option>
                        <Option value="MEDIUM">Medium</Option>
                        <Option value="HIGH">High</Option>
                        <Option value="CRITICAL">Critical</Option>
                    </Select>

                    <RangePicker
                        placeholder={['Start Date', 'End Date']}
                        value={filters.dateRange}
                        onChange={(dates) => handleFilterChange('dateRange', dates)}
                        style={{ width: 250 }}
                    />

                    <Button 
                        onClick={clearFilters}
                        icon={<FilterOutlined />}
                    >
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h2>Milestones</h2>
                    <span style={{ color: '#666' }}>
                        Showing {filteredMilestones.length} of {milestones.length} milestones
                    </span>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Add Milestone
                </Button>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={filteredMilestones}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                rowSelection={rowSelection}
                scroll={{ x: 1200 }}
                size="small"
            />

            {/* Modal */}
            <Modal
                title={editingMilestone ? 'Edit Milestone' : 'Create Milestone'}
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
                destroyInnerComponentOnClose
            >
                <MilestoneForm
                    milestone={editingMilestone}
                    projectId={projectId}
                    onSuccess={handleModalSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>
        </div>
    );
};

export default MilestoneList;
