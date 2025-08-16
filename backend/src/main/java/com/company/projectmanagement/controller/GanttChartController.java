package com.company.projectmanagement.controller;

import com.company.projectmanagement.model.ProjectPhase;
import com.company.projectmanagement.service.GanttChartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.Map;

@RestController
@RequestMapping("/api/gantt")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, 
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
             allowedHeaders = "*", 
             allowCredentials = "true")
@Tag(name = "Gantt Chart", description = "Multi-project progress Gantt chart operations")
public class GanttChartController {
    
    @Autowired
    private GanttChartService ganttChartService;
    
    @GetMapping("/data")
    @Operation(summary = "Get Gantt chart data", description = "Retrieve complete Gantt chart data including projects, phases, statistics, and milestones")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved Gantt chart data",
            content = @Content(mediaType = "application/json"))
    public ResponseEntity<Map<String, Object>> getGanttChartData() {
        Map<String, Object> data = ganttChartService.getGanttChartData();
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get project statistics", description = "Retrieve project completion and overdue statistics")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics",
            content = @Content(mediaType = "application/json"))
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = ganttChartService.getGanttStatistics();
        return ResponseEntity.ok(stats);
    }
    
    @PutMapping("/phases/{phaseId}")
    @Operation(summary = "Update project phase", description = "Update project phase details including dates, status, and progress")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Phase updated successfully",
                content = @Content(mediaType = "application/json", 
                schema = @Schema(implementation = ProjectPhase.class))),
        @ApiResponse(responseCode = "404", description = "Phase not found"),
        @ApiResponse(responseCode = "400", description = "Invalid phase data")
    })
    public ResponseEntity<ProjectPhase> updatePhase(
            @Parameter(description = "ID of the phase to update") 
            @PathVariable Long phaseId,
            @Parameter(description = "Updated phase data") 
            @RequestBody ProjectPhase phaseDetails) {
        try {
            ProjectPhase updatedPhase = ganttChartService.updatePhase(phaseId, phaseDetails);
            return ResponseEntity.ok(updatedPhase);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/update-overdue")
    @Operation(summary = "Update overdue status", description = "Manually trigger update of overdue status for all phases")
    @ApiResponse(responseCode = "200", description = "Overdue status updated successfully")
    public ResponseEntity<Void> updateOverdueStatus() {
        ganttChartService.updateOverdueStatus();
        return ResponseEntity.ok().build();
    }
}
