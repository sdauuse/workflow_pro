package com.company.projectmanagement.service;

import com.company.projectmanagement.model.Team;
import com.company.projectmanagement.model.TeamMember;
import com.company.projectmanagement.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TeamService {
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private TeamMemberService teamMemberService;
    
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }
    
    public Optional<Team> getTeamById(Long id) {
        return teamRepository.findById(id);
    }
    
    public List<Team> getTeamsByProjectId(Long projectId) {
        // 需要在 TeamRepository 中添加这个方法
        return teamRepository.findAll(); // 临时实现
    }
    
    public Team createTeam(Team team) {
        return teamRepository.save(team);
    }
    
    public Team updateTeam(Long id, Team team) {
        if (!teamRepository.existsById(id)) {
            throw new RuntimeException("Team not found");
        }
        
        // 获取现有的团队以保留createdAt等字段
        Optional<Team> existingTeamOpt = teamRepository.findById(id);
        if (!existingTeamOpt.isPresent()) {
            throw new RuntimeException("Team not found");
        }
        
        Team existingTeam = existingTeamOpt.get();
        
        // 只更新需要更新的字段，保留createdAt
        existingTeam.setName(team.getName());
        existingTeam.setDescription(team.getDescription());
        // createdAt 保持不变，updatedAt 会通过 @PreUpdate 自动更新
        
        return teamRepository.save(existingTeam);
    }
    
    public void deleteTeam(Long id) {
        if (!teamRepository.existsById(id)) {
            throw new RuntimeException("Team not found");
        }
        teamRepository.deleteById(id);
    }
    
    public List<Team> searchTeams(String keyword) {
        // 需要在 TeamRepository 中添加搜索方法
        return teamRepository.findAll(); // 临时实现
    }
    
    public List<Team> getTeamsByName(String name) {
        // 根据团队名称搜索团队
        return teamRepository.findAll().stream()
                .filter(team -> team.getName().toLowerCase().contains(name.toLowerCase()))
                .toList();
    }
    
    public Map<String, Object> getTeamStatistics() {
        Map<String, Object> stats = new HashMap<>();
        long totalTeams = teamRepository.count();
        stats.put("totalTeams", totalTeams);
        // 添加更多统计信息
        return stats;
    }
    
    public List<TeamMember> getTeamMembers(Long teamId) {
        return teamMemberService.getTeamMembersByTeamId(teamId);
    }
    
    public void updateTeamMembers(Long teamId, List<Long> memberIds) {
        // 验证团队是否存在
        if (!teamRepository.existsById(teamId)) {
            throw new RuntimeException("Team not found with id: " + teamId);
        }

        // 获取团队对象
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (!teamOpt.isPresent()) {
            throw new RuntimeException("Team not found with id: " + teamId);
        }
        Team team = teamOpt.get();

        // 首先，将当前团队的所有成员从团队中移除
        List<TeamMember> currentMembers = teamMemberService.getTeamMembersByTeamId(teamId);
        for (TeamMember currentMember : currentMembers) {
            currentMember.setTeam(null);
            currentMember.setTeamId(null);
            teamMemberService.updateTeamMember(currentMember.getId(), currentMember);
        }

        // 然后，将指定的成员添加到团队中
        if (memberIds != null) {
            for (Long memberId : memberIds) {
                Optional<TeamMember> memberOpt = teamMemberService.getTeamMemberById(memberId);
                if (memberOpt.isPresent()) {
                    TeamMember member = memberOpt.get();
                    // 设置团队关系
                    member.setTeam(team);
                    member.setTeamId(teamId);
                    
                    // 更新团队成员
                    teamMemberService.updateTeamMember(memberId, member);
                }
            }
        }
    }
}
