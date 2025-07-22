// 라우터 정의

const express = require('express');
const router = express.Router();
const { createReservation, cancelReservation } = require('../controllers/reservationController');
const auth = require('../middleware/auth');

// POST /reservations
router.post('/', auth, createReservation);

// DELETE /reservations/:id
router.delete('/:id', auth, cancelReservation);

module.exports = router;