import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const teamMemberService = {
  getAllTeamMembers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/team-members`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  getTeamMemberById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/team-members/${String(id)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team member:', error);
      throw error;
    }
  },

  getTeamMembersByTeam: async (teamId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/team-members/team/${String(teamId)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team members by team:', error);
      throw error;
    }
  },

  createTeamMember: async (teamMemberData) => {
    try {
      // 确保teamId是字符串格式
      const formattedData = {
        ...teamMemberData,
        teamId: teamMemberData.teamId ? String(teamMemberData.teamId) : null
      };
      
      const response = await axios.post(`${API_BASE_URL}/team-members`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  },

  updateTeamMember: async (id, teamMemberData) => {
    try {
      // 确保teamId是字符串格式
      const formattedData = {
        ...teamMemberData,
        teamId: teamMemberData.teamId ? String(teamMemberData.teamId) : null
      };
      
      const response = await axios.put(`${API_BASE_URL}/team-members/${String(id)}`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  },

  deleteTeamMember: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/team-members/${String(id)}`);
    } catch (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  },

  checkEmailExists: async (email) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/team-members/check-email?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error('Error checking email:', error);
      throw error;
    }
  }
};

export default teamMemberService;
