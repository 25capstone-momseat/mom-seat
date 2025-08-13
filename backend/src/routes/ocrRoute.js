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


// // OCR 정확도 개선된 ocrRoute.js
// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const Tesseract = require('tesseract.js');
// const sharp = require('sharp'); // npm install sharp 필요
// const fs = require('fs');
// const {db} = require('../config/firebase');

// const router = express.Router();

// // 이미지 전처리 함수
// const preprocessImage = async (inputPath, outputPath) => {
//   try {
//     await sharp(inputPath)
//       .greyscale() // 그레이스케일 변환
//       .normalize() // 명암 정규화
//       .sharpen() // 선명도 증가
//       .resize({ width: 1200, height: 1600, fit: 'inside' }) // 크기 조정
//       .jpeg({ quality: 95 }) // 고품질 JPEG 저장
//       .toFile(outputPath);
    
//     return outputPath;
//   } catch (error) {
//     console.log('이미지 전처리 실패, 원본 사용:', error.message);
//     return inputPath;
//   }
// };

// // OCR 결과에서 name, hospital, date 추출하는 함수 (개선된 버전)
// const extractFields = (text) => {
//   const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
//   console.log('OCR 인식된 라인들:', lines);

//   // 날짜 추출 (다양한 형식 지원)
//   const dateRegex = /20[0-9]{2}[.\-\/\s년]{1,2}[01]?[0-9][.\-\/\s월]{1,2}[0-3]?[0-9][\s일]?/g;
//   let date = '';
//   for (const line of lines) {
//     const match = line.match(dateRegex);
//     if (match) {
//       date = match[0].replace(/[년월일\s]/g, '.').replace(/[.\-\/]{2,}/g, '.');
//       break;
//     }
//   }

//   // 병원 이름 추출 (개선된 패턴)
//   const hospitalPattern = /(.*)(병원|의원|클리닉|센터|산부인과)/;
//   let hospital = '';
//   for (const line of lines) {
//     const match = line.match(hospitalPattern);
//     if (match) {
//       hospital = match[0];
//       break;
//     }
//   }

//   // 이름 추출 (한글 이름 패턴)
//   const namePattern = /^[가-힣]{2,4}$/;
//   let name = '';
//   for (const line of lines) {
//     // 병원명, 날짜, 기타 키워드가 포함되지 않은 한글 이름 찾기
//     if (namePattern.test(line) && 
//         !hospital.includes(line) && 
//         !date.includes(line) &&
//         !/확인서|임신|진료|검사|결과|소견|의사|환자/.test(line)) {
//       name = line;
//       break;
//     }
//   }

//   // 임신 관련 정보 추출
//   const pregnancyInfo = lines.find(line => 
//     /임신|주수|개월|gestational|pregnancy/i.test(line)
//   ) || '';

//   return { name, hospital, date, pregnancyInfo, fullText: text };
// };

// // 파일 업로드 설정
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, '..', 'uploads');
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
// });

// const upload = multer({ 
//   storage,
//   fileFilter: (req, file, cb) => {
//     // 이미지 파일만 허용
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('이미지 파일만 업로드 가능합니다.'));
//     }
//   },
//   limits: { fileSize: 10 * 1024 * 1024 } // 10MB 제한
// });

// // OCR 처리 엔드포인트 (개선된 버전)
// router.post('/upload', upload.single('image'), async (req, res) => {
//   if (!req.file) {
//     return recds.status(400).json({ error: '이미지를 업로드해주세요.' });
//   }

//   const originalPath = req.file.path;
//   const processedPath = originalPath.replace(/(\.[^.]+)$/, '_processed$1');

//   try {
//     console.log('이미지 전처리 시작...');
//     const imagePath = await preprocessImage(originalPath, processedPath);

//     console.log('OCR 처리 시작...');
//     const { data: { text } } = await Tesseract.recognize(imagePath, 'kor+eng', {
//       logger: m => console.log(`${m.status}: ${Math.round(m.progress * 100)}%`),
//       tessedit_pageseg_mode: '1', // 자동 페이지 분할
//       tessedit_ocr_engine_mode: '1', // LSTM OCR 엔진 사용
//       preserve_interword_spaces: '1',
//       tessedit_char_whitelist: '0123456789가-힣ㄱ-ㅎㅏ-ㅣABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,/():- 년월일',
//     });
    
//     console.log('OCR 인식 완료, 텍스트 길이:', text.length);
    
//     const result = extractFields(text);
    
//     res.json({
//       success: true,
//       ocrText: text,
//       name: result.name,
//       hospital: result.hospital,
//       date: result.date,
//       pregnancyInfo: result.pregnancyInfo
//     });

//   } catch (err) {
//     console.error('OCR 실패:', err);
//     res.status(500).json({ 
//       success: false,
//       error: 'OCR 처리 실패', 
//       details: err.message 
//     });
//   } finally {
//     // 업로드된 이미지들 정리
//     [originalPath, processedPath].forEach(path => {
//       fs.unlink(path, (err) => {
//         if (err && err.code !== 'ENOENT') {
//           console.log('파일 삭제 실패:', err);
//         }
//       });
//     });
//   }
// });

// // 나머지 PATCH 엔드포인트는 그대로...
// router.patch('/:userId', async (req, res) => {
//   const { userId } = req.params;
//   const { name, hospital, date } = req.body;

//   if (!name || !hospital || !date) {
//     return res.status(400).json({ error: '필수 항목 누락', details: 'name, hospital, date가 모두 필요함' });
//   }

//   try {
//     const docRef = db.collection('ocr').doc(userId);
//     await docRef.set({
//       userEdited: { name, hospital, date },
//       editedAt: new Date()
//     }, { merge: true });

//     res.json({ message: '사용자 수정 내용 저장 완료' });
//   } catch (err) {
//     console.error('저장 실패:', err);
//     res.status(500).json({ error: '저장 실패', details: err.message });
//   }
// });

// module.exports = router;