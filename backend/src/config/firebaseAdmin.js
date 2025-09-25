const admin = require('firebase-admin');

function initFirebaseAdmin() {
  if (admin.apps.length) return admin;

  try {
    // GOOGLE_APPLICATION_CREDENTIALS or Workload Identity
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      // storageBucket, databaseURL if you use them
    });
  } catch (e) {
    // Optional: fallback from BASE64 env
    const jsonB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
    if (!jsonB64) throw e;
    const svc = JSON.parse(Buffer.from(jsonB64, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(svc) });
  }
  return admin;
}
module.exports = initFirebaseAdmin();
