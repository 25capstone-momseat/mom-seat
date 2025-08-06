// backend/routes/subwayRoute.js
const express = require('express');
const router = express.Router();
const {
  getRealtimeArrival,
  getSubwayLines,
  getStationsByLine,
  getTrainSeatInfo
} = require('../controllers/subwayController');

// 미들웨어 - 요청 로깅
router.use((req, res, next) => {
  console.log(`[Subway Route] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// 실시간 지하철 도착 정보 조회
// GET /api/subway/arrival/:stationName?lineNumber=2호선
router.get('/arrival/:stationName', getRealtimeArrival);

// 지하철 노선 목록 조회
// GET /api/subway/lines
router.get('/lines', getSubwayLines);

// 특정 호선의 역 목록 조회
// GET /api/subway/stations/:lineNumber
router.get('/stations/:lineNumber', getStationsByLine);

// 열차별 좌석 정보 조회
// GET /api/subway/train/:trainNumber/seats
router.get('/train/:trainNumber/seats', getTrainSeatInfo);

// 건강 체크 엔드포인트
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Subway API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 에러 핸들링 미들웨어
router.use((error, req, res, next) => {
  console.error('[Subway Route Error]', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || '지하철 API에서 오류가 발생했습니다.',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;