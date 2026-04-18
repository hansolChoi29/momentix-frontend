import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('accessToken', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signUp: (email: string, body: object) => api.post('/auth/signup', body, { headers: { 'X-User-Email': email } }),
  signIn: (body: object) => api.post('/auth/signin', body),
  signOut: () => api.post('/auth/signout'),
};

export const eventApi = {
  list: (params?: object) => api.get('/events', { params }),
  detail: (id: number) => api.get(`/events/${id}`),
  search: (params: object) => api.get('/search', { params }),
  autocomplete: (keyword: string) => api.get('/search/autocomplete', { params: { keyword } }),
  seats: (eventId: number, scheduleId: number) =>
    api.get(`/events/${eventId}/schedules/${scheduleId}/seats`),
};

export const reservationApi = {
  create: (body: object) => api.post('/reservations', body),
  myList: () => api.get('/reservations/my'),
  cancel: (id: number) => api.delete(`/reservations/${id}`),
};

export const paymentApi = {
  pay: (body: object) => api.post('/payments', body),
  myHistory: () => api.get('/payments/my'),
};

export const ticketApi = {
  myList: (params?: object) => api.get('/tickets/my', { params }),
  detail: (id: number) => api.get(`/tickets/${id}`),
};

export const userApi = {
  me: () => api.get('/users/me'),
  update: (body: object) => api.put('/users/me', body),
};
