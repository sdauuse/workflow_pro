import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Input,
  Tag,
  Popconfirm,
  Tooltip,
  Avatar,
  Descriptions,
  Modal,
  Select,
  Form,
  message
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  EyeOutlined,
  UsergroupAddOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import moment from 'moment';
import TeamMemberForm from './TeamMemberForm';
import teamMemberService from '../services/teamMemberService';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const TeamList = ({ teams, onEdit, onDelete, onCreate, loading, teamMembers = [], onUpdateTeamMembers }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [isTeamMemberFormVisible, setIsTeamMemberFormVisible] = useState(false);
  const [form] = Form.useForm();

  // Enhanced filtering to include teams and members
  const filteredTeams = teams.filter(team => {
    const matchesSearch = searchText === '' || 
      team.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (team.description && team.description.toLowerCase().includes(searchText.toLowerCase())) ||
      (team.members && team.members.some(member => 
        member.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (member.role && member.role.toLowerCase().includes(searchText.toLowerCase()))
      ));
    return matchesSearch;
  });

  const handleView = (team) => {
    setSelectedTeam(team);
    setIsViewModalVisible(true);
  };

  const handleCreateTeamMember = () => {
    setIsTeamMemberFormVisible(true);
  };

  const handleTeamMemberSubmit = async (teamMemberData) => {
    try {
      await teamMemberService.createTeamMember(teamMemberData);
      message.success('Team member created successfully!');
      // Trigger parent component to reload data
      if (typeof onUpdateTeamMembers === 'function') {
        // Just trigger a reload by calling the function without parameters
        await loadData();
      }
      setIsTeamMemberFormVisible(false);
    } catch (error) {
      console.error('Error creating team member:', error);
      if (error.response && error.response.data && error.response.data.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Failed to create team member. Please try again.');
      }
    }
  };

  // Helper function to reload data
  const loadData = async () => {
    if (typeof onUpdateTeamMembers === 'function') {
      try {
        // This will trigger the parent to reload teams and team members data
        await onUpdateTeamMembers();
      } catch (error) {
        console.error('Error reloading data:', error);
      }
    }
  };

  const handleManageMembers = (team) => {
    setSelectedTeam(team);
    setIsMemberModalVisible(true);
    // Set current team members in form
    form.setFieldsValue({
      memberIds: team.members ? team.members.map(m => m.id) : []
    });
  };

  const handleUpdateMembers = async (values) => {
    try {
      if (onUpdateTeamMembers) {
        await onUpdateTeamMembers(selectedTeam.id, values.memberIds);
        message.success('Team members updated successfully');
        setIsMemberModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      console.error('Update members error:', error);
      message.error('Failed to update team members. Please try again.');
      setIsMemberModalVisible(false);
      form.resetFields();
    }
  };

  // Get available team members not in current team
  const getAvailableMembers = () => {
    if (!selectedTeam || !teamMembers) return teamMembers;
    const currentMemberIds = selectedTeam.members ? selectedTeam.members.map(m => m.id) : [];
    return teamMembers.filter(member => !currentMemberIds.includes(member.id));
  };

  const columns = [
    {
      title: 'Team Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<TeamOutlined />} style={{ marginRight: 8, backgroundColor: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              ID: {record.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description) => (
        <span style={{ color: '#666' }}>
          {description || 'No description'}
        </span>
      ),
    },
    {
      title: 'Members',
      dataIndex: 'members',
      key: 'members',
      width: 120,
      render: (members) => (
        <div style={{ textAlign: 'center' }}>
          <UserOutlined style={{ marginRight: 4 }} />
          {members ? members.length : 0}
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (createdAt) => (
        <span style={{ fontSize: 12 }}>
          {createdAt ? moment(createdAt).format('MMM DD, YYYY') : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Manage Members">
            <Button
              type="text"
              icon={<UsergroupAddOutlined />}
              onClick={() => handleManageMembers(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit Team">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this team?"
            description="This action cannot be undone. All team members will be unassigned."
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Team">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Teams Management</Title>
        <Space>
          <Button
            type="default"
            icon={<UserAddOutlined />}
            onClick={handleCreateTeamMember}
          >
            Create Team Member
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreate}
          >
            Create Team
          </Button>
        </Space>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Teams Overview</div>
          <Search
            placeholder="Search teams, members, or roles..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredTeams}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredTeams.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} teams`,
          }}
        />
      </Card>

      {/* Team Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            Team Details
          </div>
        }
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            setIsViewModalVisible(false);
            onEdit(selectedTeam);
          }}>
            Edit Team
          </Button>
        ]}
        width={600}
      >
        {selectedTeam && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Team Name">{selectedTeam.name}</Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedTeam.description || 'No description provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Team ID">{selectedTeam.id}</Descriptions.Item>
              <Descriptions.Item label="Created At">
                {selectedTeam.createdAt ? moment(selectedTeam.createdAt).format('MMMM DD, YYYY HH:mm') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {selectedTeam.updatedAt ? moment(selectedTeam.updatedAt).format('MMMM DD, YYYY HH:mm') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Team Members">
                {selectedTeam.members && selectedTeam.members.length > 0 ? (
                  <div>
                    {selectedTeam.members.map(member => (
                      <Tag key={member.id} style={{ margin: 2 }}>
                        <UserOutlined style={{ marginRight: 4 }} />
                        {member.name} {member.role && `(${member.role})`}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#999' }}>No members assigned</span>
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Manage Members Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UsergroupAddOutlined style={{ marginRight: 8 }} />
            Manage Team Members
          </div>
        }
        open={isMemberModalVisible}
        onCancel={() => {
          setIsMemberModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        {selectedTeam && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <strong>Team: {selectedTeam.name}</strong>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {selectedTeam.description || 'No description'}
              </div>
            </div>

            <Form
              form={form}
              onFinish={handleUpdateMembers}
              layout="vertical"
            >
              <Form.Item
                label="Current Team Members"
                style={{ marginBottom: 16 }}
              >
                <div style={{ minHeight: 40, padding: 8, border: '1px solid #d9d9d9', borderRadius: 6, background: '#fafafa' }}>
                  {selectedTeam.members && selectedTeam.members.length > 0 ? (
                    selectedTeam.members.map(member => (
                      <Tag key={member.id} style={{ margin: 2 }}>
                        <UserOutlined style={{ marginRight: 4 }} />
                        {member.name} {member.role && `(${member.role})`}
                      </Tag>
                    ))
                  ) : (
                    <span style={{ color: '#999' }}>No members assigned</span>
                  )}
                </div>
              </Form.Item>

              <Form.Item
                label="Add New Members"
                name="memberIds"
                help="Select members to add to this team"
              >
                <Select
                  mode="multiple"
                  placeholder="Select team members to add"
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {getAvailableMembers().map(member => (
                    <Option 
                      key={member.id} 
                      value={member.id}
                      label={`${member.name}${member.role ? ` (${member.role})` : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <UserOutlined style={{ marginRight: 8 }} />
                        <span>{member.name}</span>
                        {member.role && <span style={{ color: '#666', marginLeft: 8 }}>({member.role})</span>}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button 
                    onClick={() => {
                      setIsMemberModalVisible(false);
                      form.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Update Members
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Team Member Form Modal */}
      <TeamMemberForm
        visible={isTeamMemberFormVisible}
        onCancel={() => setIsTeamMemberFormVisible(false)}
        onSubmit={handleTeamMemberSubmit}
        teams={teams}
      />
    </div>
  );
};

export default TeamList;
