package com.company.projectmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "risks_issues")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RiskIssue {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference
    private Project project;
    
    @NotBlank(message = "Title is required")
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_type", nullable = false)
    private RiskType riskType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "severity")
    private Severity severity = Severity.MEDIUM;
    
    @Column(name = "mitigation_action", columnDefinition = "TEXT")
    private String mitigationAction;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RiskStatus status = RiskStatus.OPEN;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private TeamMember assignedTo;
    
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public RiskIssue() {}
    
    public RiskIssue(String title, RiskType riskType) {
        this.title = title;
        this.riskType = riskType;
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
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public RiskType getRiskType() {
        return riskType;
    }
    
    public void setRiskType(RiskType riskType) {
        this.riskType = riskType;
    }
    
    public Severity getSeverity() {
        return severity;
    }
    
    public void setSeverity(Severity severity) {
        this.severity = severity;
    }
    
    public String getMitigationAction() {
        return mitigationAction;
    }
    
    public void setMitigationAction(String mitigationAction) {
        this.mitigationAction = mitigationAction;
    }
    
    public RiskStatus getStatus() {
        return status;
    }
    
    public void setStatus(RiskStatus status) {
        this.status = status;
    }
    
    public TeamMember getAssignedTo() {
        return assignedTo;
    }
    
    public void setAssignedTo(TeamMember assignedTo) {
        this.assignedTo = assignedTo;
    }
    
    public LocalDate getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
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
