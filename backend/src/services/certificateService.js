const admin = require('../config/firebaseAdmin');
const db = admin.firestore();

async function upsertCertificateFromOcr(ocrDoc) {
  const {
    uid, extractedName, hospital, issueDate, dueDate,
    verifiedAt, isEdited
  } = ocrDoc;

  if (!uid) throw new Error('Missing uid on OCR doc');

  const certRef = db.collection('pregnantCertificates').doc(uid);
  const userRef = db.collection('users').doc(uid);
  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.runTransaction(async (tx) => {
    const certSnap = await tx.get(certRef);
    const payload = {
      uid,
      name: extractedName || '',
      hospital: hospital || '',
      issueDate: issueDate || '',
      dueDate: dueDate || '',
      verifiedAt: verifiedAt || now,
      updatedAt: now,
      ocrid: ocrDoc.id
    };
    if (!certSnap.exists) payload.createdAt = now;

    tx.set(certRef, payload, { merge: true });

    // also reflect to users profile
    tx.set(userRef, {
      name: extractedName || '',
      isPregnantVerified: true,
      updatedAt: now
    }, { merge: true });
  });

  // Sync with Firebase Auth displayName as well
  if (extractedName) {
    try {
      await admin.auth().updateUser(uid, { displayName: extractedName });
    } catch (error) {
      console.error('Error updating Firebase Auth user display name:', error);
      // This is non-fatal to the core operation, so just log it.
    }
  }
}

module.exports = { upsertCertificateFromOcr };