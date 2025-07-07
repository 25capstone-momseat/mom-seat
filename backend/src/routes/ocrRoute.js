// API 라우터
const express = require('express');
const multer = require('multer');
const path = require('path');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const {db} = require('../config/firebase');

const router = express.Router();

// OCR 결과에서 name, hospital, date 추출하는 함수
const extractFields = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 날짜 추출 (정규표현식:YYYY.MM.DD or YYYY-MM-DD)
  const dateRegex = /20[2-5][0-9][.\-\/][01]?[0-9][.\-\/][0-3]?[0-9]/;
  const date = lines.find(line => dateRegex.test(line)) || '';
  const matchedDate = date.match(dateRegex)?.[0] || '';

  // 병원 이름 추정 (줄 중에 '병원' 또는 '의원'이 포함된 경우)
  const hospital = lines.find(line => /병원|의원/.test(line)) || '';

  // 이름 추정 (주로 "임신확인서" 아래 줄 또는 병원, 날짜 줄 제외한 라인)
  const exclude = [hospital, date];
  const name = lines.find(line =>
    !exclude.includes(line) &&
    !/확인서|병원|의원|날짜|년|월|일/.test(line) &&
    line.length >= 2 && line.length <= 10
  ) || '';
  return { name, hospital, date: matchedDate };
};

// (임신확인서) 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')), //저장경로설정
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)) //저장파일명(현재시간+원래파일확장자)
});
const upload = multer({ storage });

// OCR 처리 엔드포인트
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: '이미지를 업로드해주세요.' });

  const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);

  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'kor+eng', {
      logger: m => console.log(m.status, m.progress)
    });
    
    const result = extractFields(text);

    res.json({
      ocrText: text,
      ...result
    });
  } catch (err) {
    console.error('OCR 실패:', err);
    res.status(500).json({ error: 'OCR 처리 실패', details: err.message });
  } finally {
    fs.unlink(imagePath, () => {}); // 업로드된 이미지 삭제
  }
});

router.patch('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name, hospital, date } = req.body;

  if (!name || !hospital || !date) {
    return res.status(400).json({ error: '필수 항목 누락', details: 'name, hospital, date가 모두 필요함' });
  }

  // name, hospital, date 중에서 하나라도 누락되면 400에러 반환
  try {
    const docRef = db.collection('ocr').doc(userId);

    // firebase의 ocr 컬렉션 안에서 userid에 해당하는 문서를 찾음
    await docRef.set({
      userEdited: { name, hospital, date }, // 사용자 수정 내용
      editedAt: new Date() // 수정 시각 저장
    }, { merge: true });

    // 기존 문서를 덮어쓰지 않고 필요한 필드만 병합(merge:ture)
    // userEdited라는 객체 안에 name, hospital, date 저장
    res.json({ message: '사용자 수정 내용 저장 완료' });
  } catch (err) {
    console.error('저장 실패:', err);
    res.status(500).json({ error: '저장 실패', details: err.message });
  }
});

module.exports = router;