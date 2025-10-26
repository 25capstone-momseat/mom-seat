// 비즈니스 로직

const { admin, db } = require('../config/firebase');

// 예약 로직
const createReservation = async (req, res) => {
  const { seatId } = req.body;
  const userId = req.user.uid;

  if (!seatId) {
    return res.status(400).json({ message: 'seatId가 필요합니다.' });
  }

  try {
    const reservationRef = await db.runTransaction(async (transaction) => {
      const seatRef = db.collection('seats').doc(seatId);
      const seatSnap = await transaction.get(seatRef);

      if (!seatSnap.exists) {
        throw new Error('404/좌석 정보를 찾을 수 없습니다.');
      }

      const seat = seatSnap.data();

      // 조건: status가 'vacant'이고 reserved가 false일 때만 예약 가능
      if (seat.status !== 'vacant' || seat.reserved === true) {
        throw new Error('409/이미 예약된 좌석이거나 이용 중인 좌석입니다.');
      }

      // 좌석 예약 상태로 변경: reserved와 reservedBy만 업데이트
      transaction.update(seatRef, {
        reserved: true,
        reservedBy: userId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 예약 테이블에 추가
      const newReservationRef = db.collection('reservations').doc();
      transaction.set(newReservationRef, {
        userId,
        seatId,
        status: 'reserved',
        reservedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return newReservationRef;
    });

    return res.status(200).json({
      message: '예약 완료',
      reservationId: reservationRef.id
    });

  } catch (error) {
    console.error('예약 중 오류 발생:', error);
    if (error.message.startsWith('404/')) {
      return res.status(404).json({ message: error.message.split('/')[1] });
    }
    if (error.message.startsWith('409/')) {
      return res.status(409).json({ message: error.message.split('/')[1] });
    }
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 취소 로직

const cancelReservation = async (req, res) => {
  const reservationId = req.params.id;
  const userId = req.user.uid;

  try {
    await db.runTransaction(async (transaction) => {
      const reservationRef = db.collection('reservations').doc(reservationId);
      const reservationSnap = await transaction.get(reservationRef);

      if (!reservationSnap.exists) {
        throw new Error('404/예약 정보를 찾을 수 없습니다.');
      }

      const reservation = reservationSnap.data();

      // 본인 예약만 취소 가능
      if (reservation.userId !== userId) {
        throw new Error('403/본인 예약만 취소할 수 있습니다.');
      }

      // 이미 이용 완료된 예약은 취소 불가
      if (reservation.status === 'completed') {
        throw new Error('409/이미 이용 완료된 예약은 취소할 수 없습니다.');
      }

      // 좌석의 reserved 상태만 변경
      const seatRef = db.collection('seats').doc(reservation.seatId);
      transaction.update(seatRef, {
        reserved: false,
        reservedBy: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 예약 문서 삭제
      transaction.delete(reservationRef);
    });

    return res.json({ message: '예약이 취소되었습니다.' });

  } catch (error) {
    console.error('예약 취소 중 오류 발생:', error);
    if (error.message.startsWith('403/') || error.message.startsWith('404/') || error.message.startsWith('409/')) {
      const [status, ...message] = error.message.split('/');
      return res.status(Number(status)).json({ message: message.join('/') });
    }
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

const getReservationsByUser = async (req, res) => {
  const userId = req.user.uid;

  try {
    const reservationsQuery = db.collection('reservations').where('userId', '==', userId).orderBy('reservedAt', 'desc');
    const snapshot = await reservationsQuery.get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const reservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(reservations);

  } catch (error) {
    console.error('사용자 예약 내역 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = { createReservation, cancelReservation, getReservationsByUser };
