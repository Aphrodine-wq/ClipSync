// API client adapter for ClipSync web app
// Uses shared client with browser-specific token storage

import { ApiClient } from '@clipsync/shared-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create API client instance with browser-specific adapters
const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  getToken: () => {
    return localStorage.getItem('clipsync_token');
  },
  setToken: (token) => {
    if (token) {
      localStorage.setItem('clipsync_token', token);
    } else {
      localStorage.removeItem('clipsync_token');
    }
  },
  onTokenExpired: async () => {
    // Token refresh logic can be added here if needed
    return false;
  },
});

// Add convenience methods that were in the original API client
apiClient.setToken = (token) => {
  if (token) {
    localStorage.setItem('clipsync_token', token);
  } else {
    localStorage.removeItem('clipsync_token');
  }
};

apiClient.getToken = () => {
  return localStorage.getItem('clipsync_token');
};

// Auth endpoints
apiClient.loginWithGoogle = async (credential) => {
  const data = await apiClient.post('/auth/google', { credential });
  if (data.token) {
    apiClient.setToken(data.token);
  }
  return data;
};

apiClient.getCurrentUser = async () => {
  return apiClient.get('/auth/me');
};

apiClient.logout = async () => {
  const data = await apiClient.post('/auth/logout');
  apiClient.setToken(null);
  return data;
};

apiClient.deleteAccount = async () => {
  const data = await apiClient.delete('/auth/account');
  apiClient.setToken(null);
  return data;
};

apiClient.updateProfile = async (name, email) => {
  return apiClient.put('/auth/profile', { name, email });
};

apiClient.updatePassword = async (currentPassword, newPassword) => {
  return apiClient.put('/auth/password', { currentPassword, newPassword });
};

// Clips endpoints
apiClient.getClips = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiClient.get(`/clips?${queryString}`);
};

apiClient.getClip = async (id) => {
  return apiClient.get(`/clips/${id}`);
};

apiClient.createClip = async (clipData) => {
  return apiClient.post('/clips', clipData);
};

apiClient.updateClip = async (id, clipData) => {
  return apiClient.put(`/clips/${id}`, clipData);
};

apiClient.togglePin = async (id) => {
  return apiClient.patch(`/clips/${id}/pin`);
};

apiClient.deleteClip = async (id) => {
  return apiClient.delete(`/clips/${id}`);
};

apiClient.bulkDeleteClips = async (clipIds) => {
  return apiClient.post('/clips/bulk-delete', { clipIds });
};

apiClient.clearAllClips = async () => {
  return apiClient.delete('/clips');
};

apiClient.getClipStats = async () => {
  return apiClient.get('/clips/stats/summary');
};

apiClient.getDashboardStats = async (days = 30) => {
  return apiClient.get(`/clips/stats/dashboard?days=${days}`);
};

apiClient.expandTemplate = async (clipId, placeholders) => {
  return apiClient.post(`/clips/${clipId}/expand-template`, { placeholders });
};

apiClient.setClipExpiration = async (clipId, expiresInMinutes) => {
  return apiClient.patch(`/clips/${clipId}/expire`, { expiresInMinutes });
};

apiClient.splitClip = async (clipId, delimiter) => {
  return apiClient.post(`/clips/${clipId}/split`, { delimiter });
};

// Teams endpoints
apiClient.getTeams = async () => {
  return apiClient.get('/teams');
};

apiClient.getTeam = async (teamId) => {
  return apiClient.get(`/teams/${teamId}`);
};

apiClient.createTeam = async (teamData) => {
  return apiClient.post('/teams', teamData);
};

apiClient.updateTeam = async (teamId, teamData) => {
  return apiClient.put(`/teams/${teamId}`, teamData);
};

apiClient.deleteTeam = async (teamId) => {
  return apiClient.delete(`/teams/${teamId}`);
};

apiClient.inviteTeamMember = async (teamId, memberData) => {
  return apiClient.post(`/teams/${teamId}/members`, memberData);
};

apiClient.updateTeamMemberRole = async (teamId, memberId, role) => {
  return apiClient.put(`/teams/${teamId}/members/${memberId}`, { role });
};

apiClient.removeTeamMember = async (teamId, memberId) => {
  return apiClient.delete(`/teams/${teamId}/members/${memberId}`);
};

apiClient.leaveTeam = async (teamId) => {
  return apiClient.post(`/teams/${teamId}/leave`);
};

apiClient.getTeamActivity = async (teamId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiClient.get(`/teams/${teamId}/activity?${queryString}`);
};

// Team clips endpoints
apiClient.getTeamClips = async (teamId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiClient.get(`/teams/${teamId}/clips?${queryString}`);
};

apiClient.getTeamClip = async (teamId, clipId) => {
  return apiClient.get(`/teams/${teamId}/clips/${clipId}`);
};

apiClient.createTeamClip = async (teamId, clipData) => {
  return apiClient.post(`/teams/${teamId}/clips`, clipData);
};

apiClient.updateTeamClip = async (teamId, clipId, clipData) => {
  return apiClient.put(`/teams/${teamId}/clips/${clipId}`, clipData);
};

apiClient.deleteTeamClip = async (teamId, clipId) => {
  return apiClient.delete(`/teams/${teamId}/clips/${clipId}`);
};

apiClient.getTeamClipStats = async (teamId) => {
  return apiClient.get(`/teams/${teamId}/clips/stats/summary`);
};

// Share links endpoints
apiClient.createShareLink = async (shareData) => {
  return apiClient.post('/shares', shareData);
};

apiClient.getShareLink = async (shareId) => {
  return apiClient.get(`/shares/${shareId}`);
};

apiClient.verifySharePassword = async (shareId, password) => {
  return apiClient.post(`/shares/${shareId}/verify`, { password });
};

apiClient.getUserShareLinks = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiClient.get(`/shares/user/list?${queryString}`);
};

apiClient.deleteShareLink = async (shareId) => {
  return apiClient.delete(`/shares/${shareId}`);
};

apiClient.getShareQRCode = async (shareId) => {
  return apiClient.get(`/shares/${shareId}/qr`);
};

export default apiClient;
