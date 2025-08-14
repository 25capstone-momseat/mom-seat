const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebase');
const auth = require('../middleware/auth');

// 프로필 생성/업데이트
router.post('/', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const uid = req.user.uid; // 개선된 미들웨어 사용
    
    // 기존 사용자 데이터 확인 (createdAt 보존용)
    const existingDoc = await db.collection('users').doc(uid).get();
    
    const updateData = {
      name: name ?? '',
      email: email ?? '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    // 새 사용자인 경우에만 createdAt 추가
    if (!existingDoc.exists) {
      updateData.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }
    
    await db.collection('users').doc(uid).set(updateData, { merge: true });
    
    res.json({ 
      success: true,
      message: '프로필이 성공적으로 저장되었습니다.'
    });
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ 
      success: false,
      error: 'profile_save_failed',
      message: '프로필 저장에 실패했습니다.'
    });
  }
});

// 프로필 조회 (Firestore 기반 - 상세 정보)
router.get('/me', auth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const snap = await db.collection('users').doc(uid).get();
    
    if (snap.exists) {
      const firestoreData = snap.data();
      
      // Firestore 데이터와 Firebase Auth 데이터 병합
      const profileData = {
        uid: uid,
        name: firestoreData.name || req.user.name || '사용자',
        email: firestoreData.email || req.user.email || '',
        emailVerified: req.user.emailVerified || false,
        createdAt: firestoreData.createdAt,
        updatedAt: firestoreData.updatedAt,
        // 추가 Firestore 필드들...
      };
      
      res.json({
        success: true,
        user: profileData,
        message: `안녕하세요, ${profileData.name}님!`
      });
    } else {
      // Firestore에 프로필이 없는 경우 Firebase Auth 정보만 반환
      res.json({
        success: true,
        user: {
          uid: req.user.uid,
          name: req.user.name || '사용자',
          email: req.user.email || '',
          emailVerified: req.user.emailVerified || false,
          createdAt: null,
          updatedAt: null
        },
        message: `안녕하세요, ${req.user.name || '사용자'}님! 프로필을 설정해주세요.`
      });
    }
  } catch (error) {
    console.error('Profile read error:', error);
    res.status(500).json({ 
      success: false,
      error: 'profile_read_failed',
      message: '프로필 조회에 실패했습니다.'
    });
  }
});

// 간단한 인증 상태 확인 (Firebase Auth 기반 - 빠른 응답)
router.get('/auth-status', auth, (req, res) => {
  res.json({
    success: true,
    message: '인증 성공!',
    user: {
      uid: req.user.uid,
      name: req.user.name,
      email: req.user.email,
      emailVerified: req.user.emailVerified
    }
  });
});

// 프로필 삭제 (선택사항)
router.delete('/me', auth, async (req, res) => {
  try {
    const uid = req.user.uid;
    await db.collection('users').doc(uid).delete();
    
    res.json({
      success: true,
      message: '프로필이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Profile delete error:', error);
    res.status(500).json({
      success: false,
      error: 'profile_delete_failed',
      message: '프로필 삭제에 실패했습니다.'
    });
  }
});

module.exports = router;