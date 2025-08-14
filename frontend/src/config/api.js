// // frontend/src/config/api.js
// import axios from 'axios';
// import { getAuth, signOut } from 'firebase/auth';

// /** ================================
//  *  1) API BaseURL (단일 소스)
//  *  - 8000 기본값 제거!
//  *  - VITE_API_BASE(권장) 또는 VITE_API_BASE_URL 둘 다 지원
//  *  ================================= */
// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE ||
//   import.meta.env.VITE_API_BASE_URL ||
//   (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

// /** ================================
//  *  2) axios 인스턴스
//  *  - 전역 Content-Type은 지정하지 않습니다(폼데이터 방해 방지)
//  *  ================================= */
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 15000,
// });

// /** ================================
//  *  3) 토큰 관리 (401 재시도 큐)
//  *  ================================= */
// let isRefreshing = false;
// let failedQueue = [];

// const flushQueue = (error, token = null) => {
//   failedQueue.forEach(({ resolve, reject, originalRequest }) => {
//     if (error) {
//       reject(error);
//     } else {
//       if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
//       resolve(api(originalRequest));
//     }
//   });
//   failedQueue = [];
// };

// /** ================================
//  *  4) Request Interceptor
//  *  - ID 토큰(만료 5분 전이면 강제 갱신) 자동 첨부
//  *  ================================= */
// api.interceptors.request.use(
//   async (config) => {
//     try {
//       const auth = getAuth();
//       const user = auth.currentUser;

//       if (user) {
//         const tokenResult = await user.getIdTokenResult();
//         const exp = new Date(tokenResult.expirationTime).getTime();
//         const now = Date.now();
//         const willExpireSoon = exp - now < 5 * 60 * 1000;

//         const token = willExpireSoon
//           ? await user.getIdToken(true)
//           : tokenResult.token;

//         config.headers = config.headers || {};
//         config.headers.Authorization = `Bearer ${token}`;
//       }

//       if (import.meta.env.DEV) {
//         console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
//       }

//       return config;
//     } catch (e) {
//       console.error('Request interceptor error:', e);
//       return config;
//     }
//   },
//   (error) => Promise.reject(error)
// );

// /** ================================
//  *  5) Response Interceptor
//  *  - 401이면 토큰 갱신 후 1회 재시도
//  *  - 에러 로그/사용자 메시지 통일
//  *  ================================= */
// api.interceptors.response.use(
//   (response) => {
//     if (import.meta.env.DEV) {
//       console.log(
//         `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
//         response.data
//       );
//     }
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config || {};

//     // 401 처리
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       const auth = getAuth();
//       const user = auth.currentUser;

//       if (!user) {
//         await signOut(auth).catch(() => {});
//         window.location.href = '/login';
//         return Promise.reject(error);
//       }

//       if (isRefreshing) {
//         // 갱신 중이면 큐 대기
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject, originalRequest });
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const newToken = await user.getIdToken(true);
//         flushQueue(null, newToken);
//         return api(originalRequest);
//       } catch (refreshErr) {
//         flushQueue(refreshErr, null);
//         await signOut(auth).catch(() => {});
//         window.location.href = '/login';
//         return Promise.reject(refreshErr);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     // 공통 에러 로깅
//     console.error(
//       `❌ API Error: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
//       {
//         status: error.response?.status,
//         message: error.response?.data?.message || error.message,
//         data: error.response?.data,
//       }
//     );

//     // 사용자 친화 메시지 추가
//     const augmented = {
//       ...error,
//       userMessage: getUserFriendlyErrorMessage(error),
//     };
//     return Promise.reject(augmented);
//   }
// );

// /** ================================
//  *  6) 유틸 함수
//  *  ================================= */
// function getUserFriendlyErrorMessage(err) {
//   if (!err.response) return '네트워크 연결을 확인해주세요.';
//   const status = err.response.status;
//   const msg = err.response.data?.message;
//   switch (status) {
//     case 400: return msg || '잘못된 요청입니다.';
//     case 401: return '로그인이 필요합니다.';
//     case 403: return '접근 권한이 없습니다.';
//     case 404: return '요청한 리소스를 찾을 수 없습니다.';
//     case 429: return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
//     case 500: return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
//     default:  return msg || '알 수 없는 오류가 발생했습니다.';
//   }
// }

// export const checkApiHealth = async () => {
//   try {
//     const { data } = await api.get('/health');
//     return { isHealthy: true, data };
//   } catch (e) {
//     return { isHealthy: false, error: e.userMessage || 'API 점검 실패' };
//   }
// };

// export const checkTokenStatus = async () => {
//   try {
//     const user = getAuth().currentUser;
//     if (!user) return { hasToken: false };
//     const tr = await user.getIdTokenResult();
//     const exp = new Date(tr.expirationTime).getTime();
//     const now = Date.now();
//     return {
//       hasToken: true,
//       isExpired: exp <= now,
//       expiresIn: Math.max(0, Math.floor((exp - now) / 1000)),
//       willExpireSoon: exp - now < 5 * 60 * 1000,
//     };
//   } catch (e) {
//     return { hasToken: false, error: e.message };
//   }
// };

// /** 편의 래퍼 */
// export const apiGet    = (url, config = {}) => api.get(url, config);
// export const apiPost   = (url, data = {}, config = {}) => api.post(url, data, config);
// export const apiPut    = (url, data = {}, config = {}) => api.put(url, data, config);
// export const apiPatch  = (url, data = {}, config = {}) => api.patch(url, data, config);
// export const apiDelete = (url, config = {}) => api.delete(url, config);

// /** 파일 업로드
//  *  - 기본 필드명을 'image'로 (OCR 업로드와 백엔드 일치)
//  *  - 필요 시 fieldName으로 'file' 등 변경 가능
//  */
// export const apiUpload = (url, file, { fieldName = 'image', onProgress } = {}) => {
//   const formData = new FormData();
//   formData.append(fieldName, file);
//   return api.post(url, formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//     onUploadProgress: onProgress
//       ? (evt) => {
//           const percent = Math.round((evt.loaded * 100) / (evt.total || 1));
//           onProgress(percent);
//         }
//       : undefined,
//   });
// };

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

