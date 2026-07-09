import api from './api';

export const sprintService = {
  getForProject: (projectId) => api.get('/sprints', { params: { projectId } }).then((res) => res.data),
  create: (payload) => api.post('/sprints', payload).then((res) => res.data),
  updateStatus: (id, status) => api.patch(`/sprints/${id}/status`, { status }).then((res) => res.data),
  remove: (id) => api.delete(`/sprints/${id}`),
};
