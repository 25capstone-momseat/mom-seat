/**
 * 좌석 관련 라우트 정의
 * 
 * 라우트:
 * - GET /api/seats/layout/:trainNumber/:carNumber - 좌석 배치 조회
 * - GET /api/seats/status/:trainNumber/:carNumber - 좌석 상태 조회
 * - GET /api/seats/available/:trainNumber - 이용 가능 좌석 조회
 * - GET /api/seats/pregnant/:trainNumber - 임산부 좌석 조회
 * - PUT /api/seats/:seatId/status - 좌석 상태 업데이트
 * 
 * 미들웨어:
 * - 인증 확인
 * - 요청 검증
 * - 에러 처리
 * - 속도 제한
 */

const express = require('express');
const router = express.Router();

// 라우트 구현

module.exports = router;