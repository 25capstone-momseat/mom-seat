const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// 사용자 정보 조회 API
router.get('/profile', authenticateToken, (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        uid: req.user.uid,
        name: req.user.name,
        email: req.user.email,
        emailVerified: req.user.emailVerified
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get user profile' 
    });
  }
});

module.exports = router;