const path = require('path');
// 환경 변수 로드 (최상단)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

// =============================================
// 1. EXPRESS 앱 초기화
// =============================================
const app = express();
const PORT = process.env.PORT || 8000;

// =============================================
// 2. 미들웨어 설정 (순서 중요!)
// =============================================

// CORS 설정 (한 번만!)
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSON 파싱 (한 번만!)
app.use(express.json({ limit: '10mb' })); // 파일 업로드 고려
app.use(express.urlencoded({ extended: true }));

// 요청 로깅 미들웨어 (개발 환경)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
  });
}

// =============================================
// 3. 라우터 임포트
// =============================================
const ocrRouter = require('./routes/ocrRoute');
const reservationRoute = require('./routes/reservationRoute');
const subwayRoutes = require('./routes/subwayRoute');
const seatRoute = require('./routes/seatRoute'); // 좌석 라우트 추가


// 인증 관련 라우터 추가 (필요시)
// const authRouter = require('./routes/auth');
// const userRouter = require('./routes/user');

// =============================================
// 4. Health Check 엔드포인트
// =============================================
app.get('/', (req, res) => {
  res.json({
    message: '서버가 정상 작동 중입니다',
    version: process.env.npm_package_version || '1.0.0',
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API 서버 정상',
    availableRoutes: {
      ocr: '/api/ocr',
      reservations: '/api/reservations', 
      subway: '/api/subway',
      profile: '/api/profile',
      // auth: '/api/auth',
      // user: '/api/user'
    }
  });
});

// Health check for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// =============================================
// 5. API 라우터 등록 (prefix 통일)
// =============================================
app.use('/api/ocr', ocrRouter);
app.use('/api/reservations', reservationRoute);
app.use('/api/subway', subwayRoutes);
app.use('/api/seats', seatRoute); // 좌석 라우트 등록
app.use('/api/profile', require('./routes/profile'));
app.use('/api/certificate', require('./routes/certificate'));

// 인증 관련 라우터 (추가 시)
// app.use('/api/auth', authRouter);
// app.use('/api/user', userRouter);

// =============================================
// 6. 에러 핸들링 미들웨어
// =============================================

// 404 핸들러 (모든 라우터 다음에 위치)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: '요청한 경로를 찾을 수 없습니다',
    requestedPath: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 전역 에러 핸들러 (마지막에 위치)
app.use((err, req, res, next) => {
  console.error('=== ERROR ===');
  console.error('Time:', new Date().toISOString());
  console.error('Path:', req.originalUrl);
  console.error('Method:', req.method);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('=============');

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// =============================================
// 7. 서버 시작 (모든 설정 완료 후)
// =============================================
const http = require('http');
const { setupWebSocket } = require('./utils/websocket');

const server = http.createServer(app);

// 웹소켓 서버 설정
setupWebSocket(server);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log('=================================');
    console.log(`서버 실행 중: http://localhost:${PORT}`);
    console.log(`웹소켓 서버도 함께 실행 중입니다.`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
    console.log(`API 목록: http://localhost:${PORT}/api`);
    console.log('=================================');
    console.log('API 엔드포인트:');
    console.log(`   OCR:          /api/ocr/upload`);
    console.log(`   OCR(CLOVA):   /api/ocr/clova`);
    console.log(`   OCR(General): /api/ocr/clova/general`);
    console.log(`   Reservations: /api/reservations`);
    console.log(`   Subway:       /api/subway`);
    console.log(`   Profile:      /api/profile`);
    console.log('=================================');
  });
}

module.exports = { app, server };