package com.company.projectmanagement.service;

import com.company.projectmanagement.model.KeyMilestone;
import com.company.projectmanagement.model.KeyMilestone.MilestoneStatus;
import com.company.projectmanagement.model.KeyMilestone.Priority;
import com.company.projectmanagement.model.Project;
import com.company.projectmanagement.repository.KeyMilestoneRepository;
import com.company.projectmanagement.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class KeyMilestoneService {
    
    @Autowired
    private KeyMilestoneRepository milestoneRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    /**
     * Get all milestones
     */
    public List<KeyMilestone> getAllMilestones() {
        return milestoneRepository.findAll();
    }
    
    /**
     * Get milestone by ID
     */
    public Optional<KeyMilestone> getMilestoneById(Long id) {
        return milestoneRepository.findById(id);
    }
    
    /**
     * Get milestones by project ID
     */
    public List<KeyMilestone> getMilestonesByProjectId(Long projectId) {
        return milestoneRepository.findByProjectIdOrderByTargetDateAsc(projectId);
    }
    
    /**
     * Create a new milestone
     */
    public KeyMilestone createMilestone(KeyMilestone milestone) {
        // Validate project exists
        if (milestone.getProject() != null && milestone.getProject().getId() != null) {
            Optional<Project> project = projectRepository.findById(milestone.getProject().getId());
            if (project.isPresent()) {
                milestone.setProject(project.get());
            } else {
                throw new RuntimeException("Project not found with ID: " + milestone.getProject().getId());
            }
        } else {
            throw new RuntimeException("Project ID is required for milestone creation");
        }
        
        // Set default values if not provided
        if (milestone.getStatus() == null) {
            milestone.setStatus(MilestoneStatus.PENDING);
        }
        if (milestone.getPriority() == null) {
            milestone.setPriority(Priority.MEDIUM);
        }
        if (milestone.getProgress() == null) {
            milestone.setProgress(0);
        }
        if (milestone.getCreatedDate() == null) {
            milestone.setCreatedDate(LocalDate.now());
        }
        
        return milestoneRepository.save(milestone);
    }
    
    /**
     * Update an existing milestone
     */
    public KeyMilestone updateMilestone(Long id, KeyMilestone milestoneDetails) {
        Optional<KeyMilestone> optionalMilestone = milestoneRepository.findById(id);
        if (optionalMilestone.isPresent()) {
            KeyMilestone milestone = optionalMilestone.get();
            
            // Update fields
            if (milestoneDetails.getName() != null) {
                milestone.setName(milestoneDetails.getName());
            }
            if (milestoneDetails.getDescription() != null) {
                milestone.setDescription(milestoneDetails.getDescription());
            }
            if (milestoneDetails.getTargetDate() != null) {
                milestone.setTargetDate(milestoneDetails.getTargetDate());
            }
            if (milestoneDetails.getActualDate() != null) {
                milestone.setActualDate(milestoneDetails.getActualDate());
            }
            if (milestoneDetails.getStatus() != null) {
                milestone.setStatus(milestoneDetails.getStatus());
            }
            if (milestoneDetails.getPriority() != null) {
                milestone.setPriority(milestoneDetails.getPriority());
            }
            if (milestoneDetails.getProgress() != null) {
                milestone.setProgress(milestoneDetails.getProgress());
            }
            if (milestoneDetails.getOwner() != null) {
                milestone.setOwner(milestoneDetails.getOwner());
            }
            if (milestoneDetails.getDeliverables() != null) {
                milestone.setDeliverables(milestoneDetails.getDeliverables());
            }
            if (milestoneDetails.getDependencies() != null) {
                milestone.setDependencies(milestoneDetails.getDependencies());
            }
            if (milestoneDetails.getBudget() != null) {
                milestone.setBudget(milestoneDetails.getBudget());
            }
            if (milestoneDetails.getRiskAssessment() != null) {
                milestone.setRiskAssessment(milestoneDetails.getRiskAssessment());
            }
            if (milestoneDetails.getSuccessCriteria() != null) {
                milestone.setSuccessCriteria(milestoneDetails.getSuccessCriteria());
            }
            
            return milestoneRepository.save(milestone);
        } else {
            throw new RuntimeException("Milestone not found with ID: " + id);
        }
    }
    
    /**
     * Delete a milestone
     */
    public void deleteMilestone(Long id) {
        if (milestoneRepository.existsById(id)) {
            milestoneRepository.deleteById(id);
        } else {
            throw new RuntimeException("Milestone not found with ID: " + id);
        }
    }
    
    /**
     * Get milestones by status
     */
    public List<KeyMilestone> getMilestonesByStatus(MilestoneStatus status) {
        return milestoneRepository.findByStatus(status);
    }
    
    /**
     * Get milestones by priority
     */
    public List<KeyMilestone> getMilestonesByPriority(Priority priority) {
        return milestoneRepository.findByPriority(priority);
    }
    
    /**
     * Get overdue milestones
     */
    public List<KeyMilestone> getOverdueMilestones() {
        return milestoneRepository.findOverdueMilestones(LocalDate.now());
    }
    
    /**
     * Get upcoming milestones (within next 30 days)
     */
    public List<KeyMilestone> getUpcomingMilestones(int days) {
        LocalDate currentDate = LocalDate.now();
        LocalDate futureDate = currentDate.plusDays(days);
        return milestoneRepository.findUpcomingMilestones(currentDate, futureDate);
    }
    
    /**
     * Get critical milestones
     */
    public List<KeyMilestone> getCriticalMilestones() {
        return milestoneRepository.findCriticalMilestones();
    }
    
    /**
     * Search milestones by keyword
     */
    public List<KeyMilestone> searchMilestones(String searchTerm) {
        return milestoneRepository.searchMilestones(searchTerm);
    }
    
    /**
     * Get milestones by owner
     */
    public List<KeyMilestone> getMilestonesByOwner(String owner) {
        return milestoneRepository.findByOwnerContainingIgnoreCaseOrderByTargetDateAsc(owner);
    }
    
    /**
     * Get milestones with dependencies
     */
    public List<KeyMilestone> getMilestonesWithDependencies() {
        return milestoneRepository.findMilestonesWithDependencies();
    }
    
    /**
     * Get milestone statistics for a project
     */
    public Map<String, Object> getMilestoneStatistics(Long projectId) {
        Object[] stats = milestoneRepository.getMilestoneStatistics(projectId);
        Map<String, Object> statistics = new HashMap<>();
        
        if (stats != null && stats.length > 0) {
            statistics.put("total", stats[0] != null ? ((Number) stats[0]).longValue() : 0L);
            statistics.put("completed", stats[1] != null ? ((Number) stats[1]).longValue() : 0L);
            statistics.put("overdue", stats[2] != null ? ((Number) stats[2]).longValue() : 0L);
            statistics.put("avgProgress", stats[3] != null ? ((Number) stats[3]).doubleValue() : 0.0);
        } else {
            statistics.put("total", 0L);
            statistics.put("completed", 0L);
            statistics.put("overdue", 0L);
            statistics.put("avgProgress", 0.0);
        }
        
        // Calculate completion rate
        Long total = (Long) statistics.get("total");
        Long completed = (Long) statistics.get("completed");
        if (total > 0) {
            statistics.put("completionRate", (completed.doubleValue() / total.doubleValue()) * 100);
        } else {
            statistics.put("completionRate", 0.0);
        }
        
        return statistics;
    }
    
    /**
     * Update milestone progress
     */
    public KeyMilestone updateMilestoneProgress(Long id, Integer progress) {
        Optional<KeyMilestone> optionalMilestone = milestoneRepository.findById(id);
        if (optionalMilestone.isPresent()) {
            KeyMilestone milestone = optionalMilestone.get();
            milestone.setProgress(progress);
            
            // Auto-update status based on progress
            if (progress >= 100) {
                milestone.setStatus(MilestoneStatus.COMPLETED);
                milestone.setActualDate(LocalDate.now());
            } else if (progress > 0) {
                milestone.setStatus(MilestoneStatus.IN_PROGRESS);
            }
            
            return milestoneRepository.save(milestone);
        } else {
            throw new RuntimeException("Milestone not found with ID: " + id);
        }
    }
    
    /**
     * Mark milestone as completed
     */
    public KeyMilestone completeMilestone(Long id) {
        Optional<KeyMilestone> optionalMilestone = milestoneRepository.findById(id);
        if (optionalMilestone.isPresent()) {
            KeyMilestone milestone = optionalMilestone.get();
            milestone.setStatus(MilestoneStatus.COMPLETED);
            milestone.setProgress(100);
            milestone.setActualDate(LocalDate.now());
            
            return milestoneRepository.save(milestone);
        } else {
            throw new RuntimeException("Milestone not found with ID: " + id);
        }
    }
    
    /**
     * Get milestones by budget range
     */
    public List<KeyMilestone> getMilestonesByBudgetRange(BigDecimal minBudget, BigDecimal maxBudget) {
        return milestoneRepository.findByBudgetRange(minBudget, maxBudget);
    }
    
    /**
     * Get milestones due within date range
     */
    public List<KeyMilestone> getMilestonesDueBetween(LocalDate startDate, LocalDate endDate) {
        return milestoneRepository.findMilestonesDueBetween(startDate, endDate);
    }
    
    /**
     * Delete all milestones for a project
     */
    public void deleteMilestonesByProjectId(Long projectId) {
        milestoneRepository.deleteByProjectId(projectId);
    }
    
    /**
     * Get milestones by due date range
     */
    public List<KeyMilestone> getMilestonesByDueDateRange(LocalDate startDate, LocalDate endDate) {
        return milestoneRepository.findMilestonesDueBetween(startDate, endDate);
    }
    
    /**
     * Update milestone status
     */
    public KeyMilestone updateMilestoneStatus(Long id, MilestoneStatus status) {
        Optional<KeyMilestone> optionalMilestone = milestoneRepository.findById(id);
        if (optionalMilestone.isPresent()) {
            KeyMilestone milestone = optionalMilestone.get();
            milestone.setStatus(status);
            
            // Auto-update completion details if marking as completed
            if (status == MilestoneStatus.COMPLETED) {
                milestone.setProgress(100);
                milestone.setActualDate(LocalDate.now());
            }
            
            return milestoneRepository.save(milestone);
        } else {
            throw new RuntimeException("Milestone not found with ID: " + id);
        }
    }
}
