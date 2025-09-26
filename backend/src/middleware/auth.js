const { admin } = require('../config/firebase');

const authenticateToken = async (req, res, next) => {
  try {
    /*
    // 개발 환경에서 인증 우회
    if (process.env.SKIP_AUTH === 'true') {
      const testUid = 'test_user_dev';
      console.log('Development mode - using test user ID:', testUid);
      
      try {
        const db = admin.firestore(); // Get db from admin
        const userDoc = await db.collection('users').doc(testUid).get();
        
        let name = '테스트사용자';
        if (userDoc.exists && userDoc.data().name) {
          name = userDoc.data().name;
        }

        req.user = { 
          uid: testUid,
          name: name,
          email: 'test@example.com'
        };

      } catch (e) {
        console.error("Auth middleware: Failed to fetch test user from Firestore", e);
        req.user = { uid: testUid, name: '테스트사용자', email: 'test@example.com' };
      }
      
      console.log('Development mode - using test user data:', req.user);
      return next();
    }
    */
    
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
    
    // Firestore 'users' 컬렉션에서 프로필 정보를 가져와 기준으로 삼음
    const db = admin.firestore();
    const userDocRef = db.collection('users').doc(decoded.uid);
    const userDoc = await userDocRef.get();

    let userName = ''; // 기본값
    if (userDoc.exists) {
      userName = userDoc.data().name || ''; // Firestore에 name이 없을 경우 대비
    }

    // req.user 객체 구성 (Firestore의 name을 유일한 이름 소스로 사용)
    const userInfo = {
      uid: decoded.uid,
      email: decoded.email,
      name: userName, // Firestore에서 가져온 이름 사용
      emailVerified: decoded.email_verified,
    };
    
    // req.user에 필요한 사용자 정보 저장
    req.user = userInfo;
    
    console.log(`[AUTH] Request authenticated for user: ${userInfo.name} (UID: ${userInfo.uid})`);
    
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