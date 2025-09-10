/**
 * Firestore 좌석 모델
 * 
 * Firestore와 상호작용하는 좌석 모델 클래스
 * 
 * 속성:
 * - trainNumber: 열차 번호
 * - carNumber: 칸 번호
 * - seatNumber: 좌석 번호
 * - seatType: 좌석 유형
 * - status: 좌석 상태
 * - currentReservationId: 현재 예약 ID
 * 
 * 메서드:
 * - static async getByTrainAndCar(trainNumber, carNumber): 칸별 좌석 조회
 * - static async getSeat(trainNumber, carNumber, seatNumber): 특정 좌석 조회
 * - static async getAvailable(trainNumber, carNumber): 이용 가능 좌석 조회
 * - static async getPregnantSeats(trainNumber): 임산부 좌석 조회
 * - async updateStatus(status, reservationId): 좌석 상태 업데이트
 * - async reserve(reservationId): 좌석 예약
 * - async release(): 좌석 해제
 * - static async initializeSeats(trainNumber, layoutConfig): 좌석 초기화
 * - static async batchUpdate(updates): 일괄 업데이트
 * - isAvailable(): 이용 가능 여부 확인
 * 
 * 실시간 리스너:
 * - static onStatusChange(trainNumber, callback): 상태 변경 구독
 * - static unsubscribe(listener): 구독 해제
 */

const admin = require('firebase-admin');
const { SEAT_STATUS } = require('../config/firestoreCollections');
const db = admin.firestore();
const seatCollection = db.collection(SEAT_STATUS);

class FirestoreSeat {
  /**
   * 특정 좌석의 상태를 업데이트합니다. (센서 연동용)
   * @param {string} seatId - 업데이트할 좌석의 문서 ID
   * @param {string} status - 새로운 좌석 상태 (e.g., 'available', 'occupied')
   * @returns {object|null} 업데이트된 좌석 객체 또는 null
   */
  static async updateStatus(seatId, status) {
    const seatRef = seatCollection.doc(seatId);
    const doc = await seatRef.get();

    if (!doc.exists) {
      console.error(`[FirestoreSeat.updateStatus] Error: Seat with ID ${seatId} not found.`);
      return null;
    }

    await seatRef.update({
      status: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await seatRef.get();
    const updatedSeat = { id: updatedDoc.id, ...updatedDoc.data() };
    
    console.log(`[FirestoreSeat.updateStatus] Seat ${seatId} status updated to ${status}`);
    return updatedSeat;
  }

  // 다른 기존 및 미래의 static 메서드들...
}

module.exports = FirestoreSeat;