import { create } from 'zustand';
import apiClient from '../services/api';
import wsClient from '../services/websocket';

const useTeamStore = create((set, get) => ({
  // State
  teams: [],
  currentTeam: null,
  teamClips: [],
  teamMembers: [],
  teamActivity: [],
  isLoading: false,
  error: null,

  // Initialize teams
  initialize: async () => {
    try {
      set({ isLoading: true });
      const data = await apiClient.getTeams();
      set({ teams: data.teams, isLoading: false });
      
      // Join team rooms via WebSocket
      if (data.teams.length > 0) {
        const teamIds = data.teams.map(t => t.id);
        wsClient.joinTeams(teamIds);
      }
    } catch (error) {
      console.error('Initialize teams error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Get team details
  getTeam: async (teamId) => {
    try {
      set({ isLoading: true });
      const data = await apiClient.getTeam(teamId);
      set({ 
        currentTeam: data.team,
        teamMembers: data.team.members,
        isLoading: false 
      });
      return data.team;
    } catch (error) {
      console.error('Get team error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Create team
  createTeam: async (teamData) => {
    try {
      set({ isLoading: true });
      const data = await apiClient.createTeam(teamData);
      const { teams } = get();
      set({ 
        teams: [...teams, data.team],
        isLoading: false 
      });
      
      // Join the new team room
      wsClient.joinTeams([data.team.id]);
      
      return data.team;
    } catch (error) {
      console.error('Create team error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update team
  updateTeam: async (teamId, teamData) => {
    try {
      set({ isLoading: true });
      const data = await apiClient.updateTeam(teamId, teamData);
      const { teams } = get();
      set({
        teams: teams.map(t => t.id === teamId ? data.team : t),
        currentTeam: data.team,
        isLoading: false
      });
      return data.team;
    } catch (error) {
      console.error('Update team error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Delete team
  deleteTeam: async (teamId) => {
    try {
      set({ isLoading: true });
      await apiClient.deleteTeam(teamId);
      const { teams } = get();
      set({
        teams: teams.filter(t => t.id !== teamId),
        currentTeam: null,
        isLoading: false
      });
    } catch (error) {
      console.error('Delete team error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get team clips
  getTeamClips: async (teamId, params = {}) => {
    try {
      set({ isLoading: true });
      const data = await apiClient.getTeamClips(teamId, params);
      set({ teamClips: data.clips, isLoading: false });
      return data.clips;
    } catch (error) {
      console.error('Get team clips error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Create team clip
  createTeamClip: async (teamId, clipData) => {
    try {
      const data = await apiClient.createTeamClip(teamId, clipData);
      const { teamClips } = get();
      set({ teamClips: [data.clip, ...teamClips] });
      
      // Notify other team members via WebSocket
      wsClient.notifyTeamClipCreated(teamId, data.clip);
      
      return data.clip;
    } catch (error) {
      console.error('Create team clip error:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Update team clip
  updateTeamClip: async (teamId, clipId, clipData) => {
    try {
      const data = await apiClient.updateTeamClip(teamId, clipId, clipData);
      const { teamClips } = get();
      set({
        teamClips: teamClips.map(c => c.id === clipId ? data.clip : c)
      });
      
      // Notify other team members
      wsClient.notifyTeamClipUpdated(teamId, data.clip);
      
      return data.clip;
    } catch (error) {
      console.error('Update team clip error:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Delete team clip
  deleteTeamClip: async (teamId, clipId) => {
    try {
      await apiClient.deleteTeamClip(teamId, clipId);
      const { teamClips } = get();
      set({
        teamClips: teamClips.filter(c => c.id !== clipId)
      });
      
      // Notify other team members
      wsClient.notifyTeamClipDeleted(teamId, clipId);
    } catch (error) {
      console.error('Delete team clip error:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Sync team clip from remote
  syncTeamClipFromRemote: (teamId, clip) => {
    const { teamClips, currentTeam } = get();
    
    // Only update if we're viewing this team
    if (currentTeam?.id === teamId) {
      const exists = teamClips.some(c => c.id === clip.id);
      if (!exists) {
        set({ teamClips: [clip, ...teamClips] });
      }
    }
  },

  // Update team clip from remote
  updateTeamClipFromRemote: (teamId, clip) => {
    const { teamClips, currentTeam } = get();
    
    if (currentTeam?.id === teamId) {
      set({
        teamClips: teamClips.map(c => c.id === clip.id ? clip : c)
      });
    }
  },

  // Delete team clip from remote
  deleteTeamClipFromRemote: (teamId, clipId) => {
    const { teamClips, currentTeam } = get();
    
    if (currentTeam?.id === teamId) {
      set({
        teamClips: teamClips.filter(c => c.id !== clipId)
      });
    }
  },

  // Invite team member
  inviteTeamMember: async (teamId, memberData) => {
    try {
      const data = await apiClient.inviteTeamMember(teamId, memberData);
      const { teamMembers } = get();
      set({ teamMembers: [...teamMembers, data.member] });
      return data.member;
    } catch (error) {
      console.error('Invite member error:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Update member role
  updateMemberRole: async (teamId, memberId, role) => {
    try {
      const data = await apiClient.updateTeamMemberRole(teamId, memberId, role);
      const { teamMembers } = get();
      set({
        teamMembers: teamMembers.map(m => m.id === memberId ? data.member : m)
      });
      return data.member;
    } catch (error) {
      console.error('Update member role error:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Remove team member
  removeMember: async (teamId, memberId) => {
    try {
      await apiClient.removeTeamMember(teamId, memberId);
      const { teamMembers } = get();
      set({
        teamMembers: teamMembers.filter(m => m.id !== memberId)
      });
    } catch (error) {
      console.error('Remove member error:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Leave team
  leaveTeam: async (teamId) => {
    try {
      await apiClient.leaveTeam(teamId);
      const { teams } = get();
      set({
        teams: teams.filter(t => t.id !== teamId),
        currentTeam: null
      });
    } catch (error) {
      console.error('Leave team error:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Get team activity
  getTeamActivity: async (teamId, params = {}) => {
    try {
      const data = await apiClient.getTeamActivity(teamId, params);
      set({ teamActivity: data.activities });
      return data.activities;
    } catch (error) {
      console.error('Get team activity error:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Set current team
  setCurrentTeam: (team) => {
    set({ currentTeam: team });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useTeamStore;
