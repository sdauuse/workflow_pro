import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Space,
  Divider,
  message
} from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import milestoneService from '../services/milestoneService';
import projectService from '../services/projectService';
import teamMemberService from '../services/teamMemberService';

const { Option } = Select;
const { TextArea } = Input;

const MilestoneForm = ({ milestone, projectId, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    // Load projects and team members for dropdowns
    loadProjects();
    loadTeamMembers();
    
    // Pre-fill form if editing
    if (milestone) {
      form.setFieldsValue({
        ...milestone,
        targetDate: milestone.targetDate ? moment(milestone.targetDate) : null,
        actualDate: milestone.actualDate ? moment(milestone.actualDate) : null,
        project: milestone.project ? { id: milestone.project.id } : null
      });
    } else {
      // Set defaults for new milestone
      form.setFieldsValue({
        status: 'PENDING',
        priority: 'MEDIUM',
        progress: 0,
        project: projectId ? { id: projectId } : null
      });
    }
  }, [milestone, projectId, form]);

  const loadProjects = async () => {
    try {
      const projectData = await projectService.getAllProjects();
      setProjects(projectData);
    } catch (error) {
      console.error('Error loading projects:', error);
      message.error('Failed to load projects');
    }
  };

  const loadTeamMembers = async () => {
    try {
      const memberData = await teamMemberService.getAllTeamMembers();
      setTeamMembers(memberData);
    } catch (error) {
      console.error('Error loading team members:', error);
      // Use mock data if API fails
      const mockMembers = [
        { id: 1, name: "John Smith", role: "Senior Frontend Developer", email: "john.smith@company.com" },
        { id: 2, name: "Sarah Johnson", role: "Mobile Lead", email: "sarah.johnson@company.com" },
        { id: 3, name: "Mike Chen", role: "Data Analyst", email: "mike.chen@company.com" },
        { id: 4, name: "Alice Wang", role: "Backend Developer", email: "alice.wang@company.com" },
        { id: 5, name: "David Brown", role: "AI Engineer", email: "david.brown@company.com" },
        { id: 6, name: "Lisa Anderson", role: "UI/UX Designer", email: "lisa.anderson@company.com" },
        { id: 7, name: "Tom Wilson", role: "iOS Developer", email: "tom.wilson@company.com" },
        { id: 8, name: "Emma Davis", role: "BI Developer", email: "emma.davis@company.com" },
        { id: 9, name: "Grace Lee", role: "ML Researcher", email: "grace.lee@company.com" },
        { id: 10, name: "James Rodriguez", role: "DevOps Engineer", email: "james.rodriguez@company.com" },
        { id: 11, name: "Sophie Turner", role: "QA Engineer", email: "sophie.turner@company.com" },
        { id: 12, name: "Alex Kim", role: "Security Specialist", email: "alex.kim@company.com" },
        { id: 13, name: "James Wilson", role: "Project Manager", email: "james.wilson@company.com" }
      ];
      setTeamMembers(mockMembers);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Validate required fields
      const errors = milestoneService.validateMilestone(values);
      if (errors.length > 0) {
        message.error(errors[0]);
        return;
      }

      const formattedValues = {
        ...values,
        targetDate: values.targetDate ? values.targetDate.format('YYYY-MM-DD') : null,
        actualDate: values.actualDate ? values.actualDate.format('YYYY-MM-DD') : null,
        project: {
          id: values.project?.id || projectId
        }
      };

      if (milestone) {
        // Update existing milestone
        await milestoneService.updateMilestone(milestone.id, formattedValues);
        message.success('Milestone updated successfully');
      } else {
        // Create new milestone
        await milestoneService.createMilestone(formattedValues);
        message.success('Milestone created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving milestone:', error);
      message.error('Failed to save milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    if (!milestone) {
      form.setFieldsValue({
        status: 'PENDING',
        priority: 'MEDIUM',
        progress: 0,
        project: projectId ? { id: projectId } : null
      });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: 'PENDING',
        priority: 'MEDIUM',
        progress: 0
      }}
    >
      {/* Basic Information */}
      <Divider orientation="left">Basic Information</Divider>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Milestone Name"
            rules={[
              { required: true, message: 'Please enter milestone name' },
              { max: 255, message: 'Name cannot exceed 255 characters' }
            ]}
          >
            <Input placeholder="Enter milestone name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={['project', 'id']}
            label="Project"
            rules={[{ required: true, message: 'Please select a project' }]}
          >
            <Select 
              placeholder="Select project"
              disabled={!!projectId}
              showSearch
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              notFoundContent={projects.length === 0 ? "No projects available" : "No matching projects"}
            >
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.projectName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ max: 1000, message: 'Description cannot exceed 1000 characters' }]}
      >
        <TextArea 
          rows={3} 
          placeholder="Enter milestone description"
        />
      </Form.Item>

      {/* Dates and Status */}
      <Divider orientation="left">Timeline & Status</Divider>
      
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="targetDate"
            label="Target Date"
            rules={[{ required: true, message: 'Please select target date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="actualDate"
            label="Actual Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="PENDING">Pending</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="AT_RISK">At Risk</Option>
              <Option value="DELAYED">Delayed</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Select placeholder="Select priority">
              <Option value="LOW">Low</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="HIGH">High</Option>
              <Option value="CRITICAL">Critical</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="progress"
            label="Progress (%)"
            rules={[
              { type: 'number', min: 0, max: 100, message: 'Progress must be between 0 and 100' }
            ]}
          >
            <InputNumber 
              min={0} 
              max={100} 
              style={{ width: '100%' }}
              placeholder="0"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="owner"
            label="Owner"
            rules={[{ max: 100, message: 'Owner name cannot exceed 100 characters' }]}
          >
            <Select
              placeholder="Select or enter owner name"
              showSearch
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              notFoundContent={teamMembers.length === 0 ? "No team members available" : "No matching members"}
            >
              {teamMembers.map(member => (
                <Option key={member.id} value={member.name}>
                  {member.name}{member.role ? ` (${member.role})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* Detailed Information */}
      <Divider orientation="left">Detailed Information</Divider>
      
      <Form.Item
        name="deliverables"
        label="Deliverables"
        rules={[{ max: 2000, message: 'Deliverables cannot exceed 2000 characters' }]}
      >
        <TextArea 
          rows={3} 
          placeholder="Describe expected deliverables"
        />
      </Form.Item>

      <Form.Item
        name="dependencies"
        label="Dependencies"
        rules={[{ max: 2000, message: 'Dependencies cannot exceed 2000 characters' }]}
      >
        <TextArea 
          rows={3} 
          placeholder="List any dependencies or prerequisites"
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="budget"
            label="Budget"
            rules={[
              { type: 'number', min: 0, message: 'Budget cannot be negative' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="0.00"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="successCriteria"
            label="Success Criteria"
            rules={[{ max: 1000, message: 'Success criteria cannot exceed 1000 characters' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Define success criteria"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="riskAssessment"
        label="Risk Assessment"
        rules={[{ max: 2000, message: 'Risk assessment cannot exceed 2000 characters' }]}
      >
        <TextArea 
          rows={3} 
          placeholder="Describe potential risks and mitigation strategies"
        />
      </Form.Item>

      {/* Form Actions */}
      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
          >
            {milestone ? 'Update Milestone' : 'Create Milestone'}
          </Button>
          <Button
            htmlType="button"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>
          <Button
            htmlType="button"
            icon={<CloseOutlined />}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default MilestoneForm;
