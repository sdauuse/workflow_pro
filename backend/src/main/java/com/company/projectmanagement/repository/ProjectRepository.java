package com.company.projectmanagement.repository;

import com.company.projectmanagement.model.Project;
import com.company.projectmanagement.model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByItProjectStatus(ProjectStatus status);
    
    List<Project> findByNextCheckDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Project> findByProjectNameContainingIgnoreCase(String projectName);
    
    @Query("SELECT p FROM Project p WHERE p.team.id = :teamId")
    List<Project> findByTeamId(@Param("teamId") Long teamId);
    
    @Query("SELECT p FROM Project p WHERE p.lead.id = :leadId")
    List<Project> findByLeadId(@Param("leadId") Long leadId);
    
    @Query("SELECT p FROM Project p WHERE p.escalation = true")
    List<Project> findEscalatedProjects();
    
    @Query("SELECT p FROM Project p WHERE p.nextCheckDate <= :date")
    List<Project> findProjectsWithUpcomingCheckpoints(@Param("date") LocalDate date);
}
