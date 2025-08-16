
package com.company.projectmanagement.controller;

import com.company.projectmanagement.model.KeyMilestone;
import com.company.projectmanagement.model.KeyMilestone.MilestoneStatus;
import com.company.projectmanagement.model.KeyMilestone.Priority;
import com.company.projectmanagement.service.KeyMilestoneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/milestones")
@Tag(name = "关键里程碑管理", description = "关键里程碑相关的API接口")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, 
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
             allowedHeaders = "*", 
             allowCredentials = "true")
public class KeyMilestoneController {

    @Autowired
    private KeyMilestoneService milestoneService;

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handlePreflight() {
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @Operation(summary = "获取所有关键里程碑", description = "获取系统中的所有关键里程碑")
    public ResponseEntity<List<KeyMilestone>> getAllMilestones() {
        List<KeyMilestone> milestones = milestoneService.getAllMilestones();
        return ResponseEntity.ok(milestones);
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取关键里程碑", description = "通过里程碑ID获取具体的关键里程碑信息")
    public ResponseEntity<KeyMilestone> getMilestoneById(
            @Parameter(description = "里程碑ID") @PathVariable Long id) {
        Optional<KeyMilestone> milestone = milestoneService.getMilestoneById(id);
        return milestone.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "获取项目的关键里程碑", description = "获取指定项目的所有关键里程碑")
    public ResponseEntity<List<KeyMilestone>> getMilestonesByProject(
            @Parameter(description = "项目ID") @PathVariable Long projectId) {
        List<KeyMilestone> milestones = milestoneService.getMilestonesByProjectId(projectId);
        return ResponseEntity.ok(milestones);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "根据状态获取关键里程碑", description = "获取指定状态的所有关键里程碑")
    public ResponseEntity<List<KeyMilestone>> getMilestonesByStatus(
            @Parameter(description = "里程碑状态") @PathVariable MilestoneStatus status) {
        List<KeyMilestone> milestones = milestoneService.getMilestonesByStatus(status);
        return ResponseEntity.ok(milestones);
    }

    @GetMapping("/priority/{priority}")
    @Operation(summary = "根据优先级获取关键里程碑", description = "获取指定优先级的所有关键里程碑")
    public ResponseEntity<List<KeyMilestone>> getMilestonesByPriority(
            @Parameter(description = "里程碑优先级") @PathVariable Priority priority) {
        List<KeyMilestone> milestones = milestoneService.getMilestonesByPriority(priority);
        return ResponseEntity.ok(milestones);
    }

    @GetMapping("/due-date")
    @Operation(summary = "根据到期日期范围获取关键里程碑", description = "获取在指定日期范围内到期的关键里程碑")
    public ResponseEntity<List<KeyMilestone>> getMilestonesByDueDateRange(
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<KeyMilestone> milestones = milestoneService.getMilestonesByDueDateRange(startDate, endDate);
        return ResponseEntity.ok(milestones);
    }

    @PostMapping
    @Operation(summary = "创建关键里程碑", description = "创建新的关键里程碑")
    public ResponseEntity<KeyMilestone> createMilestone(
            @Parameter(description = "关键里程碑信息") @Valid @RequestBody KeyMilestone milestone) {
        KeyMilestone createdMilestone = milestoneService.createMilestone(milestone);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMilestone);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新关键里程碑", description = "更新指定的关键里程碑信息")
    public ResponseEntity<KeyMilestone> updateMilestone(
            @Parameter(description = "里程碑ID") @PathVariable Long id,
            @Parameter(description = "更新的关键里程碑信息") @Valid @RequestBody KeyMilestone milestone) {
        try {
            KeyMilestone updatedMilestone = milestoneService.updateMilestone(id, milestone);
            return ResponseEntity.ok(updatedMilestone);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除关键里程碑", description = "删除指定的关键里程碑")
    public ResponseEntity<Void> deleteMilestone(
            @Parameter(description = "里程碑ID") @PathVariable Long id) {
        try {
            milestoneService.deleteMilestone(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "完成里程碑", description = "将指定里程碑标记为已完成")
    public ResponseEntity<KeyMilestone> completeMilestone(
            @Parameter(description = "里程碑ID") @PathVariable Long id) {
        try {
            KeyMilestone completedMilestone = milestoneService.completeMilestone(id);
            return ResponseEntity.ok(completedMilestone);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "更新里程碑状态", description = "更新指定里程碑的状态")
    public ResponseEntity<KeyMilestone> updateMilestoneStatus(
            @Parameter(description = "里程碑ID") @PathVariable Long id,
            @Parameter(description = "新状态") @RequestParam MilestoneStatus status) {
        try {
            KeyMilestone updatedMilestone = milestoneService.updateMilestoneStatus(id, status);
            return ResponseEntity.ok(updatedMilestone);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

