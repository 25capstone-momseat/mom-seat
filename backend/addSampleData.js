
// backend/addSampleData.js

// 기존 Firebase Admin 설정을 그대로 가져옵니다.
const { db } = require('./src/config/firebase');

console.log('Firestore DB 인스턴스를 성공적으로 가져왔습니다.');

// 샘플 데이터 정의
const sampleSeats = [
  {
    _id: 'TRAIN01-CAR3-SEAT5A',
    trainId: 'TRAIN01',
    carNumber: 3,
    seatNumber: '5A',
    type: 'pregnant_woman_seat',
    status: 'vacant'
  },
  {
    _id: 'TRAIN01-CAR3-SEAT5B',
    trainId: 'TRAIN01',
    carNumber: 3,
    seatNumber: '5B',
    type: 'pregnant_woman_seat',
    status: 'occupied'
  },
  {
    _id: 'TRAIN01-CAR3-SEAT6A',
    trainId: 'TRAIN01',
    carNumber: 3,
    seatNumber: '6A',
    type: 'general_seat',
    status: 'vacant'
  }
];

const sampleUser = {
  _id: 'SAMPLE_USER_UID_12345',
  email: 'sample.user@example.com',
  name: '김샘플',
  isPregnant: true,
  certificateUrl: null
};

const sampleReservation = {
  userId: 'SAMPLE_USER_UID_12345',
  seatId: 'TRAIN01-CAR3-SEAT5A',
  reservationTime: new Date(),
  status: 'active'
};

// 데이터를 Firestore에 추가하는 메인 함수
async function addSampleData() {
  try {
    console.log('샘플 데이터 추가를 시작합니다...');

    // 1. Seats 컬렉션에 데이터 추가
    console.log('좌석(seats) 데이터 추가 중...');
    const seatBatch = db.batch();
    sampleSeats.forEach(seat => {
      // 문서 ID를 필드 값(_id)과 동일하게 설정합니다.
      const docRef = db.collection('seats').doc(seat._id);
      seatBatch.set(docRef, seat);
    });
    await seatBatch.commit();
    console.log(`${sampleSeats.length}개의 좌석 데이터 추가 완료.`);

    // 2. Users 컬렉션에 데이터 추가
    console.log('사용자(users) 데이터 추가 중...');
    // 문서 ID를 필드 값(_id)과 동일하게 설정합니다.
    await db.collection('users').doc(sampleUser._id).set(sampleUser);
    console.log('1개의 사용자 데이터 추가 완료.');

    // 3. Reservations 컬렉션에 데이터 추가 (자동 생성 ID 사용)
    console.log('예약(reservations) 데이터 추가 중...');
    await db.collection('reservations').add(sampleReservation);
    console.log('1개의 예약 데이터 추가 완료.');

    console.log('----------------------------------------');
    console.log('🎉 모든 샘플 데이터가 성공적으로 추가되었습니다!');
    console.log('Firebase 콘솔에서 데이터를 확인해보세요.');
    console.log('----------------------------------------');

  } catch (error) {
    console.error('샘플 데이터 추가 중 오류가 발생했습니다:', error);
  }
}

// 스크립트 실행
addSampleData();
