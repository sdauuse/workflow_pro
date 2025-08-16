package com.company.projectmanagement.service;

import com.company.projectmanagement.model.TeamMember;
import com.company.projectmanagement.model.Team;
import com.company.projectmanagement.repository.TeamMemberRepository;
import com.company.projectmanagement.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TeamMemberService {
    
    @Autowired
    private TeamMemberRepository teamMemberRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    public List<TeamMember> getAllTeamMembers() {
        return teamMemberRepository.findAll();
    }
    
    public Optional<TeamMember> getTeamMemberById(Long id) {
        return teamMemberRepository.findById(id);
    }
    
    public List<TeamMember> getTeamMembersByTeamId(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }
    
    public TeamMember createTeamMember(TeamMember teamMember) {
        // Check for duplicate email if email is provided
        if (teamMember.getEmail() != null && !teamMember.getEmail().trim().isEmpty()) {
            Optional<TeamMember> existingMember = teamMemberRepository.findByEmail(teamMember.getEmail());
            if (existingMember.isPresent()) {
                throw new RuntimeException("A team member with email '" + teamMember.getEmail() + "' already exists");
            }
        }
        
        // If teamId is provided, set the team relationship
        if (teamMember.getTeamId() != null) {
            Optional<Team> teamOpt = teamRepository.findById(teamMember.getTeamId());
            if (teamOpt.isPresent()) {
                teamMember.setTeam(teamOpt.get());
            } else {
                throw new RuntimeException("Team not found with id: " + teamMember.getTeamId());
            }
        }
        
        // Save the team member
        TeamMember savedMember = teamMemberRepository.save(teamMember);
        
        return savedMember;
    }
    
    public TeamMember updateTeamMember(Long id, TeamMember teamMember) {
        if (!teamMemberRepository.existsById(id)) {
            throw new RuntimeException("Team member not found");
        }
        
        // Check for duplicate email if email is provided and different from current
        if (teamMember.getEmail() != null && !teamMember.getEmail().trim().isEmpty()) {
            Optional<TeamMember> existingMember = teamMemberRepository.findByEmail(teamMember.getEmail());
            if (existingMember.isPresent() && !existingMember.get().getId().equals(id)) {
                throw new RuntimeException("A team member with email '" + teamMember.getEmail() + "' already exists");
            }
        }
        
        // If teamId is provided, set the team relationship
        if (teamMember.getTeamId() != null) {
            Optional<Team> teamOpt = teamRepository.findById(teamMember.getTeamId());
            if (teamOpt.isPresent()) {
                teamMember.setTeam(teamOpt.get());
            } else {
                throw new RuntimeException("Team not found with id: " + teamMember.getTeamId());
            }
        } else {
            // If teamId is null, remove team relationship
            teamMember.setTeam(null);
        }
        
        teamMember.setId(id);
        return teamMemberRepository.save(teamMember);
    }
    
    public void deleteTeamMember(Long id) {
        if (!teamMemberRepository.existsById(id)) {
            throw new RuntimeException("Team member not found");
        }
        teamMemberRepository.deleteById(id);
    }
    
    public List<TeamMember> searchTeamMembers(String keyword) {
        // 需要在 TeamMemberRepository 中添加搜索方法
        return teamMemberRepository.findAll(); // 临时实现
    }
    
    public List<TeamMember> getTeamMembersByRole(String role) {
        // 根据角色获取团队成员
        return teamMemberRepository.findAll().stream()
                .filter(member -> member.getRole().toLowerCase().contains(role.toLowerCase()))
                .toList();
    }
    
    public Map<String, Object> getTeamMemberStatistics() {
        Map<String, Object> stats = new HashMap<>();
        long totalMembers = teamMemberRepository.count();
        stats.put("totalMembers", totalMembers);
        // 添加更多统计信息
        return stats;
    }
    
    public Optional<TeamMember> findByEmail(String email) {
        return teamMemberRepository.findByEmail(email);
    }
}
