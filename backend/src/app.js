const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // env 설정

const express = require("express");
const cors = require('cors');

// ocrAPI
const ocrRouter = require('./routes/ocrRoute'); // OCR 라우터 가져오기
// reservationAPI
const reservationRoute = require('./routes/reservationRoute');
// subwayAPI
const subwayRoutes = require('./routes/subwayRoute');

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],  // 프론트엔드 주소들
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// // 정적 파일 서빙 - frontend 폴더를 public으로 제공 => cors로 처리
// app.use(express.static(path.join(__dirname, '../frontend')));
// // 테스트용 기본 경로
// app.get("/", function (req, res) {
//   res.sendFile(path.join(__dirname, '../../frontend/index.html'));
// });

// OCR 라우터 연결 (이걸 통해 이미지 업로드 처리 가능)
app.use('/api/ocr', ocrRouter);

// 좌석 예약 및 취소 라우터 연결
app.use('/api/reservations', reservationRoute);

// 실시간 지하철 조회 라우터 연결
app.use('/api/subway', subwayRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
