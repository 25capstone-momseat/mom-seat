const admin = require('../config/firebase');

const authenticateToken = async (req, res, next) => {
  // SKIP_AUTH 활성화 시 우회
  if (process.env.SKIP_AUTH === 'true') {
    req.user = { uid: 'test_user_dev '}; // 임시 테스트 사용자
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // 사용자 정보 저장
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
