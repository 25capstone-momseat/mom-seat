const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Add this only if you actually use Storage; otherwise you can remove it.
    storageBucket: 'momcomfortseat.appspot.com',
  });
}

// Reuse these singletons everywhere
const db = admin.firestore();
// const bucket = admin.storage().bucket(); // uncomment if you need Storage

module.exports = {
  admin,
  db,
  // bucket,
};
