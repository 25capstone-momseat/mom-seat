const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

// 모든 좌석 정보 조회
router.get('/', seatController.getAllSeats);

// 하드웨어(센서)에서 좌석 상태를 업데이트하기 위한 라우트
// PATCH /api/seats/:seatId/status
router.patch('/:seatId/status', seatController.updateSeatStatus);

// 여기에 다른 좌석 관련 라우트들을 추가할 수 있습니다.
// 예: router.get('/seats/layout/:trainId/:carId', seatController.getSeatLayout);

module.exports = router;