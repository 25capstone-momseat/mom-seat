//ocrAPI
const express = require("express");
const cors = require('cors');
const ocrRouter = require('./routes/ocrRoute'); // OCR 라우터 가져오기

const app = express();
app.use(cors());
app.use(express.json());

// OCR 라우터 연결 (이걸 통해 이미지 업로드 처리 가능)
app.use('/ocr', ocrRouter);

// 테스트용 기본 경로
app.get("/", function (req, res) {
  res.send("서버 실행 중");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
