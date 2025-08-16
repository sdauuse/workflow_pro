import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class MilestoneService {
    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Basic CRUD operations
    async getAllMilestones() {
        try {
            const response = await this.api.get('/milestones');
            return response.data;
        } catch (error) {
            console.error('Error fetching milestones:', error);
            throw error;
        }
    }

    async getMilestoneById(id) {
        try {
            const response = await this.api.get(`/milestones/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching milestone ${id}:`, error);
            throw error;
        }
    }

    async getMilestonesByProjectId(projectId) {
        try {
            const response = await this.api.get(`/milestones/project/${projectId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching milestones for project ${projectId}:`, error);
            throw error;
        }
    }

    async createMilestone(milestone) {
        try {
            const response = await this.api.post('/milestones', milestone);
            return response.data;
        } catch (error) {
            console.error('Error creating milestone:', error);
            throw error;
        }
    }

    async updateMilestone(id, milestone) {
        try {
            const response = await this.api.put(`/milestones/${id}`, milestone);
            return response.data;
        } catch (error) {
            console.error(`Error updating milestone ${id}:`, error);
            throw error;
        }
    }

    async deleteMilestone(id) {
        try {
            await this.api.delete(`/milestones/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting milestone ${id}:`, error);
            throw error;
        }
    }

    // Advanced filtering and search
    async getMilestonesByStatus(status) {
        try {
            const response = await this.api.get(`/milestones/status/${status}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching milestones by status ${status}:`, error);
            throw error;
        }
    }

    async getMilestonesByPriority(priority) {
        try {
            const response = await this.api.get(`/milestones/priority/${priority}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching milestones by priority ${priority}:`, error);
            throw error;
        }
    }

    async getOverdueMilestones() {
        try {
            const response = await this.api.get('/milestones/overdue');
            return response.data;
        } catch (error) {
            console.error('Error fetching overdue milestones:', error);
            throw error;
        }
    }

    async getUpcomingMilestones(days = 30) {
        try {
            const response = await this.api.get(`/milestones/upcoming?days=${days}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching upcoming milestones (${days} days):`, error);
            throw error;
        }
    }

    async getCriticalMilestones() {
        try {
            const response = await this.api.get('/milestones/critical');
            return response.data;
        } catch (error) {
            console.error('Error fetching critical milestones:', error);
            throw error;
        }
    }

    async searchMilestones(searchTerm) {
        try {
            const response = await this.api.get(`/milestones/search?searchTerm=${encodeURIComponent(searchTerm)}`);
            return response.data;
        } catch (error) {
            console.error(`Error searching milestones for "${searchTerm}":`, error);
            throw error;
        }
    }

    async getMilestonesByOwner(owner) {
        try {
            const response = await this.api.get(`/milestones/owner/${encodeURIComponent(owner)}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching milestones for owner ${owner}:`, error);
            throw error;
        }
    }

    async getMilestonesWithDependencies() {
        try {
            const response = await this.api.get('/milestones/with-dependencies');
            return response.data;
        } catch (error) {
            console.error('Error fetching milestones with dependencies:', error);
            throw error;
        }
    }

    // Statistics and analytics
    async getMilestoneStatistics(projectId) {
        try {
            const response = await this.api.get(`/milestones/statistics/project/${projectId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching milestone statistics for project ${projectId}:`, error);
            throw error;
        }
    }

    // Progress and status updates
    async updateMilestoneProgress(id, progress) {
        try {
            const response = await this.api.patch(`/milestones/${id}/progress?progress=${progress}`);
            return response.data;
        } catch (error) {
            console.error(`Error updating progress for milestone ${id}:`, error);
            throw error;
        }
    }

    async completeMilestone(id) {
        try {
            // Use the existing status update endpoint as fallback
            const response = await this.api.patch(`/milestones/${id}/status?status=COMPLETED`);
            return response.data;
        } catch (error) {
            console.error(`Error completing milestone ${id}:`, error);
            // If status endpoint fails, try the new complete endpoint
            try {
                const response = await this.api.patch(`/milestones/${id}/complete`);
                return response.data;
            } catch (secondError) {
                console.error(`Error with complete endpoint:`, secondError);
                throw error; // Throw original error
            }
        }
    }

    // Advanced queries
    async getMilestonesByBudgetRange(minBudget, maxBudget) {
        try {
            const response = await this.api.get(`/milestones/budget-range?minBudget=${minBudget}&maxBudget=${maxBudget}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching milestones by budget range ${minBudget}-${maxBudget}:`, error);
            throw error;
        }
    }

    async getMilestonesDueBetween(startDate, endDate) {
        try {
            const response = await this.api.get(`/milestones/due-between?startDate=${startDate}&endDate=${endDate}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching milestones due between ${startDate} and ${endDate}:`, error);
            throw error;
        }
    }

    // Bulk operations
    async deleteMilestonesByProjectId(projectId) {
        try {
            await this.api.delete(`/milestones/project/${projectId}`);
            return true;
        } catch (error) {
            console.error(`Error deleting milestones for project ${projectId}:`, error);
            throw error;
        }
    }

    // Utility methods for frontend
    formatMilestoneStatus(status) {
        const statusMap = {
            'PENDING': 'Pending',
            'IN_PROGRESS': 'In Progress',
            'COMPLETED': 'Completed',
            'AT_RISK': 'At Risk',
            'DELAYED': 'Delayed',
            'CANCELLED': 'Cancelled'
        };
        return statusMap[status] || status;
    }

    formatMilestonePriority(priority) {
        const priorityMap = {
            'LOW': 'Low',
            'MEDIUM': 'Medium',
            'HIGH': 'High',
            'CRITICAL': 'Critical'
        };
        return priorityMap[priority] || priority;
    }

    getMilestoneStatusColor(status) {
        const colorMap = {
            'PENDING': '#faad14',
            'IN_PROGRESS': '#1890ff',
            'COMPLETED': '#52c41a',
            'AT_RISK': '#fa8c16',
            'DELAYED': '#f5222d',
            'CANCELLED': '#8c8c8c'
        };
        return colorMap[status] || '#d9d9d9';
    }

    getMilestonePriorityColor(priority) {
        const colorMap = {
            'LOW': '#52c41a',
            'MEDIUM': '#faad14',
            'HIGH': '#fa8c16',
            'CRITICAL': '#f5222d'
        };
        return colorMap[priority] || '#d9d9d9';
    }

    // Validation helpers
    validateMilestone(milestone) {
        const errors = [];

        if (!milestone.name || milestone.name.trim() === '') {
            errors.push('Milestone name is required');
        }

        if (!milestone.targetDate) {
            errors.push('Target date is required');
        }

        if (milestone.progress !== undefined && (milestone.progress < 0 || milestone.progress > 100)) {
            errors.push('Progress must be between 0 and 100');
        }

        if (milestone.budget !== undefined && milestone.budget < 0) {
            errors.push('Budget cannot be negative');
        }

        if (!milestone.project || !milestone.project.id) {
            errors.push('Project assignment is required');
        }

        return errors;
    }

    // Dashboard data helpers
    async getDashboardData(projectId = null) {
        try {
            let milestones;
            if (projectId) {
                milestones = await this.getMilestonesByProjectId(projectId);
            } else {
                milestones = await this.getAllMilestones();
            }

            const overdue = milestones.filter(m => 
                m.status !== 'COMPLETED' && new Date(m.targetDate) < new Date()
            );

            const upcoming = milestones.filter(m => {
                const targetDate = new Date(m.targetDate);
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                return m.status !== 'COMPLETED' && targetDate >= new Date() && targetDate <= nextWeek;
            });

            const critical = milestones.filter(m => 
                (m.priority === 'HIGH' || m.priority === 'CRITICAL') && m.status !== 'COMPLETED'
            );

            const statistics = {
                total: milestones.length,
                completed: milestones.filter(m => m.status === 'COMPLETED').length,
                overdue: overdue.length,
                upcoming: upcoming.length,
                critical: critical.length,
                avgProgress: milestones.length > 0 ? 
                    milestones.reduce((sum, m) => sum + (m.progress || 0), 0) / milestones.length : 0
            };

            return {
                milestones,
                overdue,
                upcoming,
                critical,
                statistics
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }
}

const milestoneServiceInstance = new MilestoneService();

export default milestoneServiceInstance;
