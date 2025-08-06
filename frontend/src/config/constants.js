export const API_ENDPOINTS = {
  SUBWAY: {
    ARRIVAL: '/subway/arrival',
    LINES: '/subway/lines',
    STATIONS: '/subway/stations',
    TRAIN_SEATS: '/subway/train',
    HEALTH: '/subway/health'
  }
};

export const SUBWAY_CONFIG = {
  AUTO_REFRESH_INTERVAL: 30000, // 30초
  REQUEST_TIMEOUT: 15000, // 15초
  MAX_RETRIES: 3,
  CACHE_DURATION: 30000 // 30초
};

export const COLORS = {
  PRIMARY: '#C599B6',
  SECONDARY: '#7D6073',
  BACKGROUND: '#FFF7F3',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6'
};

// 지하철 호선별 색상
export const LINE_COLORS = {
  '1호선': '#0052A4',
  '2호선': '#00A84D',
  '3호선': '#EF7C1C',
  '4호선': '#00A5DE',
  '5호선': '#996CAC',
  '6호선': '#CD7C2F',
  '7호선': '#747F00',
  '8호선': '#E6186C',
  '9호선': '#BDB092',
  '중앙선': '#0C8E72',
  '경의중앙선': '#77C4A3',
  '공항철도': '#0090D2',
  '경춘선': '#178C72',
  '수인분당선': '#FABE00',
  '신분당선': '#D4003B',
  '우이신설선': '#B7C452'
};