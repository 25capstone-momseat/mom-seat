const { admin } = require('../config/firebase');

const authenticateToken = async (req, res, next) => {
  try {
    // 개발 환경에서 인증 우회
    if (process.env.SKIP_AUTH === 'true') {
      req.user = { 
        uid: 'test_user_dev',
        name: '테스트사용자',
        email: 'test@example.com'
      };
      console.log('Development mode - using test user:', req.user);
      return next();
    }
    
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No authorization header or invalid format');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('Token is empty');
      return res.status(401).json({ error: 'Token is empty' });
    }
    
    // Firebase ID 토큰 검증
    const decoded = await admin.auth().verifyIdToken(token);
    
    // 기본적으로 decoded에서 정보 사용
    let userInfo = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      emailVerified: decoded.email_verified,
    };
    
    // Firebase Auth에서 사용자 추가 정보 가져오기 (선택적)
    try {
      const userRecord = await admin.auth().getUser(decoded.uid);
      userInfo = {
        ...userInfo,
        email: userInfo.email || userRecord.email,
        name: userInfo.name || userRecord.displayName || '사용자',
      };
    } catch (userRecordError) {
      console.log('Could not fetch user record, using token data:', userRecordError.message);
      // userRecord를 가져올 수 없어도 decoded 정보로 계속 진행
      userInfo.name = userInfo.name || '사용자';
    }
    
    // req.user에 필요한 사용자 정보 저장
    req.user = userInfo;
    
    console.log('Authentication successful for user:', req.user.uid);
    
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    
    // 더 구체적인 오류 메시지 제공
    let errorMessage = 'Invalid or expired token';
    if (err.code === 'auth/id-token-expired') {
      errorMessage = 'Token has expired';
    } else if (err.code === 'auth/argument-error') {
      errorMessage = 'Invalid token format';
    }
    
    return res.status(403).json({ 
      error: errorMessage,
      code: err.code || 'auth_error' 
    });
  }
};

module.exports = authenticateToken;