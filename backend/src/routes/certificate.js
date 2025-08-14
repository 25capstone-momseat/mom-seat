const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebase');
const auth = require('../middleware/auth');

// 저장(업서트): OCR 페이지가 인식한 값(또는 수기수정값)을 보냄
router.post('/', auth, async (req, res) => {
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

    const { name = '', hospital = '', issueDate = '', dueDate = '' } = req.body || {};
    
    console.log(`Certificate save - userId: ${userId}, data:`, { name, hospital, issueDate, dueDate });
    
    await db.collection('certificates').doc(userId).set({
      name, 
      hospital, 
      issueDate, 
      dueDate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    res.json({ success: true });
  } catch (e) {
    console.error('certificate save error:', e);
    res.status(500).json({ 
      success: false, 
      error: 'save_failed',
      message: '증명서 저장 중 오류가 발생했습니다.',
      details: e.message 
    });
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
    
    const snap = await db.collection('certificates').doc(userId).get();
    
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
