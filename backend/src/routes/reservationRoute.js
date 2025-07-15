// 라우터 정의

const express = require('express');
const router = express.Router();
const { createReservation, cancelReservation } = require('../controllers/reservationController');
const auth = require('../middleware/auth');

// POST /reservations
router.post('/reservations', auth, createReservation);

// DELETE /reservations/:id
router.delete('/reservations/:id', auth, cancelReservation);

module.exports = router;