package com.company.projectmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

@Entity
@Table(name = "team_members")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TeamMember {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Name is required")
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "role")
    private String role;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    @JsonBackReference
    private Team team;
    
    @Column(name = "is_lead")
    private Boolean isLead = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Add teamId field for JSON deserialization
    @Transient
    @JsonProperty("teamId")
    private Long teamId;
    
    // Helper method to get teamId from team relationship
    public Long getTeamId() {
        if (this.team != null) {
            return this.team.getId();
        }
        return this.teamId;
    }
    
    public void setTeamId(Long teamId) {
        this.teamId = teamId;
        // When setting teamId, we should also try to set the team relationship
        // This will be handled in the service layer
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors
    public TeamMember() {}
    
    public TeamMember(String name, String email) {
        this.name = name;
        this.email = email;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public Team getTeam() {
        return team;
    }
    
    public void setTeam(Team team) {
        this.team = team;
    }
    
    public Boolean getIsLead() {
        return isLead;
    }
    
    public void setIsLead(Boolean isLead) {
        this.isLead = isLead;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
