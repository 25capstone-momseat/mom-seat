const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');

router.get('/me', authenticate, (req, res) => {
  res.json({
    message: '인증 성공!',
    user: req.user,
  });
});

module.exports = router;
