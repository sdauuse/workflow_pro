package com.company.projectmanagement.repository;

import com.company.projectmanagement.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    
    Optional<TeamMember> findByEmail(String email);
    
    List<TeamMember> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT tm FROM TeamMember tm WHERE tm.team.id = :teamId")
    List<TeamMember> findByTeamId(@Param("teamId") Long teamId);
    
    @Query("SELECT tm FROM TeamMember tm WHERE tm.team.id = :teamId AND tm.isLead = true")
    List<TeamMember> findTeamLeads(@Param("teamId") Long teamId);
    
    @Query("SELECT tm FROM TeamMember tm WHERE tm.isLead = true")
    List<TeamMember> findAllLeads();
}
