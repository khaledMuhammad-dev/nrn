import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error ?? err.message;
    return Promise.reject(new Error(msg));
  }
);

export default api;
