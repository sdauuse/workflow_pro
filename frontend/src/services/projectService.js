import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const projectService = {
  getAllProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    await api.delete(`/projects/${id}`);
  },

  getProjectsByStatus: async (status) => {
    const response = await api.get(`/projects/status/${status}`);
    return response.data;
  },

  getEscalatedProjects: async () => {
    const response = await api.get('/projects/escalated');
    return response.data;
  },

  getUpcomingCheckpoints: async (daysAhead = 7) => {
    const response = await api.get(`/projects/upcoming-checkpoints?daysAhead=${daysAhead}`);
    return response.data;
  },

  searchProjects: async (name) => {
    const response = await api.get(`/projects/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  copyProject: async (id) => {
    const response = await api.post(`/projects/${id}/copy`);
    return response.data;
  },
};

export default projectService;
