const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// 프록시 설정 - API 요청을 백엔드로 전달
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
}));

// 정적 파일 서빙
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`프론트엔드 서버: http://localhost:${PORT}`);
});
