package com.company.projectmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_dependencies")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProjectDependency {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference
    private Project project;
    
    @NotBlank(message = "Dependency name is required")
    @Column(name = "dependency_name", nullable = false)
    private String dependencyName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "dependency_type")
    private DependencyType dependencyType = DependencyType.INTERNAL;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "timeline")
    private String timeline;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private DependencyStatus status = DependencyStatus.PENDING;
    
    @Column(name = "contact_person")
    private String contactPerson;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors
    public ProjectDependency() {}
    
    public ProjectDependency(String dependencyName) {
        this.dependencyName = dependencyName;
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
    
    public String getDependencyName() {
        return dependencyName;
    }
    
    public void setDependencyName(String dependencyName) {
        this.dependencyName = dependencyName;
    }
    
    public DependencyType getDependencyType() {
        return dependencyType;
    }
    
    public void setDependencyType(DependencyType dependencyType) {
        this.dependencyType = dependencyType;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getTimeline() {
        return timeline;
    }
    
    public void setTimeline(String timeline) {
        this.timeline = timeline;
    }
    
    public DependencyStatus getStatus() {
        return status;
    }
    
    public void setStatus(DependencyStatus status) {
        this.status = status;
    }
    
    public String getContactPerson() {
        return contactPerson;
    }
    
    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
