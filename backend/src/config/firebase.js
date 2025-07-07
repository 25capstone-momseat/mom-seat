const admin = require('firebase-admin');
const serviceAccount = require('../config/serviceAccountKey.json');

// Firebase Admin SDK 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'momcomfortseat.appspot.com' // Storage 쓸 경우만 필요
});

const db = admin.firestore(); //firebase 인스턴스

module.exports = {
  admin,
  db, // 이걸 사용해서 Firestore에 접근
};