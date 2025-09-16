const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // 메모리 저장
const path = require('path');
const sharp = require('sharp');
const auth = require('../middleware/auth');
const Tesseract = require('tesseract.js');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/* ---------------- CLOVA OCR 헬퍼 함수들 ---------------- */
 async function callClovaOCR({ base64, url, lang = 'ko' }) {
   const headers = {
     'X-OCR-SECRET': process.env.NCP_OCR_SECRET,
     'Content-Type': 'application/json'
   };

   const images = [];
   if (base64) {
     images.push({ format: 'jpg', name: 'upload', data: base64 });
   } else if (url) {
     images.push({ format: 'jpg', name: 'remote', url });
   } else {
     throw new Error('이미지(base64 또는 url)가 필요합니다.');
   }

   const requestBody = {
     images,
     requestId: uuidv4(),
     version: 'V2',
     timestamp: Date.now(),
     lang
   };

    const response = await axios.post(process.env.NCP_OCR_INVOKE_URL, requestBody, { headers, timeout: 15000 });
    return response.data;
  }

function clovaPickText(ocrJson) {
  const texts = [];
  (ocrJson?.images || []).forEach(img => {
    if (Array.isArray(img.fields)) {
      img.fields.forEach(f => texts.push(f?.text || f?.inferText || ''));
    }
    if (Array.isArray(img.lines)) {
      img.lines.forEach(line => (line.words || []).forEach(w => texts.push(w?.text || w?.inferText || '')));
    }
    if (Array.isArray(img.words)) {
      img.words.forEach(w => texts.push(w?.text || w?.inferText || ''));
    }
  });
  return texts.filter(Boolean).join('\n').trim();
}

/* ---------------- 전처리: 대비/흑백/사이즈/DPI ---------------- */
async function preprocess(buffer) {
  return sharp(buffer).rotate()
    .rotate()                 // EXIF 기준 자동 회전
    .grayscale()
    .normalize()              // 대비 보정
    .sharpen()
    .resize({ width: 2000, withoutEnlargement: false })
    .threshold(180)
    .toFormat('png')
    .toBuffer();
}

/* ---------------- 날짜 표준화 ---------------- */
function normalizeDate(raw = '') {
  if (!raw) return '';
  const nums = (raw.replace(/[^\d]/g, ' ').match(/\d{1,5}/g) || []).slice(0, 3);
  if (nums.length < 3) return '';
  let [y, m, d] = nums;
  if (y.length > 4) y = y.slice(0, 4);
  return `${`${y}`.padStart(4, '0')}-${`${m}`.padStart(2, '0')}-${`${d}`.padStart(2, '0')}`;
}

/* ---------------- 텍스트에서 필드 추출 ---------------- */
function extractFields(text = '') {
  const joined = text.replace(/\r/g, '').replace(/_/g, ' ').replace(/\s+/g, ' ');
  const pick = (re) => (re.exec(joined)?.[1] || '').trim();

  const name =
    pick(/(?:산모명|성명|이름)\s*[:：]?\s*([가-힣]{2,6})/) || '';

  const issueRaw =
    pick(/(?:임신\s*확인일|임신확인일|발급일자|작성일|작성일자)\s*[:：]?\s*([0-9\s.\-년월일]+)/i);

  const dueRaw =
    pick(/(?:분만\s*예정일|분만예정일|출산예정일|예정일|EDD)\s*[:：]?\s*([0-9\s.\-년월일]+)/i);

  const hospMatches = [...joined.matchAll(/([가-힣A-Za-z·\s]{2,25}(?:여성병원|산부인과|병원|의원|의료원))/g)];
  const hospital =
    hospMatches.sort((a, b) => (b[1]?.length || 0) - (a[1]?.length || 0))[0]?.[1]?.trim() || '';

  return {
    name,
    hospital,
    issueDate: normalizeDate(issueRaw),
    dueDate: normalizeDate(dueRaw),
  };
}

