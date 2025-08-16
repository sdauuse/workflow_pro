import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class ProjectPhaseService {
    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Basic CRUD operations
    async getAllProjectPhases() {
        try {
            const response = await this.api.get('/project-phases');
            return response.data;
        } catch (error) {
            console.error('Error fetching project phases:', error);
            throw error;
        }
    }

    async getProjectPhaseById(id) {
        try {
            const response = await this.api.get(`/project-phases/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching project phase ${id}:`, error);
            throw error;
        }
    }

    async getProjectPhasesByProjectId(projectId) {
        try {
            const response = await this.api.get(`/project-phases/project/${projectId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching project phases for project ${projectId}:`, error);
            throw error;
        }
    }

    async createProjectPhase(projectPhase) {
        try {
            const response = await this.api.post('/project-phases', projectPhase);
            return response.data;
        } catch (error) {
            console.error('Error creating project phase:', error);
            throw error;
        }
    }

    async updateProjectPhase(id, projectPhase) {
        try {
            const response = await this.api.put(`/project-phases/${id}`, projectPhase);
            return response.data;
        } catch (error) {
            console.error(`Error updating project phase ${id}:`, error);
            throw error;
        }
    }

    async deleteProjectPhase(id) {
        try {
            await this.api.delete(`/project-phases/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting project phase ${id}:`, error);
            throw error;
        }
    }
}

const projectPhaseService = new ProjectPhaseService();
export default projectPhaseService;
