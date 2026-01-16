// API client for ClipSync backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('clipsync_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('clipsync_token', token);
    } else {
      localStorage.removeItem('clipsync_token');
    }
  }

  getToken() {
    return this.token;
  }

  async request(endpoint, options = {}) {
    let response;
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || 'Request failed');
        error.response = {
          status: response.status,
          data: data,
        };
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      // Preserve response data if it exists
      if (error.response) {
        throw error;
      }
      // If it's a network error, wrap it
      const wrappedError = new Error(error.message || 'Network error');
      wrappedError.originalError = error;
      throw wrappedError;
    }
  }

  // Auth endpoints
  async loginWithGoogle(credential) {
    const data = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    const data = await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
    return data;
  }

  async deleteAccount() {
    const data = await this.request('/auth/account', { method: 'DELETE' });
    this.setToken(null);
    return data;
  }

  async updateProfile(name, email) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    });
  }

  async updatePassword(currentPassword, newPassword) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Clips endpoints
  async getClips(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/clips?${queryString}`);
  }

  async getClip(id) {
    return this.request(`/clips/${id}`);
  }

  async createClip(clipData) {
    return this.request('/clips', {
      method: 'POST',
      body: JSON.stringify(clipData),
    });
  }

  async updateClip(id, clipData) {
    return this.request(`/clips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clipData),
    });
  }

  async togglePin(id) {
    return this.request(`/clips/${id}/pin`, { method: 'PATCH' });
  }

  async deleteClip(id) {
    return this.request(`/clips/${id}`, { method: 'DELETE' });
  }

  async bulkDeleteClips(clipIds) {
    return this.request('/clips/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ clipIds }),
    });
  }

  async clearAllClips() {
    return this.request('/clips', { method: 'DELETE' });
  }

  async getClipStats() {
    return this.request('/clips/stats/summary');
  }

  async getDashboardStats(days = 30) {
    return this.request(`/clips/stats/dashboard?days=${days}`);
  }

  async expandTemplate(clipId, placeholders) {
    return this.request(`/clips/${clipId}/expand-template`, {
      method: 'POST',
      body: JSON.stringify({ placeholders }),
    });
  }

  async setClipExpiration(clipId, expiresInMinutes) {
    return this.request(`/clips/${clipId}/expire`, {
      method: 'PATCH',
      body: JSON.stringify({ expiresInMinutes }),
    });
  }

  async splitClip(clipId, delimiter) {
    return this.request(`/clips/${clipId}/split`, {
      method: 'POST',
      body: JSON.stringify({ delimiter }),
    });
  }

  // Teams endpoints
  async getTeams() {
    return this.request('/teams');
  }

  async getTeam(teamId) {
    return this.request(`/teams/${teamId}`);
  }

  async createTeam(teamData) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async updateTeam(teamId, teamData) {
    return this.request(`/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    });
  }

  async deleteTeam(teamId) {
    return this.request(`/teams/${teamId}`, { method: 'DELETE' });
  }

  async inviteTeamMember(teamId, memberData) {
    return this.request(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async updateTeamMemberRole(teamId, memberId, role) {
    return this.request(`/teams/${teamId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async removeTeamMember(teamId, memberId) {
    return this.request(`/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  async leaveTeam(teamId) {
    return this.request(`/teams/${teamId}/leave`, { method: 'POST' });
  }

  async getTeamActivity(teamId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/teams/${teamId}/activity?${queryString}`);
  }

  // Team clips endpoints
  async getTeamClips(teamId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/teams/${teamId}/clips?${queryString}`);
  }

  async getTeamClip(teamId, clipId) {
    return this.request(`/teams/${teamId}/clips/${clipId}`);
  }

  async createTeamClip(teamId, clipData) {
    return this.request(`/teams/${teamId}/clips`, {
      method: 'POST',
      body: JSON.stringify(clipData),
    });
  }

  async updateTeamClip(teamId, clipId, clipData) {
    return this.request(`/teams/${teamId}/clips/${clipId}`, {
      method: 'PUT',
      body: JSON.stringify(clipData),
    });
  }

  async deleteTeamClip(teamId, clipId) {
    return this.request(`/teams/${teamId}/clips/${clipId}`, {
      method: 'DELETE',
    });
  }

  async getTeamClipStats(teamId) {
    return this.request(`/teams/${teamId}/clips/stats/summary`);
  }

  // Share links endpoints
  async createShareLink(shareData) {
    return this.request('/shares', {
      method: 'POST',
      body: JSON.stringify(shareData),
    });
  }

  async getShareLink(shareId) {
    return this.request(`/shares/${shareId}`);
  }

  async verifySharePassword(shareId, password) {
    return this.request(`/shares/${shareId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async getUserShareLinks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/shares/user/list?${queryString}`);
  }

  async deleteShareLink(shareId) {
    return this.request(`/shares/${shareId}`, { method: 'DELETE' });
  }

  async getShareQRCode(shareId) {
    return this.request(`/shares/${shareId}/qr`);
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
