package com.company.projectmanagement.service;

import com.company.projectmanagement.model.ProjectPhase;
import com.company.projectmanagement.repository.ProjectPhaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectPhaseService {

    @Autowired
    private ProjectPhaseRepository projectPhaseRepository;

    public List<ProjectPhase> getAllProjectPhases() {
        return projectPhaseRepository.findAll();
    }

    public Optional<ProjectPhase> getProjectPhaseById(Long id) {
        return projectPhaseRepository.findById(id);
    }

    public List<ProjectPhase> getProjectPhasesByProjectId(Long projectId) {
        return projectPhaseRepository.findByProjectIdOrderByPhaseName(projectId);
    }

    public ProjectPhase createProjectPhase(ProjectPhase projectPhase) {
        return projectPhaseRepository.save(projectPhase);
    }

    public ProjectPhase updateProjectPhase(Long id, ProjectPhase projectPhaseDetails) {
        Optional<ProjectPhase> optionalProjectPhase = projectPhaseRepository.findById(id);
        if (optionalProjectPhase.isPresent()) {
            ProjectPhase projectPhase = optionalProjectPhase.get();
            
            // Update fields
            if (projectPhaseDetails.getPhaseName() != null) {
                projectPhase.setPhaseName(projectPhaseDetails.getPhaseName());
            }
            if (projectPhaseDetails.getStartDate() != null) {
                projectPhase.setStartDate(projectPhaseDetails.getStartDate());
            }
            if (projectPhaseDetails.getEndDate() != null) {
                projectPhase.setEndDate(projectPhaseDetails.getEndDate());
            }
            if (projectPhaseDetails.getPlannedStartDate() != null) {
                projectPhase.setPlannedStartDate(projectPhaseDetails.getPlannedStartDate());
            }
            if (projectPhaseDetails.getPlannedEndDate() != null) {
                projectPhase.setPlannedEndDate(projectPhaseDetails.getPlannedEndDate());
            }
            if (projectPhaseDetails.getStatus() != null) {
                projectPhase.setStatus(projectPhaseDetails.getStatus());
            }
            if (projectPhaseDetails.getProgressPercentage() != null) {
                projectPhase.setProgressPercentage(projectPhaseDetails.getProgressPercentage());
            }
            if (projectPhaseDetails.getIsCompleted() != null) {
                projectPhase.setIsCompleted(projectPhaseDetails.getIsCompleted());
            }
            if (projectPhaseDetails.getIsOverdue() != null) {
                projectPhase.setIsOverdue(projectPhaseDetails.getIsOverdue());
            }
            if (projectPhaseDetails.getDescription() != null) {
                projectPhase.setDescription(projectPhaseDetails.getDescription());
            }
            
            return projectPhaseRepository.save(projectPhase);
        } else {
            throw new RuntimeException("ProjectPhase not found with id: " + id);
        }
    }

    public void deleteProjectPhase(Long id) {
        if (projectPhaseRepository.existsById(id)) {
            projectPhaseRepository.deleteById(id);
        } else {
            throw new RuntimeException("ProjectPhase not found with id: " + id);
        }
    }
}
