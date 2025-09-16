import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, CheckCircle, X } from 'lucide-react';
import api from '../config/api';
import { clovaPregnancyCertByFile } from '../services/ocrService';

export default function OCR() {
  const navigate = useNavigate();

  // 파일/미리보기
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // 처리 상태
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // OCR 결과 & 수정 폼
  const [result, setResult] = useState(null); // { usedUrl, raw, fields:{name,hospital,issueDate,dueDate} }
  const [form, setForm] = useState({ name: '', hospital: '', issueDate: '', dueDate: '' });
  const [saved, setSaved] = useState(false);

  const inputRef = useRef(null);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setSaved(false);
    setError('');
    const r = new FileReader();
    r.onload = () => setPreview(r.result);
    r.readAsDataURL(f);
  };

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setForm({ name: '', hospital: '', issueDate: '', dueDate: '' });
    setSaved(false);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  /** ---- 보정 유틸: OCR가 20254 같은 걸 내놔도 2025로 정리 ---- */
  const normalizeDate = (raw = '') => {
    if (!raw) return '';
    const nums = (raw.replace(/[^\d]/g, ' ').match(/\d{1,5}/g) || []).slice(0, 3);
    if (nums.length < 3) return '';
    let [y, m, d] = nums;
    if (y.length > 4) y = y.slice(0, 4);
    return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };

  /** ---- raw 텍스트에서 자동 추출(이름/병원/임신확인일/분만예정일) ---- */
  const extractFromRaw = (raw = '') => {
    const t = raw.replace(/\r/g, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    const pick = (re) => (re.exec(t)?.[1] || '').trim();

    const name =
      pick(/(?:산모명|성명|이름)\s*[:：]?\s*([가-힣]{2,6})/) || '';

    const issueRaw =
      pick(/(?:임신\s*확인일|임신확인일|발급일자|작성일|작성일자)\s*[:：]?\s*([0-9\s.\-년월일]+)/i);

    const dueRaw =
      pick(/(?:분만\s*예정일|분만예정일|출산예정일|예정일|EDD)\s*[:：]?\s*([0-9\s.\-년월일]+)/i);

    const hospMatches = [...t.matchAll(/([가-힣A-Za-z·\s]{2,25}(?:여성병원|산부인과|병원|의원|의료원))/g)];
    const hospital =
      hospMatches.sort((a, b) => (b[1]?.length || 0) - (a[1]?.length || 0))[0]?.[1]?.trim() || '';

    return {
      name,
      hospital,
      issueDate: normalizeDate(issueRaw),
      dueDate: normalizeDate(dueRaw),
    };
  };

  /** ---- OCR 실행 ---- */
  const runOCR = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError('');
    setSaved(false);
    try {
      // 기존 apiUpload 대신 clovaPregnancyCertByFile 함수 사용
      const data = await clovaPregnancyCertByFile(file);
      console.log('[CLOVA OCR 응답]', data);

      // 클로바 서비스에서 이미 정리된 fields와 raw 텍스트를 받음
      const { fields, raw } = data;

      // 결과를 상태에 설정 (usedUrl은 클로바 서비스에서 제공하지 않으므로, 더미 값을 사용하거나 제거 가능)
      setResult({
        usedUrl: 'Clova OCR Service',
        raw,
        fields,
      });
      setForm(fields); // 입력칸 자동 채움
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'OCR 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveCertificate = async () => {
    setError('');
    try {
      await api.post('/certificate', {
        name: form.name?.trim(),
        hospital: form.hospital?.trim(),
        issueDate: form.issueDate?.trim(),
        dueDate: form.dueDate?.trim(),
      });
      setSaved(true);
      localStorage.setItem('certJustUpdated', '1');
    } catch (e) {
      setError(e.userMessage || e.message || '저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-rose-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-gray-700" />
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#7D6073' }}>
            임신확인서 업로드
          </h1>
        </div>
        <p className="text-sm text-gray-700 mb-5">임신확인서를 촬영하거나 업로드하여 OCR 처리하세요.</p>

        {!preview && !result && (
          <div className="space-y-3">
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-10 hover:border-gray-400 hover:bg-white transition-colors flex flex-col items-center"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-700">파일 선택하기</span>
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
          </div>
        )}

        {preview && !result && (
          <div className="space-y-4">
            <div className="relative border rounded-xl overflow-hidden">
              <img src={preview} alt="미리보기" className="w-full" />
              <button
                onClick={resetAll}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                title="다시 선택"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={runOCR}
                disabled={!file || isProcessing}
                className="flex-1 rounded-xl py-3 text-white disabled:opacity-50"
                style={{ background: '#E9A7B9' }}
              >
                {isProcessing ? '처리 중...' : 'OCR 처리하기'}
              </button>
              <button onClick={resetAll} className="px-4 rounded-xl border">
                다시 선택
              </button>
            </div>
          </div>
        )}

        {isProcessing && <div className="mt-8 text-sm text-gray-600">이미지를 분석하고 있습니다…</div>}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-5">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold">OCR 처리 완료</h2>
            </div>

            <div className="text-xs text-gray-500">사용된 API: {result.usedUrl}</div>

            <div className="rounded-xl border bg-white p-4 space-y-3">
              <div>
                <label className="text-sm text-gray-600">산모명</label>
                <input
                  className="mt-1 w-full rounded-lg border p-2"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="예: 김OO"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">의료기관</label>
                <input
                  className="mt-1 w-full rounded-lg border p-2"
                  value={form.hospital}
                  onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                  placeholder="예: ㅇㅇ산부인과"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">임신 확인일</label>
                  <input
                    className="mt-1 w-full rounded-lg border p-2"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">분만 예정일</label>
                  <input
                    className="mt-1 w-full rounded-lg border p-2"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </div>
            </div>

            {!!result.raw && (
              <div className="rounded-xl border bg-white p-4">
                <h3 className="font-semibold mb-2">인식된 전체 텍스트:</h3>
                <div className="text-xs text-gray-700 whitespace-pre-wrap max-h-48 overflow-auto">
                  {result.raw}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveCertificate}
                disabled={isProcessing}
                className="rounded-xl px-4 py-3 text-white disabled:opacity-50"
                style={{ background: '#E9A7B9' }}
              >
                {saved ? '다시 저장하기' : '저장하기'}
              </button>

              <button
                onClick={() => (saved ? navigate('/') : alert('먼저 저장을 완료해주세요.'))}
                className="rounded-xl px-4 py-3 border"
              >
                홈으로 이동
              </button>

              <button onClick={resetAll} className="rounded-xl px-4 py-3 border">
                새 문서 업로드하기
              </button>
            </div>

            {saved && <p className="text-sm text-green-600">저장되었습니다. 홈 화면에서 확인할 수 있어요.</p>}
          </div>
        )}
      </div>
    </div>
  );
}