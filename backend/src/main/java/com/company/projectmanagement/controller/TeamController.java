package com.company.projectmanagement.controller;

import com.company.projectmanagement.model.Team;
import com.company.projectmanagement.model.TeamMember;
import com.company.projectmanagement.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/teams")
@Tag(name = "团队管理", description = "团队管理相关的API接口")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, 
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
             allowedHeaders = "*", 
             allowCredentials = "true")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handlePreflight() {
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @Operation(summary = "获取所有团队", description = "获取系统中的所有团队")
    public ResponseEntity<List<Team>> getAllTeams() {
        List<Team> teams = teamService.getAllTeams();
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取团队", description = "通过团队ID获取具体的团队信息")
    public ResponseEntity<Team> getTeamById(
            @Parameter(description = "团队ID") @PathVariable Long id) {
        Optional<Team> team = teamService.getTeamById(id);
        return team.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "根据名称搜索团队", description = "通过团队名称搜索团队")
    public ResponseEntity<List<Team>> getTeamsByName(
            @Parameter(description = "团队名称") @PathVariable String name) {
        List<Team> teams = teamService.getTeamsByName(name);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/statistics")
    @Operation(summary = "获取团队统计信息", description = "获取团队的统计信息")
    public ResponseEntity<Map<String, Object>> getTeamStatistics() {
        Map<String, Object> statistics = teamService.getTeamStatistics();
        return ResponseEntity.ok(statistics);
    }

    @PostMapping
    @Operation(summary = "创建团队", description = "创建新的团队")
    public ResponseEntity<Team> createTeam(
            @Parameter(description = "团队信息") @Valid @RequestBody Team team) {
        Team createdTeam = teamService.createTeam(team);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTeam);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新团队", description = "更新指定的团队信息")
    public ResponseEntity<Team> updateTeam(
            @Parameter(description = "团队ID") @PathVariable Long id,
            @Parameter(description = "更新的团队信息") @Valid @RequestBody Team team) {
        try {
            Team updatedTeam = teamService.updateTeam(id, team);
            return ResponseEntity.ok(updatedTeam);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除团队", description = "删除指定的团队")
    public ResponseEntity<Void> deleteTeam(
            @Parameter(description = "团队ID") @PathVariable Long id) {
        try {
            teamService.deleteTeam(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "获取团队成员", description = "获取指定团队的所有成员")
    public ResponseEntity<List<TeamMember>> getTeamMembers(
            @Parameter(description = "团队ID") @PathVariable Long id) {
        try {
            List<TeamMember> members = teamService.getTeamMembers(id);
            return ResponseEntity.ok(members);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/members")
    @Operation(summary = "更新团队成员", description = "为指定团队更新成员分配")
    public ResponseEntity<Map<String, Object>> updateTeamMembers(
            @Parameter(description = "团队ID") @PathVariable Long id,
            @Parameter(description = "成员ID列表") @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> memberIds = (List<Long>) request.get("memberIds");
            teamService.updateTeamMembers(id, memberIds);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Team members updated successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
