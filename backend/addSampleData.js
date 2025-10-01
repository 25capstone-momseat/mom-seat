// backend/addSampleData.js

const { db } = require('./src/config/firebase');

console.log('Firestore DB 인스턴스를 성공적으로 가져왔습니다.');

// 지하철 임산부석 샘플 데이터 (4x2 배치)
// A열: 왼쪽 좌석들, B열: 오른쪽 좌석들
const sampleSeats = [
  // 왼쪽 줄 (A열) - 1, 4번만 임산부석
  { id: 'SEAT_A1', row: 'A', seatNumber: 1, status: 'available', isPregnantSeat: true },
  { id: 'SEAT_A2', row: 'A', seatNumber: 2, status: 'available', isPregnantSeat: false },
  { id: 'SEAT_A3', row: 'A', seatNumber: 3, status: 'available', isPregnantSeat: false },
  { id: 'SEAT_A4', row: 'A', seatNumber: 4, status: 'available', isPregnantSeat: true },
  
  // 오른쪽 줄 (B열) - 1, 4번만 임산부석
  { id: 'SEAT_B1', row: 'B', seatNumber: 1, status: 'available', isPregnantSeat: true },
  { id: 'SEAT_B2', row: 'B', seatNumber: 2, status: 'available', isPregnantSeat: false },
  { id: 'SEAT_B3', row: 'B', seatNumber: 3, status: 'available', isPregnantSeat: false },
  { id: 'SEAT_B4', row: 'B', seatNumber: 4, status: 'available', isPregnantSeat: true },
];

const sampleUser = {
  id: 'SAMPLE_USER_UID_12345',
  email: 'sample.user@example.com',
  name: '김샘플',
  isPregnant: true,
  certificateUrl: null
};

// 데이터를 Firestore에 추가하는 메인 함수
async function addSampleData() {
  try {
    console.log('🚇 지하철 임산부석 샘플 데이터 추가를 시작합니다...');

    // 1. Seats 컬렉션에 데이터 추가
    console.log('좌석(seats) 데이터 추가 중...');
    const seatBatch = db.batch();
    
    sampleSeats.forEach(seat => {
      const docRef = db.collection('seats').doc(seat.id);
      seatBatch.set(docRef, seat, { merge: true });
    });
    
    await seatBatch.commit();
    console.log(`✅ ${sampleSeats.length}개의 좌석 데이터 추가 완료`);
    console.log(`   - 임산부석: ${sampleSeats.filter(s => s.isPregnantSeat).length}개`);
    console.log(`   - 일반석: ${sampleSeats.filter(s => !s.isPregnantSeat).length}개`);

    // 2. Users 컬렉션에 데이터 추가
    console.log('사용자(users) 데이터 추가 중...');
    await db.collection('users').doc(sampleUser.id).set(sampleUser, { merge: true });
    console.log('✅ 1개의 사용자 데이터 추가 완료');

    console.log('----------------------------------------');
    console.log('🎉 모든 샘플 데이터가 성공적으로 추가되었습니다!');
    console.log('💺 좌석 배치:');
    console.log('   A열: [1*] [2] [3] [4*]  (* 임산부석)');
    console.log('   B열: [1*] [2] [3] [4*]  (* 임산부석)');
    console.log('----------------------------------------');

  } catch (error) {
    console.error('❌ 샘플 데이터 추가 중 오류가 발생했습니다:', error);
  }
}

// 스크립트 실행
addSampleData();