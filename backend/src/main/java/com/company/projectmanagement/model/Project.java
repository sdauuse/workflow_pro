package com.company.projectmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "projects")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Project {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Project name is required")
    @Column(name = "project_name", nullable = false)
    private String projectName;
    
    @Column(name = "da_record")
    private String daRecord;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id")
    private Team team;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lead_id")
    private TeamMember lead;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "it_project_status")
    private ProjectStatus itProjectStatus = ProjectStatus.GREEN;
    
    @Column(name = "near_milestone", columnDefinition = "TEXT")
    private String nearMilestone;
    
    @Column(name = "near_milestone_date")
    private LocalDate nearMilestoneDate;
    
    @Column(name = "it_executive_summary", columnDefinition = "TEXT")
    private String itExecutiveSummary;
    
    @Column(name = "key_issue_and_risk", columnDefinition = "TEXT")
    private String keyIssueAndRisk;
    
    @Column(name = "escalation")
    private Boolean escalation = false;
    
    @Column(name = "next_check_date")
    private LocalDate nextCheckDate;
    
    @Column(name = "go_live_date")
    private String goLiveDate;
    
    @Column(name = "dependency", columnDefinition = "TEXT")
    private String dependency;
    
    @Column(name = "related_materials", columnDefinition = "TEXT")
    private String relatedMaterials;
    
    @Column(name = "project_jira_link")
    private String projectJiraLink;
    
    @Column(name = "estimation", precision = 8, scale = 2)
    private java.math.BigDecimal estimation;
    
    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<KeyMilestone> keyMilestones;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<RiskIssue> risksIssues;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProjectDependency> projectDependencies;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProjectPhase> projectPhases;
    
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
    public Project() {}
    
    public Project(String projectName) {
        this.projectName = projectName;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getProjectName() {
        return projectName;
    }
    
    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }
    
    public String getDaRecord() {
        return daRecord;
    }
    
    public void setDaRecord(String daRecord) {
        this.daRecord = daRecord;
    }
    
    public Team getTeam() {
        return team;
    }
    
    public void setTeam(Team team) {
        this.team = team;
    }
    
    public TeamMember getLead() {
        return lead;
    }
    
    public void setLead(TeamMember lead) {
        this.lead = lead;
    }
    
    public ProjectStatus getItProjectStatus() {
        return itProjectStatus;
    }
    
    public void setItProjectStatus(ProjectStatus itProjectStatus) {
        this.itProjectStatus = itProjectStatus;
    }
    
    public String getNearMilestone() {
        return nearMilestone;
    }
    
    public void setNearMilestone(String nearMilestone) {
        this.nearMilestone = nearMilestone;
    }
    
    public LocalDate getNearMilestoneDate() {
        return nearMilestoneDate;
    }
    
    public void setNearMilestoneDate(LocalDate nearMilestoneDate) {
        this.nearMilestoneDate = nearMilestoneDate;
    }
    
    public String getItExecutiveSummary() {
        return itExecutiveSummary;
    }
    
    public void setItExecutiveSummary(String itExecutiveSummary) {
        this.itExecutiveSummary = itExecutiveSummary;
    }
    
    public String getKeyIssueAndRisk() {
        return keyIssueAndRisk;
    }
    
    public void setKeyIssueAndRisk(String keyIssueAndRisk) {
        this.keyIssueAndRisk = keyIssueAndRisk;
    }
    
    public Boolean getEscalation() {
        return escalation;
    }
    
    public void setEscalation(Boolean escalation) {
        this.escalation = escalation;
    }
    
    public LocalDate getNextCheckDate() {
        return nextCheckDate;
    }
    
    public void setNextCheckDate(LocalDate nextCheckDate) {
        this.nextCheckDate = nextCheckDate;
    }
    
    public String getGoLiveDate() {
        return goLiveDate;
    }
    
    public void setGoLiveDate(String goLiveDate) {
        this.goLiveDate = goLiveDate;
    }
    
    public String getDependency() {
        return dependency;
    }
    
    public void setDependency(String dependency) {
        this.dependency = dependency;
    }
    
    public String getRelatedMaterials() {
        return relatedMaterials;
    }
    
    public void setRelatedMaterials(String relatedMaterials) {
        this.relatedMaterials = relatedMaterials;
    }
    
    public String getProjectJiraLink() {
        return projectJiraLink;
    }
    
    public void setProjectJiraLink(String projectJiraLink) {
        this.projectJiraLink = projectJiraLink;
    }
    
    public java.math.BigDecimal getEstimation() {
        return estimation;
    }
    
    public void setEstimation(java.math.BigDecimal estimation) {
        this.estimation = estimation;
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
    
    public List<KeyMilestone> getKeyMilestones() {
        return keyMilestones;
    }
    
    public void setKeyMilestones(List<KeyMilestone> keyMilestones) {
        this.keyMilestones = keyMilestones;
    }
    
    public List<RiskIssue> getRisksIssues() {
        return risksIssues;
    }
    
    public void setRisksIssues(List<RiskIssue> risksIssues) {
        this.risksIssues = risksIssues;
    }
    
    public List<ProjectDependency> getProjectDependencies() {
        return projectDependencies;
    }
    
    public void setProjectDependencies(List<ProjectDependency> projectDependencies) {
        this.projectDependencies = projectDependencies;
    }
    
    public List<ProjectPhase> getProjectPhases() {
        return projectPhases;
    }
    
    public void setProjectPhases(List<ProjectPhase> projectPhases) {
        this.projectPhases = projectPhases;
    }
}
