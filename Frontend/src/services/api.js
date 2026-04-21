import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_BACKEND_URL?.trim();
const API_BASE_URL = rawBaseUrl
  ? rawBaseUrl.replace(/\/+$|\s+$/g, '')
  : `${window.location.origin}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach access token if available ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Public routes that should NEVER trigger a redirect ──
const PUBLIC_PATHS = ['/login', '/register', '/'];

const isOnPublicPage = () => PUBLIC_PATHS.includes(window.location.pathname);

// ── Response interceptor: handle 401 / token refresh ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors on non-public pages
    // and only once (prevent retry loops)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isOnPublicPage()
    ) {
      originalRequest._retry = true;
      try {
        // Attempt silent token refresh via httpOnly cookie
        await axios.post(`${API_BASE_URL}/users/refresh-token`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → clear token and redirect to login
        // But only if not already on a public page
        localStorage.removeItem('accessToken');
        if (!isOnPublicPage()) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
