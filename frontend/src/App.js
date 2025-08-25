import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Button, message } from 'antd';
import {
  ProjectOutlined,
  DashboardOutlined,
  TeamOutlined,
  AlertOutlined,
  CalendarOutlined,
  PlusOutlined,
  HeartOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import TeamList from './components/TeamList';
import TeamForm from './components/TeamForm';
import MilestoneList from './components/MilestoneList';
import Dashboard from './components/Dashboard';
import SystemHealthCheck from './components/SystemHealthCheck';
import GanttChart from './components/GanttChart';
import EnhancedGanttChart from './components/EnhancedGanttChart';
import GanttDemo from './components/GanttDemo';
import projectService from './services/projectService';
import teamService from './services/teamService';
import teamMemberService from './services/teamMemberService';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function App() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
    loadTeams();
    loadTeamMembers();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      // 添加测试数据以显示Estimation字段效果
      const mockProjects = [
        {
          id: 1,
          projectName: "E-commerce Platform",
          itProjectStatus: "GREEN",
          estimation: 24.5,
          daRecord: "DA-2024-001",
          team: { id: 1, name: "Frontend Team" },
          lead: { id: 1, name: "John Smith" },
          nearMilestone: "Beta Release",
          nearMilestoneDate: "2024-09-15",
          nextCheckDate: "2024-08-20",
          goLiveDate: "2024-10-01",
          escalation: false,
          itExecutiveSummary: "Project is progressing well with all milestones on track.",
          keyIssueAndRisk: "Minor performance issues in payment processing module.",
          dependency: "Third-party payment gateway integration",
          projectJiraLink: "https://jira.company.com/projects/ECP",
          relatedMaterials: "https://confluence.company.com/display/ECP/Technical+Specifications",
          keyMilestones: [
            {
              id: 1,
              name: "MVP Release",
              description: "Minimum viable product with core e-commerce features",
              targetDate: "2025-09-15",
              status: "in_progress",
              progress: 75,
              priority: "high",
              owner: "John Smith",
              deliverables: "Shopping cart, payment processing, user authentication",
              dependencies: "Payment gateway API integration",
              successCriteria: "All core features functional and tested",
              createdDate: "2024-07-01"
            },
            {
              id: 2,
              name: "Performance Optimization",
              description: "Optimize application performance and scalability",
              targetDate: "2025-10-30",
              status: "pending",
              progress: 20,
              priority: "medium",
              owner: "Technical Team",
              deliverables: "Performance test results, optimization report",
              dependencies: "MVP completion",
              successCriteria: "Page load time under 2 seconds",
              createdDate: "2024-07-01"
            }
          ]
        },
        {
          id: 2,
          projectName: "Mobile Banking App",
          itProjectStatus: "AMBER",
          estimation: 18.0,
          daRecord: "DA-2024-002",
          team: { id: 2, name: "Mobile Team" },
          lead: { id: 2, name: "Sarah Johnson" },
          nearMilestone: "Security Testing",
          nearMilestoneDate: "2024-08-25",
          nextCheckDate: "2024-08-18",
          goLiveDate: "2024-11-15",
          escalation: false,
          itExecutiveSummary: "Security testing phase revealing some vulnerabilities that need addressing.",
          keyIssueAndRisk: "Security compliance requirements causing delays.",
          dependency: "External security audit completion",
          projectJiraLink: "https://jira.company.com/projects/MBA",
          relatedMaterials: "Security Compliance Documentation",
          keyMilestones: [
            {
              id: 3,
              name: "Security Testing",
              description: "Comprehensive security testing and vulnerability assessment",
              targetDate: "2025-08-25",
              status: "in_progress",
              progress: 60,
              priority: "critical",
              owner: "Sarah Johnson",
              deliverables: "Security test report, vulnerability assessment",
              dependencies: "External security audit",
              successCriteria: "All critical vulnerabilities resolved",
              createdDate: "2024-06-15"
            }
          ]
        },
        {
          id: 3,
          projectName: "Data Analytics Dashboard",
          itProjectStatus: "RED",
          estimation: 32.5,
          daRecord: "DA-2024-003",
          team: { id: 3, name: "Analytics Team" },
          lead: { id: 3, name: "Mike Chen" },
          nearMilestone: "Data Integration",
          nearMilestoneDate: "2024-09-01",
          nextCheckDate: "2024-08-16",
          goLiveDate: "2024-12-01",
          escalation: true,
          itExecutiveSummary: "Data integration challenges causing significant delays.",
          keyIssueAndRisk: "Legacy data sources not compatible with new analytics platform.",
          dependency: "Legacy system data mapping completion",
          relatedMaterials: "https://docs.company.com/analytics-architecture",
          keyMilestones: [
            {
              id: 4,
              name: "Data Integration",
              description: "Integrate legacy data sources with new analytics platform",
              targetDate: "2025-09-01",
              status: "at_risk",
              progress: 30,
              priority: "critical",
              owner: "Mike Chen",
              deliverables: "Data pipeline, ETL processes, data validation reports",
              dependencies: "Legacy system data mapping",
              successCriteria: "All data sources integrated and validated",
              riskAssessment: "Legacy systems compatibility issues causing delays",
              createdDate: "2024-06-01"
            }
          ]
        },
        {
          id: 4,
          projectName: "Legacy System Migration",
          itProjectStatus: "GREEN",
          estimation: null, // 测试没有estimation值的情况
          daRecord: "DA-2024-004",
          team: { id: 1, name: "Backend Team" },
          lead: { id: 4, name: "Alice Wang" },
          nearMilestone: "Planning Phase",
          nearMilestoneDate: "2024-08-30",
          nextCheckDate: "2024-08-22",
          goLiveDate: "2025-01-15",
          escalation: false,
          itExecutiveSummary: "Planning phase completed successfully, ready to move to implementation.",
          keyIssueAndRisk: "Resource allocation challenges for migration team.",
          dependency: "Infrastructure team availability",
          projectJiraLink: "https://jira.company.com/projects/LSM",
          relatedMaterials: "Migration Strategy and Timeline Document",
          keyMilestones: []
        },
        {
          id: 5,
          projectName: "AI Chatbot Implementation",
          itProjectStatus: "AMBER",
          estimation: 45.0,
          daRecord: "DA-2024-005",
          team: { id: 4, name: "AI Team" },
          lead: { id: 5, name: "David Brown" },
          nearMilestone: "Model Training",
          nearMilestoneDate: "2024-09-10",
          nextCheckDate: "2024-08-19",
          goLiveDate: "2024-12-15",
          escalation: false,
          itExecutiveSummary: "AI model training showing promising results with 85% accuracy achieved.",
          keyIssueAndRisk: "Training data quality needs improvement for edge cases.",
          dependency: "Additional training dataset acquisition",
          projectJiraLink: "https://jira.company.com/projects/AIC",
          relatedMaterials: "https://wiki.company.com/ai-model-documentation",
          keyMilestones: [
            {
              id: 5,
              name: "Model Training",
              description: "Train AI chatbot model with customer service data",
              targetDate: "2025-09-10",
              status: "in_progress",
              progress: 85,
              priority: "high",
              owner: "David Brown",
              deliverables: "Trained model, accuracy metrics, test results",
              dependencies: "Training dataset preparation",
              successCriteria: "Model achieves 90% accuracy on test dataset",
              createdDate: "2024-07-15"
            }
          ]
        },
        {
          id: 6,
          projectName: "Cloud Infrastructure Migration",
          itProjectStatus: "GREEN",
          estimation: 28.0,
          daRecord: "DA-2024-006",
          team: { id: 5, name: "DevOps Team" },
          lead: { id: 10, name: "James Rodriguez" },
          nearMilestone: "Infrastructure Setup",
          nearMilestoneDate: "2024-09-20",
          nextCheckDate: "2024-08-25",
          goLiveDate: "2025-02-01",
          escalation: false,
          itExecutiveSummary: "Cloud migration proceeding smoothly with AWS infrastructure setup complete.",
          keyIssueAndRisk: "Data migration timeline needs careful coordination.",
          dependency: "Network security approval",
          projectJiraLink: "https://jira.company.com/projects/CIM",
          relatedMaterials: "Cloud Architecture Documentation",
          keyMilestones: [
            {
              id: 6,
              name: "Infrastructure Setup",
              description: "Setup AWS cloud infrastructure and configure services",
              targetDate: "2025-09-20",
              status: "in_progress",
              progress: 70,
              priority: "high",
              owner: "James Rodriguez",
              deliverables: "AWS infrastructure, monitoring setup, security configuration",
              dependencies: "Network security approval",
              successCriteria: "All services operational in cloud environment",
              createdDate: "2024-07-20"
            }
          ]
        },
        {
          id: 7,
          projectName: "Customer Portal Redesign",
          itProjectStatus: "AMBER",
          estimation: 20.5,
          daRecord: "DA-2024-007",
          team: { id: 1, name: "Frontend Team" },
          lead: { id: 6, name: "Lisa Anderson" },
          nearMilestone: "UI/UX Design Review",
          nearMilestoneDate: "2024-08-30",
          nextCheckDate: "2024-08-20",
          goLiveDate: "2024-11-30",
          escalation: false,
          itExecutiveSummary: "Design phase nearing completion with positive stakeholder feedback.",
          keyIssueAndRisk: "Browser compatibility testing revealing minor issues.",
          dependency: "Customer feedback on prototypes",
          projectJiraLink: "https://jira.company.com/projects/CPR",
          relatedMaterials: "Design System Documentation",
          keyMilestones: [
            {
              id: 7,
              name: "UI/UX Design Review",
              description: "Complete design review and finalize user interface",
              targetDate: "2025-08-30",
              status: "in_progress",
              progress: 80,
              priority: "medium",
              owner: "Lisa Anderson",
              deliverables: "Final UI designs, design system, user journey maps",
              dependencies: "Customer feedback on prototypes",
              successCriteria: "Stakeholder approval on all designs",
              createdDate: "2024-06-10"
            }
          ]
        },
        {
          id: 8,
          projectName: "API Gateway Implementation",
          itProjectStatus: "RED",
          estimation: 35.0,
          daRecord: "DA-2024-008",
          team: { id: 6, name: "Backend Team" },
          lead: { id: 4, name: "Alice Wang" },
          nearMilestone: "Gateway Configuration",
          nearMilestoneDate: "2024-09-05",
          nextCheckDate: "2024-08-18",
          goLiveDate: "2025-01-20",
          escalation: true,
          itExecutiveSummary: "API gateway implementation facing performance bottlenecks.",
          keyIssueAndRisk: "Load testing revealing scalability concerns under high traffic.",
          dependency: "Performance optimization consultancy",
          projectJiraLink: "https://jira.company.com/projects/AGI",
          relatedMaterials: "API Documentation and Performance Reports",
          keyMilestones: [
            {
              id: 8,
              name: "Gateway Configuration",
              description: "Configure API gateway with routing and security policies",
              targetDate: "2025-09-05",
              status: "at_risk",
              progress: 45,
              priority: "critical",
              owner: "Alice Wang",
              deliverables: "Gateway configuration, security policies, routing rules",
              dependencies: "Performance optimization consultancy",
              successCriteria: "Gateway handles 1000 requests per second",
              riskAssessment: "Performance issues may delay implementation",
              createdDate: "2024-05-15"
            }
          ]
        }
      ];
      setProjects(mockProjects);
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const data = await teamService.getAllTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
      // 添加测试数据
      const mockTeams = [
        {
          id: 1,
          name: "Frontend Team",
          description: "Responsible for user interface development and user experience",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-08-15T14:30:00Z",
          members: [
            { id: 1, name: "John Smith", role: "Senior Frontend Developer" },
            { id: 6, name: "Lisa Anderson", role: "UI/UX Designer" }
          ]
        },
        {
          id: 2,
          name: "Mobile Team",
          description: "Mobile application development for iOS and Android platforms",
          createdAt: "2024-02-01T09:00:00Z",
          updatedAt: "2024-08-10T16:20:00Z",
          members: [
            { id: 2, name: "Sarah Johnson", role: "Mobile Lead" },
            { id: 7, name: "Tom Wilson", role: "iOS Developer" }
          ]
        },
        {
          id: 3,
          name: "Analytics Team",
          description: "Data analytics and business intelligence solutions",
          createdAt: "2024-01-20T11:00:00Z",
          updatedAt: "2024-08-12T09:15:00Z",
          members: [
            { id: 3, name: "Mike Chen", role: "Data Analyst" },
            { id: 8, name: "Emma Davis", role: "BI Developer" }
          ]
        },
        {
          id: 4,
          name: "AI Team",
          description: "Artificial intelligence and machine learning projects",
          createdAt: "2024-03-01T08:00:00Z",
          updatedAt: "2024-08-14T13:45:00Z",
          members: [
            { id: 5, name: "David Brown", role: "AI Engineer" },
            { id: 9, name: "Grace Lee", role: "ML Researcher" }
          ]
        },
        {
          id: 5,
          name: "DevOps Team",
          description: "Infrastructure automation and deployment management",
          createdAt: "2024-03-15T10:00:00Z",
          updatedAt: "2024-08-15T11:20:00Z",
          members: [
            { id: 10, name: "James Rodriguez", role: "DevOps Engineer" },
            { id: 12, name: "Alex Kim", role: "Security Specialist" }
          ]
        },
        {
          id: 6,
          name: "Backend Team",
          description: "Server-side development and API management",
          createdAt: "2024-02-20T09:30:00Z",
          updatedAt: "2024-08-16T14:15:00Z",
          members: [
            { id: 4, name: "Alice Wang", role: "Backend Developer" },
            { id: 11, name: "Sophie Turner", role: "QA Engineer" }
          ]
        }
      ];
      setTeams(mockTeams);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const data = await teamMemberService.getAllTeamMembers();
      setTeamMembers(data);
    } catch (error) {
      console.error('Error loading team members:', error);
      // 添加测试数据
      const mockTeamMembers = [
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
        { id: 12, name: "Alex Kim", role: "Security Specialist", email: "alex.kim@company.com" }
      ];
      setTeamMembers(mockTeamMembers);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      await projectService.createProject(projectData);
      loadProjects();
      setCurrentView('projects');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleUpdateProject = async (id, projectData) => {
    try {
      await projectService.updateProject(id, projectData);
      loadProjects();
      setSelectedProject(null);
      setCurrentView('projects');
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await projectService.deleteProject(id);
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleCopyProject = async (project) => {
    try {
      setLoading(true);
      const copiedProject = await projectService.copyProject(project.id);
      await loadProjects(); // 重新加载项目列表
      message.success(`Project "${project.projectName}" copied successfully as "${copiedProject.projectName}"`);
    } catch (error) {
      console.error('Error copying project:', error);
      message.error('Failed to copy project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Team handling functions
  const handleCreateTeam = async (teamData) => {
    try {
      const newTeam = await teamService.createTeam(teamData);
      await loadTeams();
      await loadTeamMembers(); // Refresh team members as well
      setCurrentView('teams');
      console.log('Team created successfully:', newTeam);
      return newTeam; // Return the created team so TeamForm can use it for member assignment
    } catch (error) {
      console.error('Error creating team:', error);
      throw error; // Re-throw so the form can handle the error
    }
  };

  const handleUpdateTeam = async (id, teamData) => {
    try {
      console.log('App: Updating team with data:', teamData); // Debug log
      
      // Update team basic information
      const updatedTeam = await teamService.updateTeam(id, teamData);
      
      await loadTeams();
      await loadTeamMembers(); // Refresh team members as well
      setSelectedTeam(null);
      setCurrentView('teams');
      return updatedTeam; // Return the updated team for TeamForm to use
    } catch (error) {
      console.error('Error updating team:', error);
      throw error; // Re-throw so the form can handle the error
    }
  };

  const handleDeleteTeam = async (id) => {
    try {
      await teamService.deleteTeam(id);
      loadTeams();
      loadTeamMembers(); // Refresh team members as well
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
    },
    {
      key: 'teams',
      icon: <TeamOutlined />,
      label: 'Teams',
    },
    {
      key: 'risks',
      icon: <AlertOutlined />,
      label: 'Risks & Issues',
    },
    {
      key: 'milestones',
      icon: <CalendarOutlined />,
      label: 'Milestones',
    },
    {
      key: 'gantt-chart',
      icon: <BarChartOutlined />,
      label: 'Gantt Chart',
    },
    {
      key: 'enhanced-gantt',
      icon: <BarChartOutlined />,
      label: 'Enhanced Gantt',
    },
    {
      key: 'gantt-demo',
      icon: <BarChartOutlined />,
      label: 'New Gantt Design',
    },
    {
      key: 'health-check',
      icon: <HeartOutlined />,
      label: 'System Health',
    },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard projects={projects} teams={teams} teamMembers={teamMembers} />;
      case 'projects':
        return (
          <ProjectList
            projects={projects}
            onEdit={(project) => {
              setSelectedProject(project);
              setCurrentView('edit-project');
            }}
            onDelete={handleDeleteProject}
            onCopy={handleCopyProject}
            loading={loading}
          />
        );
      case 'create-project':
        return (
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setCurrentView('projects')}
          />
        );
      case 'edit-project':
        return (
          <ProjectForm
            project={selectedProject}
            onSubmit={(data) => handleUpdateProject(selectedProject.id, data)}
            onCancel={() => {
              setSelectedProject(null);
              setCurrentView('projects');
            }}
          />
        );
      case 'teams':
        return (
          <TeamList
            teams={teams}
            teamMembers={teamMembers}
            onEdit={(team) => {
              setSelectedTeam(team);
              setCurrentView('edit-team');
            }}
            onDelete={handleDeleteTeam}
            onCreate={() => setCurrentView('create-team')}
            onUpdateTeamMembers={async (teamId, memberIds) => {
              try {
                if (teamId && memberIds !== undefined) {
                  // Update specific team members
                  await teamService.updateTeamMembers(teamId, memberIds);
                }
                // Always refresh data
                await loadTeams(); // Refresh teams data
                await loadTeamMembers(); // Refresh team members data
              } catch (error) {
                console.error('Error updating team members:', error);
                throw error; // Re-throw to let the UI component handle the error
              }
            }}
            loading={loading}
          />
        );
      case 'create-team':
        return (
          <TeamForm
            teamMembers={teamMembers}
            onSubmit={handleCreateTeam}
            onCancel={() => setCurrentView('teams')}
          />
        );
      case 'edit-team':
        return (
          <TeamForm
            team={selectedTeam}
            teamMembers={teamMembers}
            onSubmit={(data) => handleUpdateTeam(selectedTeam.id, data)}
            onCancel={() => {
              setSelectedTeam(null);
              setCurrentView('teams');
            }}
          />
        );
      case 'milestones':
        return (
          <MilestoneList
            projects={projects}
            onUpdateProject={handleUpdateProject}
            loading={loading}
          />
        );
      case 'gantt-chart':
        return (
          <GanttChart
            projects={projects}
            loading={loading}
            onUpdatePhase={(phaseId, phaseData) => {
              console.log('Phase updated:', phaseId, phaseData);
              // You can add phase update logic here if needed
            }}
          />
        );
      case 'enhanced-gantt':
        return (
          <EnhancedGanttChart
            projects={projects}
            loading={loading}
            onUpdatePhase={(phaseId, phaseData) => {
              console.log('Enhanced phase updated:', phaseId, phaseData);
              // You can add phase update logic here if needed
            }}
          />
        );
      case 'gantt-demo':
        return <GanttDemo />;
      case 'health-check':
        return <SystemHealthCheck />;
      default:
        return <div>Feature coming soon...</div>;
    }
  };

  return (
    <Layout className="app-layout">
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          Project Management System
        </Title>
        <div style={{ marginLeft: 'auto' }}>
          {currentView === 'projects' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCurrentView('create-project')}
            >
              New Project
            </Button>
          )}
          {currentView === 'teams' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCurrentView('create-team')}
            >
              New Team
            </Button>
          )}
        </div>
      </Header>
      
      <Layout>
        <Sider width={250} className="sidebar">
          <Menu
            mode="inline"
            selectedKeys={[currentView]}
            items={menuItems}
            onClick={({ key }) => {
              if (key === 'edit-project' || key === 'edit-team') return;
              setCurrentView(key);
              setSelectedProject(null);
              setSelectedTeam(null);
            }}
          />
        </Sider>
        
        <Layout>
          <Content className="main-content">
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
