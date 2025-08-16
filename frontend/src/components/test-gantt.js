// Test file to verify GanttChart component works
import React from 'react';
import GanttChart from './GanttChart';

const TestGanttChart = () => {
  // Mock projects data for testing
  const mockProjects = [
    {
      id: 1,
      projectName: "E-commerce Platform",
      itProjectStatus: "GREEN",
      estimation: 24.5,
      projectManager: "John Smith",
      team: { name: "Frontend Team" },
      description: "Building a new e-commerce platform",
      keyMilestones: [
        {
          id: 1,
          name: "Design Complete",
          targetDate: "2025-03-15",
          priority: "HIGH"
        }
      ]
    },
    {
      id: 2,
      projectName: "Mobile App Development",
      itProjectStatus: "AMBER",
      estimation: 18.0,
      projectManager: "Jane Doe",
      team: { name: "Mobile Team" },
      description: "Developing mobile application",
      keyMilestones: [
        {
          id: 2,
          name: "Beta Release",
          targetDate: "2025-06-30",
          priority: "CRITICAL"
        }
      ]
    }
  ];

  return (
    <div>
      <h1>Gantt Chart Test</h1>
      <GanttChart 
        projects={mockProjects} 
        loading={false}
        onUpdatePhase={(data) => console.log('Phase updated:', data)}
      />
    </div>
  );
};

export default TestGanttChart;
