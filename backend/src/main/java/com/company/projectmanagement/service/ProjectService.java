package com.company.projectmanagement.service;

import com.company.projectmanagement.model.Project;
import com.company.projectmanagement.model.ProjectPhase;
import com.company.projectmanagement.model.KeyMilestone;
import com.company.projectmanagement.model.ProjectStatus;
import com.company.projectmanagement.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
public class ProjectService {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private ProjectPhaseService projectPhaseService;
    
    @Autowired
    private KeyMilestoneService milestoneService;
    
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }
    
    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }
    
    public Project saveProject(Project project) {
        return projectRepository.save(project);
    }
    
    public Project updateProject(Long id, Project projectDetails) {
        return projectRepository.findById(id)
                .map(project -> {
                    project.setProjectName(projectDetails.getProjectName());
                    project.setDaRecord(projectDetails.getDaRecord());
                    project.setTeam(projectDetails.getTeam());
                    project.setLead(projectDetails.getLead());
                    project.setItProjectStatus(projectDetails.getItProjectStatus());
                    project.setNearMilestone(projectDetails.getNearMilestone());
                    project.setNearMilestoneDate(projectDetails.getNearMilestoneDate());
                    project.setItExecutiveSummary(projectDetails.getItExecutiveSummary());
                    project.setKeyIssueAndRisk(projectDetails.getKeyIssueAndRisk());
                    project.setEscalation(projectDetails.getEscalation());
                    project.setNextCheckDate(projectDetails.getNextCheckDate());
                    project.setGoLiveDate(projectDetails.getGoLiveDate());
                    project.setDependency(projectDetails.getDependency());
                    project.setRelatedMaterials(projectDetails.getRelatedMaterials());
                    project.setProjectJiraLink(projectDetails.getProjectJiraLink());
                    project.setEstimation(projectDetails.getEstimation()); // 添加estimation字段更新
                    return projectRepository.save(project);
                })
                .orElseThrow(() -> new RuntimeException("Project not found with id " + id));
    }
    
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }
    
    public List<Project> getProjectsByStatus(ProjectStatus status) {
        return projectRepository.findByItProjectStatus(status);
    }
    
    public List<Project> getProjectsByTeam(Long teamId) {
        return projectRepository.findByTeamId(teamId);
    }
    
    public List<Project> getProjectsByLead(Long leadId) {
        return projectRepository.findByLeadId(leadId);
    }
    
    public List<Project> getEscalatedProjects() {
        return projectRepository.findEscalatedProjects();
    }
    
    public List<Project> getProjectsWithUpcomingCheckpoints(int daysAhead) {
        LocalDate checkDate = LocalDate.now().plusDays(daysAhead);
        return projectRepository.findProjectsWithUpcomingCheckpoints(checkDate);
    }
    
    public List<Project> searchProjectsByName(String projectName) {
        return projectRepository.findByProjectNameContainingIgnoreCase(projectName);
    }
    
    public List<Project> getProjectsInDateRange(LocalDate startDate, LocalDate endDate) {
        return projectRepository.findByNextCheckDateBetween(startDate, endDate);
    }
    
    public Project copyProject(Long originalProjectId) {
        // 获取原项目
        Project originalProject = projectRepository.findById(originalProjectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id " + originalProjectId));
        
        // 创建新项目副本
        Project copiedProject = new Project();
        copiedProject.setProjectName(originalProject.getProjectName() + " (Copy)");
        copiedProject.setDaRecord(null); // DA记录应该是唯一的，所以置空
        copiedProject.setTeam(originalProject.getTeam());
        copiedProject.setLead(originalProject.getLead());
        copiedProject.setItProjectStatus(ProjectStatus.AMBER); // 复制的项目默认设为AMBER状态
        copiedProject.setNearMilestone(originalProject.getNearMilestone());
        copiedProject.setNearMilestoneDate(originalProject.getNearMilestoneDate());
        copiedProject.setItExecutiveSummary(originalProject.getItExecutiveSummary());
        copiedProject.setKeyIssueAndRisk(originalProject.getKeyIssueAndRisk());
        copiedProject.setEscalation(false); // 复制的项目默认无升级
        copiedProject.setNextCheckDate(LocalDate.now().plusWeeks(1)); // 设置下次检查日期为一周后
        copiedProject.setGoLiveDate(originalProject.getGoLiveDate());
        copiedProject.setDependency(originalProject.getDependency());
        copiedProject.setRelatedMaterials(originalProject.getRelatedMaterials());
        copiedProject.setProjectJiraLink(originalProject.getProjectJiraLink());
        copiedProject.setEstimation(originalProject.getEstimation());
        
        // 保存新项目
        Project savedProject = projectRepository.save(copiedProject);
        
        // 复制项目阶段
        try {
            List<ProjectPhase> originalPhases = projectPhaseService.getProjectPhasesByProjectId(originalProjectId);
            for (ProjectPhase originalPhase : originalPhases) {
                ProjectPhase copiedPhase = new ProjectPhase();
                copiedPhase.setProject(savedProject);
                copiedPhase.setPhaseName(originalPhase.getPhaseName());
                copiedPhase.setStartDate(originalPhase.getStartDate());
                copiedPhase.setEndDate(originalPhase.getEndDate());
                copiedPhase.setPlannedStartDate(originalPhase.getPlannedStartDate());
                copiedPhase.setPlannedEndDate(originalPhase.getPlannedEndDate());
                copiedPhase.setStatus(ProjectPhase.PhaseStatus.NOT_STARTED); // 重置状态
                copiedPhase.setProgressPercentage(java.math.BigDecimal.ZERO); // 重置进度
                copiedPhase.setIsCompleted(false); // 重置完成状态
                copiedPhase.setIsOverdue(false); // 重置逾期状态
                copiedPhase.setDescription(originalPhase.getDescription());
                
                projectPhaseService.createProjectPhase(copiedPhase);
            }
        } catch (Exception e) {
            System.err.println("Error copying project phases: " + e.getMessage());
        }
        
        // 复制里程碑
        try {
            List<KeyMilestone> originalMilestones = milestoneService.getMilestonesByProjectId(originalProjectId);
            for (KeyMilestone originalMilestone : originalMilestones) {
                KeyMilestone copiedMilestone = new KeyMilestone();
                copiedMilestone.setProject(savedProject);
                copiedMilestone.setName(originalMilestone.getName());
                copiedMilestone.setDescription(originalMilestone.getDescription());
                copiedMilestone.setTargetDate(originalMilestone.getTargetDate());
                copiedMilestone.setStatus(KeyMilestone.MilestoneStatus.PENDING); // 重置状态
                copiedMilestone.setProgress(0); // 重置进度
                copiedMilestone.setPriority(originalMilestone.getPriority());
                copiedMilestone.setOwner(originalMilestone.getOwner());
                copiedMilestone.setDeliverables(originalMilestone.getDeliverables());
                copiedMilestone.setDependencies(originalMilestone.getDependencies());
                copiedMilestone.setSuccessCriteria(originalMilestone.getSuccessCriteria());
                copiedMilestone.setActualDate(null); // 清空实际完成日期
                
                milestoneService.createMilestone(copiedMilestone);
            }
        } catch (Exception e) {
            System.err.println("Error copying milestones: " + e.getMessage());
        }
        
        return savedProject;
    }
    
    public Map<String, Object> getProjectStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        List<Project> allProjects = projectRepository.findAll();
        
        statistics.put("totalProjects", allProjects.size());
        statistics.put("greenStatus", allProjects.stream()
                .mapToLong(p -> ProjectStatus.GREEN.equals(p.getItProjectStatus()) ? 1 : 0).sum());
        statistics.put("yellowStatus", allProjects.stream()
                .mapToLong(p -> ProjectStatus.YELLOW.equals(p.getItProjectStatus()) ? 1 : 0).sum());
        statistics.put("redStatus", allProjects.stream()
                .mapToLong(p -> ProjectStatus.RED.equals(p.getItProjectStatus()) ? 1 : 0).sum());
        statistics.put("escalatedProjects", allProjects.stream()
                .mapToLong(p -> Boolean.TRUE.equals(p.getEscalation()) ? 1 : 0).sum());
        
        return statistics;
    }
}
