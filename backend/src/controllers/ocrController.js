const path = require('path');
const fs = require('fs');
const admin = require('../config/firebaseAdmin');
const db = admin.firestore();
const {
  clovaOcrByFile, tesseractFallback,
  extractFieldsFromClova, extractFieldsFromText
} = require('../services/ocrService');
const { upsertCertificateFromOcr } = require('../services/certificateService');

function logRawToServer(raw) {
  // requirement: keep full text server-side only
  console.log('[OCR RAW]', raw?.slice?.(0, 4000)); // clip if huge
}

exports.submitOcr = async (req, res) => {
  try {
    const uid = req.user.uid;              // from auth middleware
    const localPath = req.file.path;       // multer single('file')

    let parsed;
    try {
      const clova = await clovaOcrByFile(localPath);
      const norm = extractFieldsFromClova(clova);
      parsed = { ...norm, from: 'clova' };
    } catch (e) {
      const fb = await tesseractFallback(localPath);
      const norm = extractFieldsFromText(fb.text || '');
      parsed = { ...norm, from: 'tesseract' };
    } finally {
      fs.unlink(localPath, () => {});
    }

    logRawToServer(parsed.raw);

    const now = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection('ocr').add({
      uid,
      imageUrl: req.body.imageUrl || '',
      raw: parsed.raw,
      extractedName: parsed.name || '',
      hospital: parsed.hospital || '',
      issueDate: parsed.issueDate || '',
      dueDate: parsed.dueDate || '',
      isEdited: false,
      status: 'pending',
      createdAt: now, updatedAt: now
    });

    // return only safe fields to FE
    return res.json({
      ocrid: docRef.id,
      result: {
        extractedName: parsed.name || '',
        hospital: parsed.hospital || '',
        issueDate: parsed.issueDate || '',
        dueDate: parsed.dueDate || ''
      },
      source: parsed.from
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'OCR failed' });
  }
};

exports.editOcr = async (req, res) => {
  try {
    const { ocrid } = req.params;
    const uid = req.user.uid;

    const ref = db.collection('ocr').doc(ocrid);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: 'OCR not found' });
    if (snap.data().uid !== uid) return res.status(403).json({ message: 'Forbidden' });

    const now = admin.firestore.FieldValue.serverTimestamp();
    await ref.set({
      extractedName: req.body.name ?? snap.data().extractedName ?? '',
      hospital: req.body.hospital ?? snap.data().hospital ?? '',
      issueDate: req.body.issueDate ?? snap.data().issueDate ?? '',
      dueDate: req.body.dueDate ?? snap.data().dueDate ?? '',
      isEdited: true,
      updatedAt: now
    }, { merge: true });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'edit failed' });
  }
};

exports.confirmOcr = async (req, res) => {
  try {
    const { ocrid } = req.params;
    const uid = req.user.uid;

    const ref = db.collection('ocr').doc(ocrid);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: 'OCR not found' });
    const data = { id: snap.id, ...snap.data() };
    if (data.uid !== uid) return res.status(403).json({ message: 'Forbidden' });

    // simple sanity checks
    if (!data.extractedName || !data.hospital) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // mark confirmed first (idempotent)
    const now = admin.firestore.FieldValue.serverTimestamp();
    await ref.set({ status: 'confirmed', verifiedAt: now, updatedAt: now }, { merge: true });

    // upsert certificates/{uid} and users/{uid}
    await upsertCertificateFromOcr(data);

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'confirm failed' });
  }
};
