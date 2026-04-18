import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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


export const eventApi = {
  list: (params?: object) => api.get('/events', { params }),
  detail: (eventId: number, placeId: number) => api.get(`/events/${eventId}/${placeId}`),
  seats: (eventId: number, placeId: number, eventTimeId: number, params?: object) =>
    api.get(`/events/${eventId}/${placeId}/event-time/${eventTimeId}`, { params }),
};

export const reservationApi = {
  create: (body: object) => api.post('/reservations', body),
  myList: () => api.get('/reservations/my'),
  cancel: (id: number) => api.delete(`/reservations/${id}`),
};

export const paymentApi = {
  create: (body: object) => api.post('/payment', body),
  confirm: (paymentId: number, body: object) => api.post(`/payment/${paymentId}/confirm`, body),
  getOne: (paymentId: number) => api.get(`/payment/${paymentId}`),
  cancel: (paymentId: number) => api.post(`/payment/${paymentId}/cancel`),
};

export const ticketApi = {
  myList: (params?: object) => api.get('/tickets/my', { params }),
  detail: (id: number) => api.get(`/tickets/${id}`),
};

export const userApi = {
  me: () => api.get('/users/me'),
  update: (body: object) => api.put('/users/me', body),
};

export const authApi = {
  signIn: (body: object) => api.post('/auth/sign-in', body),
  signOut: () => api.post('/auth/sign-out'),
  signUp: (email: string, body: object) =>
    api.post('/auth/sign-up', { email, ...body }),
};