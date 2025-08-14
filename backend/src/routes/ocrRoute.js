const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // 메모리 저장
const auth = require('../middleware/auth');
// 필요한 경우 OCR 라이브러리 import (Tesseract 등)
// const Tesseract = require('tesseract.js');

function normalizeDate(raw = '') {
  if (!raw) return '';
  let s = raw.replace(/\s+/g,'').replace(/[년.]/g,'-').replace(/월/g,'-').replace(/일/g,'');
  s = s.replace(/^-+|-+$/g,'');
  const m = s.match(/(\d{2,4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return '';
  let [_, y, mo, d] = m;
  if (y.length === 2) y = `20${y}`;
  return `${y.padStart(4,'0')}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
}

function extractFields(text = '') {
  const joined = text.replace(/\r/g,'');
  const pick = (arr) => {
    for (const r of arr) {
      const m = joined.match(r);
      if (m?.[2]) return m[2].trim();
    }
    return '';
  };
  const name = pick([/(산모명|성명|이름)\s*[:：]?\s*([가-힣]{2,6})/]);
  const hospital = pick([/(병원명|의료기관명|기관명|병원)\s*[:：]?\s*([^\n]{2,40})/]);
  const issueRaw = pick([/(발급일자|발급일|작성일자|작성일)\s*[:：]?\s*([0-9]{2,4}[.\-/년]\s*[0-9]{1,2}[.\-/월]\s*[0-9]{1,2}[일]?)/i]);
  const dueRaw   = pick([/(예정일|분만예정일|출산예정일|EDD|Due\s*Date)\s*[:：]?\s*([0-9]{2,4}[.\-/년]\s*[0-9]{1,2}[.\-/월]\s*[0-9]{1,2}[일]?)/i]);

  return {
    name,
    hospital,
    issueDate: normalizeDate(issueRaw),
    dueDate:   normalizeDate(dueRaw),
  };
}

// 업로드: 'file' 또는 'image' 어느 키로 와도 처리
router.post(
  '/upload',
  auth,
  upload.fields([{ name: 'file' }, { name: 'image' }]),
  async (req, res) => {
    try {
      const up =
        (req.files?.file && req.files.file[0]) ||
        (req.files?.image && req.files.image[0]);
      if (!up) return res.status(400).json({ success: false, error: 'no_file' });

      const buffer = up.buffer;

      // TODO: 실제 OCR 수행
      // const { data: ocr } = await Tesseract.recognize(buffer, 'kor+eng', { logger:()=>{} });
      // const fields = extractFields(ocr.text || '');

      // 우선 파이프라인 연결만 확인하려면 더미 텍스트로 테스트 가능
      const dummyText = ''; // ocr.text
      const fields = extractFields(dummyText);

      res.json({
        success: true,
        fields,       // { name, hospital, issueDate, dueDate }
        raw: dummyText,
      });
    } catch (e) {
      console.error('OCR upload error:', e);
      res.status(500).json({ success: false, error: 'ocr_failed' });
    }
  }
);

module.exports = router;