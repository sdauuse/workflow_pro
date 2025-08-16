package com.company.projectmanagement.repository;

import com.company.projectmanagement.model.ProjectPhase;
import com.company.projectmanagement.model.ProjectPhase.PhaseType;
import com.company.projectmanagement.model.ProjectPhase.PhaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectPhaseRepository extends JpaRepository<ProjectPhase, Long> {
    
    // 根据项目ID查询所有阶段
    List<ProjectPhase> findByProjectIdOrderByPhaseName(Long projectId);
    
    // 根据项目ID和阶段类型查询
    Optional<ProjectPhase> findByProjectIdAndPhaseName(Long projectId, PhaseType phaseName);
    
    // 根据状态查询阶段
    List<ProjectPhase> findByStatus(PhaseStatus status);
    
    // 查询逾期的阶段
    List<ProjectPhase> findByIsOverdueTrue();
    
    // 查询已完成的阶段
    List<ProjectPhase> findByIsCompletedTrue();
    
    // 查询特定日期范围内的阶段
    @Query("SELECT pp FROM ProjectPhase pp WHERE " +
           "(pp.startDate BETWEEN :startDate AND :endDate) OR " +
           "(pp.endDate BETWEEN :startDate AND :endDate) OR " +
           "(pp.plannedStartDate BETWEEN :startDate AND :endDate) OR " +
           "(pp.plannedEndDate BETWEEN :startDate AND :endDate)")
    List<ProjectPhase> findPhasesInDateRange(@Param("startDate") LocalDate startDate, 
                                           @Param("endDate") LocalDate endDate);
    
    // 甘特图统计查询
    @Query("SELECT " +
           "COUNT(DISTINCT pp.project.id) as totalProjects, " +
           "COUNT(DISTINCT CASE WHEN pp.isCompleted = true THEN pp.project.id END) as completedProjects, " +
           "COUNT(DISTINCT CASE WHEN pp.status = 'IN_PROGRESS' THEN pp.project.id END) as inProgressProjects, " +
           "COUNT(DISTINCT CASE WHEN pp.status = 'NOT_STARTED' THEN pp.project.id END) as notStartedProjects " +
           "FROM ProjectPhase pp")
    Object[] getGanttStatistics();
    
    // 按阶段类型统计
    @Query("SELECT pp.phaseName, COUNT(pp), " +
           "COUNT(CASE WHEN pp.status = 'NOT_STARTED' THEN 1 END), " +
           "COUNT(CASE WHEN pp.status = 'IN_PROGRESS' THEN 1 END), " +
           "COUNT(CASE WHEN pp.status = 'COMPLETED' THEN 1 END), " +
           "COUNT(CASE WHEN pp.isOverdue = true THEN 1 END) " +
           "FROM ProjectPhase pp GROUP BY pp.phaseName")
    List<Object[]> getPhaseStatistics();
    
    // 查询需要更新逾期状态的阶段
    @Query("SELECT pp FROM ProjectPhase pp WHERE " +
           "pp.plannedEndDate < CURRENT_DATE AND " +
           "pp.isCompleted = false AND " +
           "pp.isOverdue = false")
    List<ProjectPhase> findOverduePhases();
    
    // 查询项目的当前活跃阶段
    @Query("SELECT pp FROM ProjectPhase pp WHERE " +
           "pp.project.id = :projectId AND " +
           "pp.status = 'IN_PROGRESS' " +
           "ORDER BY pp.phaseName")
    List<ProjectPhase> findActivePhasesByProjectId(@Param("projectId") Long projectId);
    
    // 查询项目进度百分比
    @Query("SELECT AVG(pp.progressPercentage) FROM ProjectPhase pp WHERE pp.project.id = :projectId")
    Double getProjectOverallProgress(@Param("projectId") Long projectId);
}
