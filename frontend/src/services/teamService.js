import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const teamService = {
  getAllTeams: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  getTeamById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${String(id)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
  },

  createTeam: async (teamData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/teams`, teamData);
      return response.data;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  updateTeam: async (id, teamData) => {
    try {
      console.log('Updating team:', id, teamData); // Debug log
      const response = await axios.put(`${API_BASE_URL}/teams/${String(id)}`, teamData);
      return response.data;
    } catch (error) {
      console.error('Error updating team:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  deleteTeam: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/teams/${String(id)}`);
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  },

  updateTeamMembers: async (teamId, memberIds) => {
    try {
      // 确保所有ID都是字符串格式，避免Java类型转换错误
      const formattedMemberIds = Array.isArray(memberIds) 
        ? memberIds.map(id => String(id)) 
        : [];
        
      const response = await axios.put(`${API_BASE_URL}/teams/${String(teamId)}/members`, {
        memberIds: formattedMemberIds
      });
      return response.data;
    } catch (error) {
      console.error('Error updating team members:', error);
      throw error;
    }
  },

  getTeamMembers: async (teamId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${String(teamId)}/members`);
      return response.data;
    } catch (error) {
      console.error('Error getting team members:', error);
      throw error;
    }
  }
};

export default teamService;
