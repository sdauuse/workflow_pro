package com.company.projectmanagement.controller;

import com.company.projectmanagement.model.Project;
import com.company.projectmanagement.model.ProjectStatus;
import com.company.projectmanagement.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, 
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
             allowedHeaders = "*", 
             allowCredentials = "true")
@Tag(name = "Projects", description = "API for managing projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handlePreflight() {
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @Operation(summary = "获取所有项目", description = "获取系统中的所有项目")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功获取项目列表",
                    content = @Content(schema = @Schema(implementation = Project.class)))
    })
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }


    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取项目", description = "通过项目ID获取具体的项目信息")
    public ResponseEntity<Project> getProjectById(
            @Parameter(description = "项目ID") @PathVariable Long id) {
        Optional<Project> project = projectService.getProjectById(id);
        return project.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "根据状态获取项目", description = "获取指定状态的所有项目")
    public ResponseEntity<List<Project>> getProjectsByStatus(
            @Parameter(description = "项目状态") @PathVariable ProjectStatus status) {
        List<Project> projects = projectService.getProjectsByStatus(status);
        return ResponseEntity.ok(projects);
    }

    @PostMapping
    @Operation(summary = "创建项目", description = "创建新的项目")
    public ResponseEntity<Project> createProject(@Valid @RequestBody Project project) {
        Project createdProject = projectService.saveProject(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新项目", description = "更新指定ID的项目")
    public ResponseEntity<Project> updateProject(
            @Parameter(description = "项目ID") @PathVariable Long id,
            @Valid @RequestBody Project project) {
        try {
            Project updatedProject = projectService.updateProject(id, project);
            return ResponseEntity.ok(updatedProject);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除项目", description = "删除指定ID的项目")
    public ResponseEntity<Void> deleteProject(
            @Parameter(description = "项目ID") @PathVariable Long id) {
        try {
            projectService.deleteProject(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/copy")
    @Operation(summary = "复制项目", description = "复制指定ID的项目及其所有相关数据")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "项目复制成功",
                    content = @Content(schema = @Schema(implementation = Project.class))),
            @ApiResponse(responseCode = "404", description = "原项目未找到")
    })
    public ResponseEntity<Project> copyProject(
            @Parameter(description = "要复制的项目ID") @PathVariable Long id) {
        try {
            Project copiedProject = projectService.copyProject(id);
            return ResponseEntity.status(HttpStatus.CREATED).body(copiedProject);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    @Operation(summary = "搜索项目", description = "根据关键词搜索项目")
    public ResponseEntity<List<Project>> searchProjects(
            @Parameter(description = "搜索关键词") @RequestParam String keyword) {
        List<Project> projects = projectService.searchProjectsByName(keyword);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/date-range")
    @Operation(summary = "根据日期范围获取项目", description = "获取指定日期范围内的项目")
    public ResponseEntity<List<Project>> getProjectsByDateRange(
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Project> projects = projectService.getProjectsInDateRange(startDate, endDate);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/statistics")
    @Operation(summary = "获取项目统计信息", description = "获取项目的统计信息")
    public ResponseEntity<Map<String, Object>> getProjectStatistics() {
        Map<String, Object> statistics = projectService.getProjectStatistics();
        return ResponseEntity.ok(statistics);
    }
}
