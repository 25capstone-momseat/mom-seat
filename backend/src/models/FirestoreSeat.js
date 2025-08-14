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
const db = admin.firestore();

class FirestoreSeat {
  // 모델 구현
}

module.exports = FirestoreSeat;