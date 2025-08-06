// frontend/src/services/apiClient.js
import axios from 'axios';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 로딩 상태 관리 및 로깅
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    // 인증 토큰이 있다면 헤더에 추가 (필요시)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 로깅
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error);
    
    // 네트워크 오류 처리
    if (!error.response) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }
    
    // 상태코드별 에러 처리
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        throw new Error(data.message || '잘못된 요청입니다.');
      case 401:
        // 인증 오류 시 로그아웃 처리 (필요시)
        localStorage.removeItem('authToken');
        throw new Error('인증이 필요합니다.');
      case 403:
        throw new Error('접근 권한이 없습니다.');
      case 404:
        throw new Error('요청한 정보를 찾을 수 없습니다.');
      case 429:
        throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      case 500:
        throw new Error('서버 오류가 발생했습니다.');
      default:
        throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
    }
  }
);

// API 응답 래퍼 함수들
export const apiRequest = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
};

export default apiClient;