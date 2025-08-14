/**
 * Firestore 컬렉션 구조 정의
 * 
 * 컬렉션 구조:
 * 
 * 1. users (사용자 정보)
 * └── {userId}
 *     ├── email: string
 *     ├── name: string
 *     ├── phone: string
 *     ├── isPregnantVerified: boolean
 *     ├── verificationDate: timestamp
 *     ├── createdAt: timestamp
 *     └── updatedAt: timestamp
 * 
 * 2. trains (열차 정보)
 * └── {trainNumber}
 *     ├── lineNumber: string (예: "2호선")
 *     ├── direction: string (예: "내선순환")
 *     ├── totalCars: number
 *     ├── isActive: boolean
 *     └── seats (서브컬렉션)
 *         └── {carNumber}_{seatNumber}
 *             ├── carNumber: number
 *             ├── seatNumber: string (예: "A1")
 *             ├── seatType: string ('pregnant'|'general'|'disabled'|'elderly')
 *             ├── rowNum: number
 *             ├── colNum: number
 *             └── isAvailable: boolean
 * 
 * 3. reservations (예약 정보)
 * └── {reservationId}
 *     ├── userId: string
 *     ├── trainNumber: string
 *     ├── carNumber: number
 *     ├── seatNumber: string
 *     ├── departureStation: string
 *     ├── arrivalStation: string
 *     ├── boardingTime: timestamp
 *     ├── expiryTime: timestamp
 *     ├── status: string ('pending'|'confirmed'|'cancelled'|'completed'|'expired')
 *     ├── createdAt: timestamp
 *     └── updatedAt: timestamp
 * 
 * 4. seatStatus (실시간 좌석 상태)
 * └── {trainNumber}_{carNumber}_{seatNumber}
 *     ├── trainNumber: string
 *     ├── carNumber: number
 *     ├── seatNumber: string
 *     ├── status: string ('available'|'occupied'|'reserved'|'maintenance')
 *     ├── currentReservationId: string | null
 *     ├── lastUpdated: timestamp
 *     └── occupiedUntil: timestamp | null
 * 
 * 5. pregnantCertificates (임산부 인증서)
 * └── {userId}
 *     ├── certificateUrl: string
 *     ├── verifiedAt: timestamp
 *     ├── verifiedBy: string (admin userId)
 *     ├── expiryDate: timestamp
 *     └── status: string ('pending'|'approved'|'rejected')
 * 
 * 컬렉션 이름 상수
 */

const COLLECTIONS = {
  USERS: 'users',
  TRAINS: 'trains',
  RESERVATIONS: 'reservations',
  SEAT_STATUS: 'seatStatus',
  PREGNANT_CERTIFICATES: 'pregnantCertificates',
  // 서브컬렉션
  SEATS: 'seats'
};

module.exports = COLLECTIONS;