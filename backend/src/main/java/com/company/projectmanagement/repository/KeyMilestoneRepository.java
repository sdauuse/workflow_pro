package com.company.projectmanagement.repository;

import com.company.projectmanagement.model.KeyMilestone;
import com.company.projectmanagement.model.KeyMilestone.MilestoneStatus;
import com.company.projectmanagement.model.KeyMilestone.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface KeyMilestoneRepository extends JpaRepository<KeyMilestone, Long> {
    
    /**
     * Find all milestones for a specific project
     */
    List<KeyMilestone> findByProjectIdOrderByTargetDateAsc(Long projectId);
    
    /**
     * Find milestones by status
     */
    List<KeyMilestone> findByStatus(MilestoneStatus status);
    
    /**
     * Find milestones by priority
     */
    List<KeyMilestone> findByPriority(Priority priority);
    
    /**
     * Find milestones due within a date range
     */
    @Query("SELECT m FROM KeyMilestone m WHERE m.targetDate BETWEEN :startDate AND :endDate ORDER BY m.targetDate ASC")
    List<KeyMilestone> findMilestonesDueBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    /**
     * Find overdue milestones (not completed and past target date)
     */
    @Query("SELECT m FROM KeyMilestone m WHERE m.status != 'COMPLETED' AND m.targetDate < :currentDate ORDER BY m.targetDate ASC")
    List<KeyMilestone> findOverdueMilestones(@Param("currentDate") LocalDate currentDate);
    
    /**
     * Find milestones by owner
     */
    List<KeyMilestone> findByOwnerContainingIgnoreCaseOrderByTargetDateAsc(String owner);
    
    /**
     * Find upcoming milestones (due within next N days)
     */
    @Query("SELECT m FROM KeyMilestone m WHERE m.status != 'COMPLETED' AND m.targetDate BETWEEN :currentDate AND :futureDate ORDER BY m.targetDate ASC")
    List<KeyMilestone> findUpcomingMilestones(@Param("currentDate") LocalDate currentDate, @Param("futureDate") LocalDate futureDate);
    
    /**
     * Count milestones by status for a project
     */
    @Query("SELECT COUNT(m) FROM KeyMilestone m WHERE m.project.id = :projectId AND m.status = :status")
    Long countByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") MilestoneStatus status);
    
    /**
     * Find milestones with progress above a threshold
     */
    @Query("SELECT m FROM KeyMilestone m WHERE m.progress >= :progressThreshold ORDER BY m.progress DESC")
    List<KeyMilestone> findMilestonesWithProgressAbove(@Param("progressThreshold") Integer progressThreshold);
    
    /**
     * Find critical milestones (high/critical priority)
     */
    @Query("SELECT m FROM KeyMilestone m WHERE m.priority IN ('HIGH', 'CRITICAL') ORDER BY m.priority DESC, m.targetDate ASC")
    List<KeyMilestone> findCriticalMilestones();
    
    /**
     * Get milestone statistics for a project
     */
    @Query("SELECT " +
           "COUNT(m) as total, " +
           "SUM(CASE WHEN m.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed, " +
           "SUM(CASE WHEN m.status != 'COMPLETED' AND m.targetDate < CURRENT_DATE THEN 1 ELSE 0 END) as overdue, " +
           "AVG(m.progress) as avgProgress " +
           "FROM KeyMilestone m WHERE m.project.id = :projectId")
    Object[] getMilestoneStatistics(@Param("projectId") Long projectId);
    
    /**
     * Find milestones with dependencies
     */
    @Query("SELECT m FROM KeyMilestone m WHERE m.dependencies IS NOT NULL AND m.dependencies != '' ORDER BY m.targetDate ASC")
    List<KeyMilestone> findMilestonesWithDependencies();
    
    /**
     * Search milestones by name or description
     */
    @Query("SELECT m FROM KeyMilestone m WHERE " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY m.targetDate ASC")
    List<KeyMilestone> searchMilestones(@Param("searchTerm") String searchTerm);
    
    /**
     * Find milestones by budget range
     */
    @Query("SELECT m FROM KeyMilestone m WHERE m.budget BETWEEN :minBudget AND :maxBudget ORDER BY m.budget DESC")
    List<KeyMilestone> findByBudgetRange(@Param("minBudget") java.math.BigDecimal minBudget, @Param("maxBudget") java.math.BigDecimal maxBudget);
    
    /**
     * Delete milestones by project ID
     */
    void deleteByProjectId(Long projectId);
}
