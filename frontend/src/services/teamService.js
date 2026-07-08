import api from './api';

export const teamService = {
  getAll: () => api.get('/teams').then((res) => res.data),
  getById: (id) => api.get(`/teams/${id}`).then((res) => res.data),
  create: (payload) => api.post('/teams', payload).then((res) => res.data),
  addMember: (teamId, userId) => api.post(`/teams/${teamId}/members`, { userId }).then((res) => res.data),
  removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`),
};
