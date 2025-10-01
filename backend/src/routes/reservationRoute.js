// 라우터 정의

const express = require('express');
const router = express.Router();
const { createReservation, cancelReservation, getReservationsByUser } = require('../controllers/reservationController');
const auth = require('../middleware/auth');

// GET /reservations (사용자 본인의 예약 내역 조회)
router.get('/', auth, getReservationsByUser);

// POST /reservations
router.post('/', auth, createReservation);

// DELETE /reservations/:id
router.delete('/:id', auth, cancelReservation);

module.exports = router;