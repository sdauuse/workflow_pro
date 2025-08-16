package com.company.projectmanagement.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "project_phases")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProjectPhase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference
    private Project project;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "phase_name", nullable = false)
    private PhaseType phaseName;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "planned_start_date")
    private LocalDate plannedStartDate;
    
    @Column(name = "planned_end_date")
    private LocalDate plannedEndDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PhaseStatus status = PhaseStatus.NOT_STARTED;
    
    @Column(name = "progress_percentage", precision = 5, scale = 2)
    private BigDecimal progressPercentage = BigDecimal.ZERO;
    
    @Column(name = "is_completed")
    private Boolean isCompleted = false;
    
    @Column(name = "is_overdue")
    private Boolean isOverdue = false;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum PhaseType {
        ESTIMATED, PLANNING, DEVELOPMENT, SIT, UAT, PPE, LIVE
    }
    
    public enum PhaseStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED, DELAYED, ON_HOLD
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        
        // Auto-update overdue status
        if (plannedEndDate != null && LocalDate.now().isAfter(plannedEndDate) && !isCompleted) {
            isOverdue = true;
        }
        
        // Auto-update completion status based on progress
        if (progressPercentage != null && progressPercentage.compareTo(BigDecimal.valueOf(100)) >= 0) {
            isCompleted = true;
            status = PhaseStatus.COMPLETED;
            if (endDate == null) {
                endDate = LocalDate.now();
            }
        }
    }
    
    // Constructors
    public ProjectPhase() {}
    
    public ProjectPhase(Project project, PhaseType phaseName) {
        this.project = project;
        this.phaseName = phaseName;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Project getProject() {
        return project;
    }
    
    public void setProject(Project project) {
        this.project = project;
    }
    
    public PhaseType getPhaseName() {
        return phaseName;
    }
    
    public void setPhaseName(PhaseType phaseName) {
        this.phaseName = phaseName;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public LocalDate getPlannedStartDate() {
        return plannedStartDate;
    }
    
    public void setPlannedStartDate(LocalDate plannedStartDate) {
        this.plannedStartDate = plannedStartDate;
    }
    
    public LocalDate getPlannedEndDate() {
        return plannedEndDate;
    }
    
    public void setPlannedEndDate(LocalDate plannedEndDate) {
        this.plannedEndDate = plannedEndDate;
    }
    
    public PhaseStatus getStatus() {
        return status;
    }
    
    public void setStatus(PhaseStatus status) {
        this.status = status;
    }
    
    public BigDecimal getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(BigDecimal progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
    
    public Boolean getIsCompleted() {
        return isCompleted;
    }
    
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }
    
    public Boolean getIsOverdue() {
        return isOverdue;
    }
    
    public void setIsOverdue(Boolean isOverdue) {
        this.isOverdue = isOverdue;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
