import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Switch,
  Typography,
  Row,
  Col,
  Divider,
  Space
} from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import teamService from '../services/teamService';
import teamMemberService from '../services/teamMemberService';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProjectForm = ({ project, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  const isEdit = !!project;

  // Load teams and team members on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [teamsData, teamMembersData] = await Promise.all([
          teamService.getAllTeams(),
          teamMemberService.getAllTeamMembers()
        ]);
        setTeams(teamsData);
        setTeamMembers(teamMembersData);
      } catch (error) {
        console.error('Error loading teams and team members:', error);
      }
    };
    loadData();
  }, []);

  React.useEffect(() => {
    if (isEdit) {
      // Safely parse dates and validate them
      const parseDate = (dateValue) => {
        if (!dateValue) return null;
        
        // If it's already a dayjs object, return as is
        if (dayjs.isDayjs(dateValue)) return dateValue;
        
        // Try to parse the date
        const parsed = dayjs(dateValue);
        
        // Check if the parsed date is valid and within reasonable range
        const currentYear = dayjs().year();
        const minYear = currentYear - 10; // 10 years ago
        const maxYear = currentYear + 10;  // 10 years from now
        
        if (parsed.isValid() && parsed.year() >= minYear && parsed.year() <= maxYear) {
          return parsed;
        }
        
        // If invalid or out of range, return null
        console.warn(`Invalid date detected: ${dateValue}, setting to null`);
        return null;
      };

      form.setFieldsValue({
        ...project,
        teamId: project.team?.id,
        leadId: project.lead?.id,
        nearMilestoneDate: parseDate(project.nearMilestoneDate),
        nextCheckDate: parseDate(project.nextCheckDate),
        estimation: project.estimation || null, // 确保estimation字段正确初始化
      });
    }
  }, [project, form, isEdit]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Convert moment dates back to ISO strings and handle team/lead IDs
      const formattedValues = {
        ...values,
        team: values.teamId ? { id: values.teamId } : null,
        lead: values.leadId ? { id: values.leadId } : null,
        nearMilestoneDate: values.nearMilestoneDate ? values.nearMilestoneDate.format('YYYY-MM-DD') : null,
        nextCheckDate: values.nextCheckDate ? values.nextCheckDate.format('YYYY-MM-DD') : null,
        estimation: values.estimation ? parseFloat(values.estimation) : null,
      };
      
      // Remove the separate ID fields as we're sending nested objects
      delete formattedValues.teamId;
      delete formattedValues.leadId;
      
      await onSubmit(formattedValues);
      
      if (!isEdit) {
        form.resetFields();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>{isEdit ? 'Edit Project' : 'Create New Project'}</Title>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            itProjectStatus: 'GREEN',
            escalation: false,
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Project Name"
                name="projectName"
                rules={[{ required: true, message: 'Please enter project name' }]}
              >
                <Input placeholder="Enter project name" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                label="DA Record"
                name="daRecord"
              >
                <Input placeholder="Enter DA record" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Team"
                name="teamId"
              >
                <Select 
                  placeholder="Select team"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    // Safely handle option children text extraction
                    const optionText = typeof option.children === 'string' 
                      ? option.children 
                      : Array.isArray(option.children) 
                        ? option.children.join(' ')
                        : String(option.children || '');
                    return optionText.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                  }}
                >
                  {teams.map(team => (
                    <Option key={team.id} value={team.id}>
                      {team.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                label="Project Lead"
                name="leadId"
              >
                <Select 
                  placeholder="Select project lead"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    // Safely handle option children text extraction
                    const optionText = typeof option.children === 'string' 
                      ? option.children 
                      : Array.isArray(option.children) 
                        ? option.children.join(' ')
                        : String(option.children || '');
                    return optionText.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                  }}
                >
                  {teamMembers.map(member => (
                    <Option key={member.id} value={member.id}>
                      {member.name} {member.role && `(${member.role})`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={6}>
              <Form.Item
                label="IT Project Status"
                name="itProjectStatus"
              >
                <Select>
                  <Option value="GREEN">Green</Option>
                  <Option value="AMBER">Amber</Option>
                  <Option value="RED">Red</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={6}>
              <Form.Item
                label="Go Live Date"
                name="goLiveDate"
              >
                <Input placeholder="e.g., Q2 2025" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={6}>
              <Form.Item
                label="Estimation (HC/Month)"
                name="estimation"
                rules={[
                  { pattern: /^\d+(\.\d{1,2})?$/, message: 'Please enter a valid number (max 2 decimal places)' }
                ]}
              >
                <Input 
                  placeholder="e.g., 24.5" 
                  suffix="HC/M"
                  type="number"
                  step="0.1"
                  min="0"
                  max="999.99"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={6}>
              <Form.Item
                label="Escalation Required"
                name="escalation"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Milestones & Dates</Divider>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Near Milestone"
                name="nearMilestone"
              >
                <Input placeholder="e.g., Pilot SIT completion" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                label="Near Milestone Date"
                name="nearMilestoneDate"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  allowClear={true}
                  placeholder="Select milestone date"
                  disabledDate={(current) => {
                    // Disable dates more than 5 years in the past or future
                    const fiveYearsAgo = dayjs().subtract(5, 'years');
                    const fiveYearsFromNow = dayjs().add(5, 'years');
                    return current && (current < fiveYearsAgo || current > fiveYearsFromNow);
                  }}
                  onChange={(date, dateString) => {
                    console.log('NearMilestoneDate changed:', date, dateString);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Next Check Date (Checkpoint)"
            name="nextCheckDate"
          >
            <DatePicker 
              style={{ width: '100%' }}
              allowClear={true}
              placeholder="Select next check date"
              disabledDate={(current) => {
                // Disable dates more than 5 years in the past or future
                const fiveYearsAgo = dayjs().subtract(5, 'years');
                const fiveYearsFromNow = dayjs().add(5, 'years');
                return current && (current < fiveYearsAgo || current > fiveYearsFromNow);
              }}
              onChange={(date, dateString) => {
                console.log('NextCheckDate changed:', date, dateString);
              }}
            />
          </Form.Item>

          <Divider>Project Details</Divider>

          <Form.Item
            label="IT Executive Summary"
            name="itExecutiveSummary"
          >
            <TextArea
              rows={4}
              placeholder="Enter progress update and executive summary..."
            />
          </Form.Item>

          <Form.Item
            label="Key Issues & Risks"
            name="keyIssueAndRisk"
          >
            <TextArea
              rows={4}
              placeholder="Enter key issues, risks, and mitigation actions..."
            />
          </Form.Item>

          <Form.Item
            label="Dependencies"
            name="dependency"
          >
            <TextArea
              rows={3}
              placeholder="Enter project dependencies..."
            />
          </Form.Item>

          <Divider>Links & Materials</Divider>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Project JIRA Link"
                name="projectJiraLink"
              >
                <Input placeholder="https://jira.company.com/projects/..." />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                label="Related Materials"
                name="relatedMaterials"
              >
                <Input placeholder="Web links, confluence pages, etc." />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              {isEdit ? 'Update Project' : 'Create Project'}
            </Button>
            
            <Button
              onClick={onCancel}
              icon={<CloseOutlined />}
            >
              Cancel
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default ProjectForm;
