import axios from 'axios';
import { getAuth, signOut } from 'firebase/auth';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue = [];
const flushQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject, originalRequest }) => {
    if (error) reject(error);
    else {
      if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
      resolve(api(originalRequest));
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    const user = getAuth().currentUser;
    if (user) {
      const tr = await user.getIdTokenResult();
      const exp = new Date(tr.expirationTime).getTime();
      const now = Date.now();
      const token = exp - now < 5 * 60 * 1000 ? await user.getIdToken(true) : tr.token;
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (e) => Promise.reject(e)
);

api.interceptors.response.use(
  (res) => {
    if (import.meta.env.DEV) {
      console.log(`API Response: ${res.config.method?.toUpperCase()} ${res.config.url}`, res.data);
    }
    return res;
  },
  async (error) => {
    const originalRequest = error.config || {};
    if (error.response?.status === 401 && !originalRequest._retry) {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        await signOut(auth).catch(() => {});
        window.location.href = '/login';
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, originalRequest });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const newToken = await user.getIdToken(true);
        flushQueue(null, newToken);
        return api(originalRequest);
      } catch (e) {
        flushQueue(e, null);
        await signOut(getAuth()).catch(() => {});
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    console.error(
      `API Error: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
      {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      }
    );
    const friendly = !error.response
      ? '네트워크 연결을 확인해주세요.'
      : ({
          400: '잘못된 요청입니다.',
          401: '로그인이 필요합니다.',
          403: '접근 권한이 없습니다.',
          404: '요청한 리소스를 찾을 수 없습니다.',
          429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        }[error.response.status] || error.response.data?.message || '알 수 없는 오류가 발생했습니다.');
    const augmented = { ...error, userMessage: friendly };
    return Promise.reject(augmented);
  }
);

export default api;
export const apiGet = (url, config={}) => api.get(url, config);
export const apiPost = (url, data={}, config={}) => api.post(url, data, config);
export const apiUpload = (url, file, { fieldName='image', onProgress } = {}) => {
  const fd = new FormData();
  fd.append(fieldName, file);
  return api.post(url, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (evt) => {
          const percent = Math.round((evt.loaded * 100) / (evt.total || 1));
          onProgress(percent);
        }
      : undefined,
  });
};

