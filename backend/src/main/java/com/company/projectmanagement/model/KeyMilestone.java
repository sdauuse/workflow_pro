package com.company.projectmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "key_milestones")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class KeyMilestone {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference
    private Project project;
    
    @NotBlank(message = "Milestone name is required")
    @Column(name = "milestone_name", nullable = false)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "milestone_date")
    private LocalDate targetDate;
    
    @Column(name = "actual_date")
    private LocalDate actualDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private MilestoneStatus status = MilestoneStatus.PENDING;
    
    @Column(name = "priority")
    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;
    
    @Min(0) @Max(100)
    @Column(name = "progress")
    private Integer progress = 0;
    
    @Column(name = "owner")
    private String owner;
    
    @Column(name = "deliverables", columnDefinition = "TEXT")
    private String deliverables;
    
    @Column(name = "dependencies", columnDefinition = "TEXT")
    private String dependencies;
    
    @Column(name = "budget", precision = 12, scale = 2)
    private BigDecimal budget;
    
    @Column(name = "risk_assessment", columnDefinition = "TEXT")
    private String riskAssessment;
    
    @Column(name = "success_criteria", columnDefinition = "TEXT")
    private String successCriteria;
    
    @Column(name = "created_date")
    private LocalDate createdDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum MilestoneStatus {
        PENDING, IN_PROGRESS, COMPLETED, AT_RISK, DELAYED, CANCELLED
    }
    
    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (createdDate == null) {
            createdDate = LocalDate.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        
        // Auto-update status based on progress
        if (progress != null && progress >= 100 && status != MilestoneStatus.COMPLETED) {
            status = MilestoneStatus.COMPLETED;
            if (actualDate == null) {
                actualDate = LocalDate.now();
            }
        }
    }
    
    // Constructors
    public KeyMilestone() {}
    
    public KeyMilestone(String name, LocalDate targetDate) {
        this.name = name;
        this.targetDate = targetDate;
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
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDate getTargetDate() {
        return targetDate;
    }
    
    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }
    
    public LocalDate getActualDate() {
        return actualDate;
    }
    
    public void setActualDate(LocalDate actualDate) {
        this.actualDate = actualDate;
    }
    
    public MilestoneStatus getStatus() {
        return status;
    }
    
    public void setStatus(MilestoneStatus status) {
        this.status = status;
    }
    
    public Priority getPriority() {
        return priority;
    }
    
    public void setPriority(Priority priority) {
        this.priority = priority;
    }
    
    public Integer getProgress() {
        return progress;
    }
    
    public void setProgress(Integer progress) {
        this.progress = progress;
    }
    
    public String getOwner() {
        return owner;
    }
    
    public void setOwner(String owner) {
        this.owner = owner;
    }
    
    public String getDeliverables() {
        return deliverables;
    }
    
    public void setDeliverables(String deliverables) {
        this.deliverables = deliverables;
    }
    
    public String getDependencies() {
        return dependencies;
    }
    
    public void setDependencies(String dependencies) {
        this.dependencies = dependencies;
    }
    
    public BigDecimal getBudget() {
        return budget;
    }
    
    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }
    
    public String getRiskAssessment() {
        return riskAssessment;
    }
    
    public void setRiskAssessment(String riskAssessment) {
        this.riskAssessment = riskAssessment;
    }
    
    public String getSuccessCriteria() {
        return successCriteria;
    }
    
    public void setSuccessCriteria(String successCriteria) {
        this.successCriteria = successCriteria;
    }
    
    public LocalDate getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
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