/* ---------------- 기존 Tesseract OCR 업로드 ---------------- */
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

      const pre = await preprocess(up.buffer);

      const { data: ocr } = await Tesseract.recognize(pre, 'kor+eng', {
        langPath: path.join(__dirname),  // kor/eng traineddata 위치: backend/src
        oem: 1,
        psm: 6,
        tessedit_char_whitelist: '가-힣A-Za-z0-9 .-/:()',
        user_defined_dpi: '300',
        preserve_interword_spaces: '1',
        logger: (m) => process.env.NODE_ENV !== 'production' && console.log('[OCR]', m),
      });

      const text = ocr?.text || '';
      const fields = extractFields(text);

      return res.json({
        success: true,
        fields,  // { name, hospital, issueDate, dueDate }
        raw: text,
      });
    } catch (e) {
      console.error('OCR upload error:', e);
      return res.status(500).json({ success: false, error: 'ocr_failed' });
    }
  }
);

/* ---------------- CLOVA: 임신확인서 전용(필드 추출 포함) ---------------- */
router.post(
  '/clova',
  auth,
  upload.fields([{ name: 'file' }, { name: 'image' }]),
  async (req, res) => {
    try {
      // 업로드 파일 or base64 수집
      const up = (req.files?.file && req.files.file[0]) || (req.files?.image && req.files.image[0]);
      let base64 = req.body?.imageBase64 || '';
      if (up?.buffer) base64 = up.buffer.toString('base64');
      if (base64 && base64.includes(',')) base64 = base64.split(',')[1];
      if (!base64 && !req.body?.imageUrl) {
        return res.status(400).json({ success: false, error: 'no_image' });
      }
      
      const ocrJson = await callClovaOCR({
        base64: base64 || undefined,
        url: req.body?.imageUrl || undefined,
        lang: 'ko'
      });
      
      const text = clovaPickText(ocrJson);
      const fields = extractFields(text); // 기존 함수 재사용
      
      return res.json({
        success: true,
        fields,     // { name, hospital, issueDate, dueDate }
        raw: text,  // 합쳐진 전체 텍스트
        clova: ocrJson
      });
    } catch (e) {
      console.error('CLOVA ocr error:', e?.response?.data || e.message);
      return res.status(e?.response?.status || 500).json({ success: false, error: 'clova_failed' });
    }
  }
);

/* ---------------- CLOVA: 일반 문서(풀텍스트만) ---------------- */
router.post(
  '/clova/general',
  auth,
  upload.fields([{ name: 'file' }, { name: 'image' }]),
  async (req, res) => {
    try {
      const up = (req.files?.file && req.files.file[0]) || (req.files?.image && req.files.image[0]);
      let base64 = req.body?.imageBase64 || '';
      
      if (up?.buffer) {
        const processed = await preprocessForClova(up.buffer);
        base64 = processed.toString('base64');
      }
      if (base64 && base64.includes(',')) base64 = base64.split(',')[1];
      if (!base64 && !req.body?.imageUrl) {
        return res.status(400).json({ success: false, error: 'no_image' });
      }
      
      const ocrJson = await callClovaOCR({
        base64: base64 || undefined,
        url: req.body?.imageUrl || undefined,
        lang: 'ko'
      });
      
      const text = clovaPickText(ocrJson);
      
      return res.json({ 
        success: true, 
        fullText: text, 
        clova: ocrJson 
      });
    } catch (e) {
      console.error('CLOVA ocr general error:', e?.response?.data || e.message);
      return res.status(e?.response?.status || 500).json({ success: false, error: 'clova_failed' });
    }
  }
);

/* ---- (선택) 디버그: 텍스트만 보내서 파싱 확인 ---- */
router.post('/parse', auth, express.json(), (req, res) => {
  const text = req.body?.text || '';
  return res.json({ success: true, fields: extractFields(text) });
});

module.exports = router;
