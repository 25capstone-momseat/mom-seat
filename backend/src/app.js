// backend/src/app.js  (충돌 해결본)

const path = require('path');
// 루트(.env)가 backend/src 상위에 있을 경우 경로 지정
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

const ocrRouter = require('./routes/ocrRoute');
const reservationRoute = require('./routes/reservationRoute');
const subwayRoutes = require('./routes/subwayRoute');

const app = express();

// ✅ PORT는 한 번만 선언 (기본 8000)
const PORT = process.env.PORT || 8000;

// ✅ CORS: 프론트 여러 포트 허용 + Credentials + 프리플라이트 허용
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ✅ Health check
app.get('/', (req, res) => {
  res.json({
    message: '서버가 정상 작동 중입니다',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API 서버 정상',
    availableRoutes: ['/api/ocr', '/api/reservations', '/api/subway'],
  });
});

// ✅ Routers
app.use('/api/ocr', ocrRouter);
app.use('/api/reservations', reservationRoute);
app.use('/api/subway', subwayRoutes);

// ✅ 404 (경로 없는 미들웨어)
app.use((req, res) => {
  res.status(404).json({
    error: '요청한 경로를 찾을 수 없습니다',
    requestedPath: req.originalUrl,
    method: req.method,
  });
});

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`서버 실행 중: http://localhost:${PORT}`);
  console.log(`OCR API:   http://localhost:${PORT}/api/ocr/upload`);
  console.log('=================================');
});