import api from './api';

export const userService = {
  getMe: () => api.get('/users/me').then((res) => res.data),
  getAll: () => api.get('/users').then((res) => res.data),
};
