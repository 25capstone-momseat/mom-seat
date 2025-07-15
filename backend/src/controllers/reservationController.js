// 비즈니스 로직

const admin = require('../config/firebase');

// 예약 로직
const createReservation = async (req, res) => {
  const { seatId } = req.body;
  const userId = req.user.uid;
  const { db } = require('../config/firebase');

  if (!seatId) {
    return res.status(400).json({ message: 'seatId가 필요합니다.' });
  }

  try {
    const seatRef = db.collection('seats').doc(seatId);
    const seatSnap = await seatRef.get();

    if (!seatSnap.exists) {
      return res.status(404).json({ message: '좌석 정보를 찾을 수 없습니다.' });
    }

    const seat = seatSnap.data();

    if (seat.status !== 'available') {
      return res.status(409).json({ message: '이미 예약된 좌석입니다.' });
    }

    // 좌석 예약 상태로 변경
    await seatRef.update({
      status: 'reserved',
      reservedBy: userId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 예약 테이블에 추가
    const reservationRef = await db.collection('reservations').add({
      userId,
      seatId,
      status: 'reserved',
      reservedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({
      message: '예약 완료',
      reservationId: reservationRef.id
    });

  } catch (error) {
    console.error('예약 중 오류 발생:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 취소 로직

const cancelReservation = async (req, res) => {
  const reservationId = req.params.id;
  const userId = req.user.uid;

  const { db } = require('../config/firebase');

  try {
    const reservationRef = db.collection('reservations').doc(reservationId);
    const reservationSnap = await reservationRef.get();

    if (!reservationSnap.exists) {
      return res.status(404).json({ message: '예약 정보를 찾을 수 없습니다.' });
    }

    const reservation = reservationSnap.data();

    // 본인 예약만 취소 가능
    if (reservation.userId !== userId) {
      return res.status(403).json({ message: '본인 예약만 취소할 수 있습니다.' });
    }

    // 이미 취소됨
    if (reservation.status === 'cancelled') {
      return res.status(409).json({ message: '이미 취소된 예약입니다.' });
    }

    // 좌석 정보도 수정
    const seatRef = db.collection('seats').doc(reservation.seatId);
    const seatSnap = await seatRef.get();

    if (!seatSnap.exists) {
      return res.status(404).json({ message: '좌석 정보를 찾을 수 없습니다.' });
    }

    // 예약 상태 'cancelled'로 변경
    await reservationRef.update({
      status: 'cancelled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 좌석 상태 null로 초기화
    await seatRef.update({
      status: 'available',
      reservedBy: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.json({ message: '예약이 취소되었습니다.' });

  } catch (error) {
    console.error('예약 취소 중 오류 발생:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = { createReservation, cancelReservation };
