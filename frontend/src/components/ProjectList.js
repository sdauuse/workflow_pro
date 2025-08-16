import React, { useState } from 'react';
import { Card, Table, Button, Space, Typography, Input, Select, Tag, Popconfirm, Tooltip } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  WarningOutlined,
  CopyOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const ProjectList = ({ projects, onEdit, onDelete, onCopy, loading }) => {
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  React.useEffect(() => {
    let filtered = projects;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.itProjectStatus === statusFilter);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(project =>
        project.projectName.toLowerCase().includes(searchText.toLowerCase()) ||
        (project.lead && project.lead.name.toLowerCase().includes(searchText.toLowerCase())) ||
        (project.team && project.team.name.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    setFilteredProjects(filtered);
  }, [projects, statusFilter, searchText]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'GREEN': return 'green';
      case 'AMBER': return 'orange';
      case 'RED': return 'red';
      default: return 'default';
    }
  };

  const isCheckpointSoon = (nextCheckDate) => {
    if (!nextCheckDate) return false;
    const checkDate = moment(nextCheckDate);
    const today = moment();
    const daysUntil = checkDate.diff(today, 'days');
    return daysUntil <= 7 && daysUntil >= 0;
  };

  const isOverdue = (nextCheckDate) => {
    if (!nextCheckDate) return false;
    const checkDate = moment(nextCheckDate);
    const today = moment();
    return checkDate.isBefore(today);
  };

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.daRecord && (
            <div style={{ fontSize: 12, color: '#666' }}>DA: {record.daRecord}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'itProjectStatus',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Team & Lead',
      key: 'teamLead',
      width: 150,
      render: (_, record) => (
        <div>
          {record.team && (
            <div style={{ fontSize: 12 }}>{record.team.name}</div>
          )}
          {record.lead && (
            <div style={{ fontSize: 12, color: '#666' }}>Lead: {record.lead.name}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Estimation',
      dataIndex: 'estimation',
      key: 'estimation',
      width: 120,
      render: (estimation) => (
        <div style={{ textAlign: 'center' }}>
          {estimation ? (
            <span style={{ 
              fontWeight: 'bold', 
              color: '#1890ff',
              fontSize: '14px' 
            }}>
              {parseFloat(estimation).toFixed(1)} HC/M
            </span>
          ) : (
            <span style={{ color: '#ccc', fontSize: '12px' }}>Not set</span>
          )}
        </div>
      ),
    },
    {
      title: 'Next Milestone',
      key: 'nearMilestone',
      width: 200,
      render: (_, record) => (
        <div>
          {record.nearMilestone && (
            <div style={{ fontSize: 12 }}>{record.nearMilestone}</div>
          )}
          {record.nearMilestoneDate && (
            <div style={{ fontSize: 12, color: '#666' }}>
              {moment(record.nearMilestoneDate).format('DD MMM YYYY')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Next Checkpoint',
      dataIndex: 'nextCheckDate',
      key: 'nextCheckDate',
      width: 120,
      render: (date) => {
        if (!date) return '-';
        
        const isOverdueCheck = isOverdue(date);
        const isSoon = isCheckpointSoon(date);
        
        return (
          <div style={{ 
            color: isOverdueCheck ? '#ff4d4f' : isSoon ? '#faad14' : undefined 
          }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {moment(date).format('DD MMM YYYY')}
            {isOverdueCheck && (
              <Tooltip title="Overdue">
                <WarningOutlined style={{ color: '#ff4d4f', marginLeft: 4 }} />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'Go Live',
      dataIndex: 'goLiveDate',
      key: 'goLiveDate',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: 'Escalation',
      dataIndex: 'escalation',
      key: 'escalation',
      width: 100,
      render: (escalation) => (
        escalation ? (
          <Tag color="red">YES</Tag>
        ) : (
          <Tag color="green">NO</Tag>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="default"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => onCopy(record)}
            title="Copy Project"
          >
            Copy
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this project?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Projects</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Search
              placeholder="Search projects, teams, or leads"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Status</Option>
              <Option value="GREEN">Green</Option>
              <Option value="AMBER">Amber</Option>
              <Option value="RED">Red</Option>
            </Select>
          </Space>
          <div>
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        </Space>
        
        <Table
          columns={columns}
          dataSource={filteredProjects}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} projects`,
          }}
          scroll={{ x: 1200 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: 16, background: '#f9f9f9' }}>
                <div style={{ marginBottom: 12 }}>
                  <strong>Executive Summary:</strong>
                  <div style={{ marginTop: 4, fontSize: 12 }}>
                    {record.itExecutiveSummary || 'No summary available'}
                  </div>
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <strong>Key Issues & Risks:</strong>
                  <div style={{ marginTop: 4, fontSize: 12 }}>
                    {record.keyIssueAndRisk || 'No issues reported'}
                  </div>
                </div>
                
                {record.dependency && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Dependencies:</strong>
                    <div style={{ marginTop: 4, fontSize: 12 }}>
                      {record.dependency}
                    </div>
                  </div>
                )}
                
                {record.projectJiraLink && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>JIRA Link:</strong>
                    <a 
                      href={record.projectJiraLink.startsWith('http') ? record.projectJiraLink : `https://${record.projectJiraLink}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ marginLeft: 8 }}
                    >
                      {record.projectJiraLink}
                    </a>
                  </div>
                )}
                
                {record.relatedMaterials && (
                  <div>
                    <strong>Related Materials:</strong>
                    <div style={{ marginTop: 4, fontSize: 12 }}>
                      {record.relatedMaterials.includes('http') ? (
                        <a 
                          href={record.relatedMaterials.startsWith('http') ? record.relatedMaterials : `https://${record.relatedMaterials}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {record.relatedMaterials}
                        </a>
                      ) : (
                        record.relatedMaterials
                      )}
                    </div>
                  </div>
                )}
              </div>
            ),
            rowExpandable: (record) => true,
          }}
        />
      </Card>
    </div>
  );
};

export default ProjectList;
