const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebase');
const auth = require('../middleware/auth');

// 저장(업서트): OCR 페이지가 인식한 값(또는 수기수정값)을 보냄
router.post('/', auth, async (req, res) => {
  const userId = req.user?.uid;
  if (!userId) {
    return res.status(400).json({ success: false, message: '사용자 ID가 없습니다.' });
  }

  const { name = '', hospital = '', issueDate = '', dueDate = '' } = req.body || {};
  
  const certRef = db.collection('pregnantCertificates').doc(userId);
  const userRef = db.collection('users').doc(userId);
  const now = admin.firestore.FieldValue.serverTimestamp();

  try {
    // Use a transaction to update both collections atomically
    await db.runTransaction(async (tx) => {
      const certSnap = await tx.get(certRef);
      const payload = {
        uid: userId,
        name,
        hospital,
        issueDate,
        dueDate,
        updatedAt: now,
      };
      if (!certSnap.exists) {
        payload.createdAt = now;
      }
      
      tx.set(certRef, payload, { merge: true });
      tx.set(userRef, {
        name: name,
        isPregnantVerified: true,
        updatedAt: now
      }, { merge: true });
    });

    // Sync with Firebase Auth displayName (outside transaction)
    // Skip for test user to prevent errors in dev
    if (name && userId !== 'test_user_dev') {
      try {
        await admin.auth().updateUser(userId, { displayName: name });
      } catch (authError) {
        console.error('Failed to update Firebase Auth displayName:', authError);
      }
    }

    res.json({ success: true });

  } catch (e) {
    console.error('Certificate save transaction error:', e);
    res.status(500).json({ success: false, message: '증명서 저장 중 오류가 발생했습니다.' });
  }
});

// 조회: "내 임신확인서 보기" 페이지에서 사용
router.get('/me', auth, async (req, res) => {
  try {
    // req.user.uid 사용 (auth 미들웨어에서 설정)
    const userId = req.user?.uid;
    
    // 사용자 ID 검증
    if (!userId) {
      console.log('Missing user ID in request:', req.user);
      return res.status(400).json({ 
        success: false, 
        error: 'user_id_missing',
        message: '사용자 ID가 없습니다.' 
      });
    }

    console.log(`Certificate read - userId: ${userId}`);
    
    const snap = await db.collection('pregnantCertificates').doc(userId).get();
    
    res.json({ 
      success: true, 
      certificate: snap.exists ? snap.data() : null 
    });
  } catch (e) {
    console.error('certificate read error:', e);
    res.status(500).json({ 
      success: false, 
      error: 'read_failed',
      message: '증명서 조회 중 오류가 발생했습니다.',
      details: e.message 
    });
  }
});

module.exports = router;
