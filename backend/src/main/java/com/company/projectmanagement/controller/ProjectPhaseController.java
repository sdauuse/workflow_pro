package com.company.projectmanagement.controller;

import com.company.projectmanagement.model.ProjectPhase;
import com.company.projectmanagement.service.ProjectPhaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/project-phases")
@Tag(name = "项目阶段管理", description = "项目阶段相关的API接口")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, 
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
             allowedHeaders = "*", 
             allowCredentials = "true")
public class ProjectPhaseController {

    @Autowired
    private ProjectPhaseService projectPhaseService;

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handlePreflight() {
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @Operation(summary = "获取所有项目阶段", description = "获取系统中的所有项目阶段")
    public ResponseEntity<List<ProjectPhase>> getAllProjectPhases() {
        List<ProjectPhase> projectPhases = projectPhaseService.getAllProjectPhases();
        return ResponseEntity.ok(projectPhases);
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取项目阶段", description = "通过阶段ID获取具体的项目阶段信息")
    public ResponseEntity<ProjectPhase> getProjectPhaseById(
            @Parameter(description = "阶段ID") @PathVariable Long id) {
        Optional<ProjectPhase> projectPhase = projectPhaseService.getProjectPhaseById(id);
        return projectPhase.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "获取项目的所有阶段", description = "获取指定项目的所有阶段")
    public ResponseEntity<List<ProjectPhase>> getProjectPhasesByProject(
            @Parameter(description = "项目ID") @PathVariable Long projectId) {
        List<ProjectPhase> projectPhases = projectPhaseService.getProjectPhasesByProjectId(projectId);
        return ResponseEntity.ok(projectPhases);
    }

    @PostMapping
    @Operation(summary = "创建项目阶段", description = "创建新的项目阶段")
    public ResponseEntity<ProjectPhase> createProjectPhase(
            @Parameter(description = "项目阶段信息") @Valid @RequestBody ProjectPhase projectPhase) {
        ProjectPhase createdProjectPhase = projectPhaseService.createProjectPhase(projectPhase);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProjectPhase);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新项目阶段", description = "更新指定的项目阶段信息")
    public ResponseEntity<ProjectPhase> updateProjectPhase(
            @Parameter(description = "阶段ID") @PathVariable Long id,
            @Parameter(description = "更新的项目阶段信息") @Valid @RequestBody ProjectPhase projectPhase) {
        try {
            ProjectPhase updatedProjectPhase = projectPhaseService.updateProjectPhase(id, projectPhase);
            return ResponseEntity.ok(updatedProjectPhase);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除项目阶段", description = "删除指定的项目阶段")
    public ResponseEntity<Void> deleteProjectPhase(
            @Parameter(description = "阶段ID") @PathVariable Long id) {
        try {
            projectPhaseService.deleteProjectPhase(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
