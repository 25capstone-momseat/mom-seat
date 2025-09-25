const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const CLOVA_OCR_URL = process.env.CLOVA_OCR_URL;       // e.g. https://…/v1/recognize
const CLOVA_SECRET  = process.env.CLOVA_OCR_SECRET;    // X-OCR-SECRET

async function clovaOcrByFile(localPath) {
  const form = new FormData();
  form.append('message', JSON.stringify({ version: 'V2', requestId: Date.now().toString(), timestamp: Date.now(), images: [{format:'jpg', name:'ocr'}] }));
  form.append('file', fs.createReadStream(localPath));

  const { data } = await axios.post(CLOVA_OCR_URL, form, {
    headers: { ...form.getHeaders(), 'X-OCR-SECRET': CLOVA_SECRET },
    timeout: 30000
  });
  return data;
}

// very light fallback (only if you kept it); otherwise remove.
async function tesseractFallback(localPath) {
  const { createWorker } = require('tesseract.js');
  const worker = await createWorker();
  await worker.loadLanguage('kor+eng');
  await worker.initialize('kor+eng');
  const { data:{ text } } = await worker.recognize(localPath);
  await worker.terminate();
  return { fallback: true, text };
}

// normalize to {name,hospital,issueDate,dueDate,raw}
function extractFieldsFromClova(resp) {
  const raw = JSON.stringify(resp);
  const text = (resp?.images?.[0]?.fields || [])
    .map(f => f?.inferText).filter(Boolean).join(' ');
  // TODO: replace with your regexes/rules
  const name = findByRegex(text, /(성명|이름)\s*[:\s]\s*([가-힣]{2,4})/i, 2);
  const hospital = findByRegex(text, /(병원|의원|산부인과)\s*[:\s]\s*([^\s]+)/i, 2);
  const issueDate = findByRegex(text, /(발급일|발행일|작성일)\s*[:\s]\s*([0-9.\-\/]{8,})/i, 2);
  const dueDate = findByRegex(text, /(출산예정일|예정일)\s*[:\s]\s*([0-9.\-\/]{8,})/i, 2);
  return { raw, text, name, hospital, issueDate, dueDate };
}

function extractFieldsFromText(text) {
  const raw = text;
  const name = findByRegex(text, /(성명|이름)\s*[:\s]\s*([가-힣]{2,4})/i, 2);
  const hospital = findByRegex(text, /(병원|의원|산부인과)\s*[:\s]\s*([^\s]+)/i, 2);
  const issueDate = findByRegex(text, /(발급일|발행일|작성일)\s*[:\s]\s*([0-9.\-\/]{8,})/i, 2);
  const dueDate = findByRegex(text, /(출산예정일|예정일)\s*[:\s]\s*([0-9.\-\/]{8,})/i, 2);
  return { raw, text, name, hospital, issueDate, dueDate };
}

function findByRegex(text, regex, groupIdx) {
  const m = text?.match(regex);
  return m?.[groupIdx]?.replace(/[^\d.\-\/가-힣]/g,'') || '';
}

module.exports = {
  clovaOcrByFile,
  tesseractFallback,
  extractFieldsFromClova,
  extractFieldsFromText
};
