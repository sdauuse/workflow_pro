package com.company.projectmanagement.controller;

import com.company.projectmanagement.model.TeamMember;
import com.company.projectmanagement.service.TeamMemberService;
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
@RequestMapping("/api/team-members")
@Tag(name = "团队成员管理", description = "团队成员管理相关的API接口")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, 
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
             allowedHeaders = "*", 
             allowCredentials = "true")
public class TeamMemberController {

    @Autowired
    private TeamMemberService teamMemberService;

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handlePreflight() {
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @Operation(summary = "获取所有团队成员", description = "获取系统中的所有团队成员")
    public ResponseEntity<List<TeamMember>> getAllTeamMembers() {
        List<TeamMember> teamMembers = teamMemberService.getAllTeamMembers();
        return ResponseEntity.ok(teamMembers);
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取团队成员", description = "通过成员ID获取具体的团队成员信息")
    public ResponseEntity<TeamMember> getTeamMemberById(
            @Parameter(description = "团队成员ID") @PathVariable Long id) {
        Optional<TeamMember> teamMember = teamMemberService.getTeamMemberById(id);
        return teamMember.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/team/{teamId}")
    @Operation(summary = "获取团队的所有成员", description = "获取指定团队的所有成员")
    public ResponseEntity<List<TeamMember>> getTeamMembersByTeam(
            @Parameter(description = "团队ID") @PathVariable Long teamId) {
        List<TeamMember> teamMembers = teamMemberService.getTeamMembersByTeamId(teamId);
        return ResponseEntity.ok(teamMembers);
    }

    @GetMapping("/role/{role}")
    @Operation(summary = "根据角色获取团队成员", description = "获取指定角色的所有团队成员")
    public ResponseEntity<List<TeamMember>> getTeamMembersByRole(
            @Parameter(description = "成员角色") @PathVariable String role) {
        List<TeamMember> teamMembers = teamMemberService.getTeamMembersByRole(role);
        return ResponseEntity.ok(teamMembers);
    }

    @PostMapping
    @Operation(summary = "创建团队成员", description = "创建新的团队成员")
    public ResponseEntity<?> createTeamMember(
            @Parameter(description = "团队成员信息") @Valid @RequestBody TeamMember teamMember) {
        try {
            TeamMember createdTeamMember = teamMemberService.createTeamMember(teamMember);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTeamMember);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新团队成员", description = "更新指定的团队成员信息")
    public ResponseEntity<?> updateTeamMember(
            @Parameter(description = "团队成员ID") @PathVariable Long id,
            @Parameter(description = "更新的团队成员信息") @Valid @RequestBody TeamMember teamMember) {
        try {
            TeamMember updatedTeamMember = teamMemberService.updateTeamMember(id, teamMember);
            return ResponseEntity.ok(updatedTeamMember);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", e.getMessage());
                return ResponseEntity.badRequest().body(error);
            }
        }
    }

    @GetMapping("/check-email")
    @Operation(summary = "检查邮箱是否存在", description = "检查指定邮箱是否已被使用")
    public ResponseEntity<Map<String, Object>> checkEmailExists(
            @Parameter(description = "邮箱地址") @RequestParam String email) {
        try {
            Optional<TeamMember> existingMember = teamMemberService.findByEmail(email);
            Map<String, Object> response = new HashMap<>();
            response.put("exists", existingMember.isPresent());
            if (existingMember.isPresent()) {
                response.put("member", existingMember.get());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除团队成员", description = "删除指定的团队成员")
    public ResponseEntity<Void> deleteTeamMember(
            @Parameter(description = "团队成员ID") @PathVariable Long id) {
        try {
            teamMemberService.deleteTeamMember(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
