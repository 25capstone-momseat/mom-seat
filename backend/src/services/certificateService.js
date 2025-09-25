const admin = require('../config/firebaseAdmin');
const db = admin.firestore();

async function upsertCertificateFromOcr(ocrDoc) {
  const {
    uid, extractedName, hospital, issueDate, dueDate,
    verifiedAt, isEdited
  } = ocrDoc;

  if (!uid) throw new Error('Missing uid on OCR doc');

  const certRef = db.collection('certificates').doc(uid);
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
      displayName: extractedName || admin.firestore.FieldValue.delete(),
      isPregnantVerified: true,
      updatedAt: now
    }, { merge: true });
  });
}

module.exports = { upsertCertificateFromOcr };