// backend/src/controllers/seatController.js
const { broadcast } = require('../utils/websocket');
const admin = require('../config/firebaseAdmin').init?.() || require('../config/firebaseAdmin');

const COLL = process.env.FIREBASE_SEATS_COLLECTION || 'seats';

function normalizeStatus(input) {
  if (typeof input !== 'string') return null;
  const s = input.trim().toLowerCase();
  // allow a few synonyms
  if (['vacant', 'available', 'empty', 'unoccupied', 'idle'].includes(s)) return 'vacant';
  if (['occupied', 'busy', 'taken', 'inuse', 'in_use'].includes(s)) return 'occupied';
  return null;
}

function resolveOccupied({ status, occupied }) {
  if (typeof occupied === 'boolean') return occupied;
  const s = normalizeStatus(status);
  if (!s) return null;
  return s === 'occupied';
}

module.exports = {
  async getAllSeats(req, res) {
    try {
      const db = admin.firestore();
      const seatsSnapshot = await db.collection(COLL).get();
      const seats = seatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json({ success: true, data: seats });
    } catch (err) {
      console.error('[SEAT/GET_ALL][ERROR]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * PATCH /api/seats/:seatId/status
   * Body: { status: "occupied"|"vacant" } OR { occupied: true|false }
   */
  async updateSeatStatus(req, res) {
    try {
      // ---- Basic validation & logging
      const seatIdRaw = req.params.seatId || '';
      const seatHw = decodeURIComponent(seatIdRaw).trim(); // Arduino-sent ID
      const docId = seatHw.toUpperCase();                  // normalized docId
      const ct = req.headers['content-type'] || '';

      console.log('[SEAT/PATCH] raw=%s docId=%s coll=%s ct=%s body=%j',
        seatHw, docId, COLL, ct, req.body);

      if (!req.is('application/json')) {
        return res.status(415).json({
          success: false,
          error: 'Unsupported Media Type. Set Content-Type: application/json'
        });
      }

      const body = req.body || {};
      const resolved = resolveOccupied(body);
      if (resolved === null) {
        return res.status(400).json({
          success: false,
          error: 'Provide {"status":"occupied|vacant"} or {"occupied":true|false}'
        });
      }

      const db = admin.firestore();
      const nowServerTs = admin.firestore.FieldValue.serverTimestamp();
      const now = Date.now();

      // ---- 1) Try by document ID first
      let ref = db.collection(COLL).doc(docId);
      let snap = await ref.get();

      // ---- 2) Fallbacks by fields if docId not found
      if (!snap.exists) {
        const candidates = [
          ['_id', seatHw],
          ['hardwareId', seatHw],
          ['logicalId', seatHw],
        ];

        let found = null;
        for (const [field, value] of candidates) {
          const q = await db.collection(COLL).where(field, '==', value).limit(1).get();
          if (!q.empty) {
            found = q.docs[0];
            break;
          }
        }

        if (!found) {
          return res.status(404).json({
            success: false,
            message: `ID가 ${seatHw}인 좌석을 찾을 수 없습니다. (docId와 _id/hardwareId/logicalId 모두 불일치)`
          });
        }

        ref = found.ref;
        snap = found;
      }

      // ---- 3) Update status fields
      const newStatus = resolved ? 'occupied' : 'vacant';
      await ref.set(
        {
          occupied: resolved,
          status: newStatus,
          raw: typeof body.raw === 'number' ? body.raw : null,
          deviceTs: typeof body.deviceTs === 'number' ? body.deviceTs : now,
          updatedAt: nowServerTs,
        },
        { merge: true }
      );

      // fetch the latest (optional)
      const after = await ref.get();
      const updatedSeat = { id: ref.id, ...after.data() };

      // ---- 4) Broadcast over WebSocket
      broadcast({
        type: 'SEAT_STATUS_UPDATED',
        payload: updatedSeat,
      });

      return res.status(200).json({
        success: true,
        message: `좌석 ${ref.id}의 상태가 ${newStatus}(으)로 업데이트되었습니다.`,
        data: updatedSeat,
      });
    } catch (err) {
      console.error('[SEAT/PATCH][ERROR]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};
