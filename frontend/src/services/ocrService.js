import apiClient from './apiClient';

// CLOVA: 파일 업로드 (multipart) - 임신확인서 전용
export async function clovaPregnancyCertByFile(file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post('/ocr/clova', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

// CLOVA: base64 전송 (JSON) - 임신확인서 전용
export async function clovaPregnancyCertByBase64(base64) {
  const { data } = await apiClient.post('/ocr/clova', { imageBase64: base64 });
  return data;
}

// CLOVA: 일반 문서 (파일)
export async function clovaGeneralByFile(file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post('/ocr/clova/general', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

// 기존 Tesseract OCR (파일)
export async function tesseractOcrByFile(file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post('/ocr/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

// 텍스트 파싱 테스트
export async function parseTextOnly(text) {
  const { data } = await apiClient.post('/ocr/parse', { text });
  return data;
}