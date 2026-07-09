import api from './api';

export const projectService = {
  getAll: () => api.get('/projects').then((res) => res.data),
  getById: (id) => api.get(`/projects/${id}`).then((res) => res.data),
  create: (payload) => api.post('/projects', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/projects/${id}`, payload).then((res) => res.data),
  updateStatus: (id, status) => api.patch(`/projects/${id}/status`, { status }).then((res) => res.data),
  remove: (id) => api.delete(`/projects/${id}`),
};
