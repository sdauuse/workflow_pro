import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Select,
  Tag,
  Divider
} from 'antd';
import { SaveOutlined, CloseOutlined, TeamOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TeamForm = ({ team, teamMembers, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const isEdit = !!team;

  React.useEffect(() => {
    if (isEdit) {
      form.setFieldsValue({
        name: team.name,
        description: team.description,
      });
      // Set selected members if team has members
      if (team.members) {
        setSelectedMembers(team.members.map(member => member.id));
      }
    }
  }, [team, form, isEdit]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Include both basic team info and member assignments
      const formData = {
        name: values.name,
        description: values.description
      };
      
      // Create or update the team first
      const teamResult = await onSubmit(formData);
      
      // If we have selected members and a team result with ID, update team members
      if (selectedMembers.length > 0 && teamResult && teamResult.id) {
        try {
          // Update team members via the team service
          const response = await fetch(`http://localhost:8080/api/teams/${teamResult.id}/members`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              memberIds: selectedMembers
            })
          });
          
          if (!response.ok) {
            console.warn('Failed to update team members, but team was created successfully');
          }
        } catch (memberError) {
          console.warn('Error updating team members:', memberError);
          // Don't fail the entire operation if member assignment fails
        }
      }
      
      // Navigate back to teams list
      onCancel(); // This will trigger navigation back to teams
      
      if (!isEdit) {
        form.resetFields();
        setSelectedMembers([]);
      }
    } catch (error) {
      console.error('Error submitting team form:', error);
      // Don't call onCancel here, let the user retry or manually cancel
    } finally {
      setLoading(false);
    }
  };

  const handleMemberChange = (memberIds) => {
    setSelectedMembers(memberIds);
  };

  // Filter available team members (exclude already assigned to other teams if needed)
  const availableMembers = teamMembers || [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <TeamOutlined style={{ marginRight: 8, fontSize: 24 }} />
        <Title level={2} style={{ margin: 0 }}>
          {isEdit ? 'Edit Team' : 'Create New Team'}
        </Title>
      </div>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: '',
            description: '',
          }}
        >
          <Form.Item
            label="Team Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter team name' },
              { min: 2, message: 'Team name must be at least 2 characters' },
              { max: 100, message: 'Team name cannot exceed 100 characters' }
            ]}
          >
            <Input 
              placeholder="Enter team name (e.g., Development Team A)" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { max: 500, message: 'Description cannot exceed 500 characters' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter team description, responsibilities, and objectives..."
            />
          </Form.Item>

          <Divider>Team Members</Divider>

          <Form.Item
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <UserAddOutlined style={{ marginRight: 4 }} />
                Assign Team Members
              </div>
            }
          >
            <Select
              mode="multiple"
              placeholder="Select team members to assign to this team"
              value={selectedMembers}
              onChange={handleMemberChange}
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableMembers.map(member => (
                <Option 
                  key={member.id} 
                  value={member.id}
                  label={`${member.name}${member.role ? ` (${member.role})` : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <UserOutlined style={{ marginRight: 8 }} />
                      <span>{member.name}</span>
                    </div>
                    {member.role && (
                      <Tag size="small" color="blue">{member.role}</Tag>
                    )}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedMembers.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Selected Members:</div>
              <div>
                {selectedMembers.map(memberId => {
                  const member = availableMembers.find(m => m.id === memberId);
                  return member ? (
                    <Tag 
                      key={member.id} 
                      color="blue" 
                      style={{ margin: 2 }}
                    >
                      {member.name} {member.role && `(${member.role})`}
                    </Tag>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <Divider />

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
            >
              {isEdit ? 'Update Team' : 'Create Team'}
            </Button>
            
            <Button
              onClick={onCancel}
              icon={<CloseOutlined />}
              size="large"
            >
              Cancel
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default TeamForm;
