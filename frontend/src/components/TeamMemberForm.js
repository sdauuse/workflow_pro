import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message
} from 'antd';
import { UserAddOutlined, SaveOutlined } from '@ant-design/icons';
import teamMemberService from '../services/teamMemberService';

const { Option } = Select;

const TeamMemberForm = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  teamMember = null, 
  teams = [] 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (teamMember) {
        // 编辑模式
        form.setFieldsValue({
          name: teamMember.name,
          email: teamMember.email,
          role: teamMember.role,
          teamId: teamMember.teamId
        });
      } else {
        // 创建模式
        form.resetFields();
      }
    }
  }, [visible, teamMember, form]);

  // Custom email validator
  const validateEmail = async (_, value) => {
    if (!value || value.trim() === '') {
      return Promise.resolve(); // Email is optional
    }

    // Skip validation if editing and email hasn't changed
    if (teamMember && teamMember.email === value) {
      return Promise.resolve();
    }

    try {
      setEmailCheckLoading(true);
      const result = await teamMemberService.checkEmailExists(value);
      if (result.exists) {
        return Promise.reject(new Error(`Email '${value}' is already used by ${result.member.name}`));
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Email validation error:', error);
      return Promise.resolve(); // Don't block form submission on validation error
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const teamMemberData = {
        name: values.name,
        email: values.email || null,
        role: values.role,
        teamId: values.teamId ? String(values.teamId) : null
      };

      await onSubmit(teamMemberData);
      
      message.success(teamMember ? 'Team member updated successfully!' : 'Team member created successfully!');
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Error submitting team member:', error);
      
      // Check if it's a backend error with specific message
      if (error.response && error.response.data && error.response.data.error) {
        message.error(error.response.data.error);
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Failed to save team member. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'UI/UX Designer',
    'Project Manager',
    'Team Lead',
    'Senior Developer',
    'Junior Developer',
    'QA Engineer',
    'DevOps Engineer',
    'Data Analyst',
    'Business Analyst',
    'Product Owner',
    'Scrum Master',
    'Technical Lead',
    'Architect',
    'Mobile Developer',
    'AI Engineer',
    'ML Researcher',
    'Security Specialist'
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserAddOutlined style={{ color: '#1890ff' }} />
          <span>{teamMember ? 'Edit Team Member' : 'Create New Team Member'}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          icon={<SaveOutlined />}
        >
          {teamMember ? 'Update' : 'Create'} Team Member
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: '20px' }}
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[
            { required: true, message: 'Please enter the team member name!' },
            { min: 2, message: 'Name must be at least 2 characters!' }
          ]}
        >
          <Input 
            placeholder="Enter full name" 
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email Address (Optional)"
          rules={[
            { type: 'email', message: 'Please enter a valid email address!' },
            { validator: validateEmail }
          ]}
          hasFeedback
          validateStatus={emailCheckLoading ? 'validating' : ''}
        >
          <Input 
            placeholder="Enter email address (optional)" 
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="role"
          label="Role/Position"
          rules={[
            { required: true, message: 'Please select or enter a role!' }
          ]}
        >
          <Select
            placeholder="Select or type a role"
            size="large"
            showSearch
            allowClear
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {roles.map(role => (
              <Option key={role} value={role}>
                {role}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="teamId"
          label="Assign to Team (Optional)"
          tooltip="You can assign this member to a team or leave unassigned"
        >
          <Select
            placeholder="Select a team (optional)"
            size="large"
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {teams.map(team => (
              <Option key={team.id} value={team.id}>
                {team.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TeamMemberForm;
