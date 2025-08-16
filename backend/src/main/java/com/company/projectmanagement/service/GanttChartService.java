package com.company.projectmanagement.service;

import com.company.projectmanagement.model.Project;
import com.company.projectmanagement.model.ProjectPhase;
import com.company.projectmanagement.repository.ProjectPhaseRepository;
import com.company.projectmanagement.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class GanttChartService {
    
    @Autowired
    private ProjectPhaseRepository projectPhaseRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    // 获取甘特图数据
    public Map<String, Object> getGanttChartData() {
        Map<String, Object> result = new HashMap<>();
        
        // 获取所有项目和阶段
        List<Project> projects = projectRepository.findAll();
        List<Map<String, Object>> ganttData = new ArrayList<>();
        
        for (Project project : projects) {
            List<ProjectPhase> phases = projectPhaseRepository.findByProjectIdOrderByPhaseName(project.getId());
            
            Map<String, Object> projectData = new HashMap<>();
            projectData.put("id", project.getId());
            projectData.put("projectName", project.getProjectName());
            projectData.put("teamName", project.getTeam() != null ? project.getTeam().getName() : "No Team");
            projectData.put("leadName", project.getLead() != null ? project.getLead().getName() : "No Lead");
            projectData.put("status", project.getItProjectStatus());
            
            // 计算项目整体状态
            Map<String, Object> projectStatus = calculateProjectStatus(phases);
            projectData.put("overallStatus", projectStatus.get("status"));
            projectData.put("overallProgress", projectStatus.get("progress"));
            projectData.put("isCompleted", projectStatus.get("isCompleted"));
            projectData.put("isOverdue", projectStatus.get("isOverdue"));
            
            // 阶段数据
            List<Map<String, Object>> phaseData = phases.stream().map(phase -> {
                Map<String, Object> phaseMap = new HashMap<>();
                phaseMap.put("id", phase.getId());
                phaseMap.put("phaseName", phase.getPhaseName());
                phaseMap.put("status", phase.getStatus());
                phaseMap.put("startDate", phase.getStartDate());
                phaseMap.put("endDate", phase.getEndDate());
                phaseMap.put("plannedStartDate", phase.getPlannedStartDate());
                phaseMap.put("plannedEndDate", phase.getPlannedEndDate());
                phaseMap.put("progressPercentage", phase.getProgressPercentage());
                phaseMap.put("isCompleted", phase.getIsCompleted());
                phaseMap.put("isOverdue", phase.getIsOverdue());
                phaseMap.put("description", phase.getDescription());
                return phaseMap;
            }).collect(Collectors.toList());
            
            projectData.put("phases", phaseData);
            
            // 项目里程碑
            if (project.getKeyMilestones() != null) {
                projectData.put("milestones", project.getKeyMilestones().stream().map(milestone -> {
                    Map<String, Object> milestoneMap = new HashMap<>();
                    milestoneMap.put("id", milestone.getId());
                    milestoneMap.put("name", milestone.getName());
                    milestoneMap.put("targetDate", milestone.getTargetDate());
                    milestoneMap.put("status", milestone.getStatus());
                    milestoneMap.put("progress", milestone.getProgress());
                    return milestoneMap;
                }).collect(Collectors.toList()));
            } else {
                projectData.put("milestones", new ArrayList<>());
            }
            
            ganttData.add(projectData);
        }
        
        result.put("projects", ganttData);
        result.put("statistics", getGanttStatistics());
        result.put("phaseStatistics", getPhaseStatistics());
        result.put("currentDate", LocalDate.now());
        
        return result;
    }
    
    // 计算项目整体状态
    private Map<String, Object> calculateProjectStatus(List<ProjectPhase> phases) {
        Map<String, Object> status = new HashMap<>();
        
        if (phases.isEmpty()) {
            status.put("status", "NOT_STARTED");
            status.put("progress", 0.0);
            status.put("isCompleted", false);
            status.put("isOverdue", false);
            return status;
        }
        
        long completedPhases = phases.stream().mapToLong(p -> p.getIsCompleted() ? 1 : 0).sum();
        long inProgressPhases = phases.stream().mapToLong(p -> 
            p.getStatus() == ProjectPhase.PhaseStatus.IN_PROGRESS ? 1 : 0).sum();
        boolean hasOverdue = phases.stream().anyMatch(ProjectPhase::getIsOverdue);
        
        // 计算整体进度
        double overallProgress = phases.stream()
            .mapToDouble(p -> p.getProgressPercentage() != null ? p.getProgressPercentage().doubleValue() : 0.0)
            .average()
            .orElse(0.0);
        
        // 确定整体状态
        String overallStatus;
        boolean isCompleted = completedPhases == phases.size();
        
        if (isCompleted) {
            overallStatus = "COMPLETED";
        } else if (inProgressPhases > 0) {
            overallStatus = "IN_PROGRESS";
        } else {
            overallStatus = "NOT_STARTED";
        }
        
        status.put("status", overallStatus);
        status.put("progress", Math.round(overallProgress * 100.0) / 100.0);
        status.put("isCompleted", isCompleted);
        status.put("isOverdue", hasOverdue);
        
        return status;
    }
    
    // 获取甘特图统计信息
    public Map<String, Object> getGanttStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Project> allProjects = projectRepository.findAll();
        int totalProjects = allProjects.size();
        
        int completedProjects = 0;
        int inProgressProjects = 0;
        int notStartedProjects = 0;
        int overdueProjects = 0;
        
        for (Project project : allProjects) {
            List<ProjectPhase> phases = projectPhaseRepository.findByProjectIdOrderByPhaseName(project.getId());
            Map<String, Object> projectStatus = calculateProjectStatus(phases);
            
            String status = (String) projectStatus.get("status");
            Boolean isOverdue = (Boolean) projectStatus.get("isOverdue");
            
            switch (status) {
                case "COMPLETED":
                    completedProjects++;
                    break;
                case "IN_PROGRESS":
                    inProgressProjects++;
                    break;
                case "NOT_STARTED":
                    notStartedProjects++;
                    break;
            }
            
            if (isOverdue) {
                overdueProjects++;
            }
        }
        
        stats.put("totalProjects", totalProjects);
        stats.put("completedProjects", completedProjects);
        stats.put("inProgressProjects", inProgressProjects);
        stats.put("notStartedProjects", notStartedProjects);
        stats.put("overdueProjects", overdueProjects);
        
        // 计算百分比
        if (totalProjects > 0) {
            stats.put("completionRate", Math.round((completedProjects * 100.0 / totalProjects) * 100.0) / 100.0);
            stats.put("overdueRate", Math.round((overdueProjects * 100.0 / totalProjects) * 100.0) / 100.0);
        } else {
            stats.put("completionRate", 0.0);
            stats.put("overdueRate", 0.0);
        }
        
        return stats;
    }
    
    // 获取阶段统计信息
    public List<Map<String, Object>> getPhaseStatistics() {
        List<Object[]> phaseStats = projectPhaseRepository.getPhaseStatistics();
        
        return phaseStats.stream().map(stat -> {
            Map<String, Object> phaseMap = new HashMap<>();
            phaseMap.put("phaseName", stat[0]);
            phaseMap.put("totalCount", stat[1]);
            phaseMap.put("notStartedCount", stat[2]);
            phaseMap.put("inProgressCount", stat[3]);
            phaseMap.put("completedCount", stat[4]);
            phaseMap.put("overdueCount", stat[5]);
            return phaseMap;
        }).collect(Collectors.toList());
    }
    
    // 更新阶段
    public ProjectPhase updatePhase(Long phaseId, ProjectPhase phaseDetails) {
        return projectPhaseRepository.findById(phaseId)
            .map(phase -> {
                if (phaseDetails.getStartDate() != null) {
                    phase.setStartDate(phaseDetails.getStartDate());
                }
                if (phaseDetails.getEndDate() != null) {
                    phase.setEndDate(phaseDetails.getEndDate());
                }
                if (phaseDetails.getPlannedStartDate() != null) {
                    phase.setPlannedStartDate(phaseDetails.getPlannedStartDate());
                }
                if (phaseDetails.getPlannedEndDate() != null) {
                    phase.setPlannedEndDate(phaseDetails.getPlannedEndDate());
                }
                if (phaseDetails.getStatus() != null) {
                    phase.setStatus(phaseDetails.getStatus());
                }
                if (phaseDetails.getProgressPercentage() != null) {
                    phase.setProgressPercentage(phaseDetails.getProgressPercentage());
                }
                if (phaseDetails.getDescription() != null) {
                    phase.setDescription(phaseDetails.getDescription());
                }
                
                return projectPhaseRepository.save(phase);
            })
            .orElseThrow(() -> new RuntimeException("Phase not found with id " + phaseId));
    }
    
    // 更新逾期状态（定时任务可调用）
    public void updateOverdueStatus() {
        List<ProjectPhase> overduePhases = projectPhaseRepository.findOverduePhases();
        for (ProjectPhase phase : overduePhases) {
            phase.setIsOverdue(true);
            if (phase.getStatus() == ProjectPhase.PhaseStatus.IN_PROGRESS) {
                phase.setStatus(ProjectPhase.PhaseStatus.DELAYED);
            }
        }
        projectPhaseRepository.saveAll(overduePhases);
    }
}
