// frontend/src/pages/OCR.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, FileText, X, CheckCircle } from 'lucide-react';
import api from '../config/api';

export default function OCR() {
  const [selectedFile, setSelectedFile]   = useState(null);
  const [preview, setPreview]             = useState(null);
  const [isProcessing, setIsProcessing]   = useState(false);
  const [result, setResult]               = useState(null); // {success, fields, text, usedPath} | {success:false, error}
  const [captureMode, setCaptureMode]     = useState(false);

  const fileInputRef = useRef(null);
  const videoRef     = useRef(null);
  const canvasRef    = useRef(null);
  const streamRef    = useRef(null);
  const navigate     = useNavigate();

  // ========== 파일/카메라 ==========
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const fr = new FileReader();
    fr.onload = (ev) => setPreview(ev.target.result);
    fr.readAsDataURL(file);
    setCaptureMode(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCaptureMode(true);
      setPreview(null);
      setSelectedFile(null);
    } catch {
      alert('카메라에 접근할 수 없습니다. 브라우저 권한을 확인해주세요.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCaptureMode(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = video.videoWidth  || 1080;
    canvas.height = video.videoHeight || 1440;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'certificate.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreview(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  useEffect(() => () => stopCamera(), []); // 언마운트 시 카메라 정리

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ========== OCR 업로드 & 저장 ==========
  // 서버 라우트와 필드명 차이를 흡수: /ocr/upload 또는 /ocr/parse + (image|file)
  async function uploadToOCR(file) {
    const tries = [
      { path: '/ocr/upload', field: 'image' }, // 권장 조합
      { path: '/ocr/upload', field: 'file'  },
      { path: '/ocr/parse',  field: 'image' },
      { path: '/ocr/parse',  field: 'file'  },
    ];
    for (const t of tries) {
      try {
        const fd = new FormData();
        fd.append(t.field, file);
        const { data } = await api.post(t.path, fd, { timeout: 60000 });
        // 응답 표준화
        const fields = data?.fields || {};
        const normalized = {
          name:      fields.name      ?? data?.name      ?? '',
          hospital:  fields.hospital  ?? data?.hospital  ?? '',
          issueDate: fields.issueDate ?? data?.issueDate ?? data?.date ?? '',
          dueDate:   fields.dueDate   ?? data?.dueDate   ?? '',
          text:      data?.raw        ?? data?.text      ?? data?.ocrText ?? '',
          usedPath:  t.path,
        };
        return { ok: true, ...normalized };
      } catch {
        // 다음 후보 시도
      }
    }
    return { ok: false, error: 'OCR API에 연결할 수 없습니다. 백엔드 라우트(/api/ocr/upload 또는 /api/ocr/parse)를 확인하세요.' };
  }

  async function saveCertificate({ name, hospital, issueDate, dueDate }) {
    await api.post('/certificate', {
      name: name || '',
      hospital: hospital || '',
      issueDate: issueDate || '',
      dueDate: dueDate || '',
    });
  }

  const processOCR = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const r = await uploadToOCR(selectedFile);
      if (!r.ok) throw new Error(r.error || 'OCR 처리 실패');

      // 화면에도 간단 표시
      setResult({
        success: true,
        fields: {
          patientName: r.name || '인식되지 않음',
          hospitalName: r.hospital || '인식되지 않음',
          issueDate: r.issueDate || '인식되지 않음',
          dueDate: r.dueDate || '인식되지 않음',
        },
        text: r.text,
        usedPath: r.usedPath,
      });

      // DB 저장 → 홈으로 이동(홈에서 자동 팝업)
      await saveCertificate({ name: r.name, hospital: r.hospital, issueDate: r.issueDate, dueDate: r.dueDate });
      localStorage.setItem('certJustUpdated', '1');
      navigate('/');
    } catch (e) {
      setResult({ success: false, error: e.message || 'OCR 중 오류가 발생했습니다.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // ========== UI ==========
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border">
        {/* 헤더 */}
        <div className="border-b p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-gray-600" />
            <h1 className="text-lg font-semibold text-gray-900">임신확인서 OCR</h1>
          </div>
          <p className="text-sm text-gray-600">촬영/업로드 후 OCR 처리하면 자동으로 저장되고, 홈에서 바로 확인할 수 있어요.</p>
        </div>

        <div className="p-6">
          {/* 카메라 모드 */}
          {captureMode && (
            <div className="mb-6">
              <div className="relative border rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-gray-900 text-white py-2.5 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  촬영하기
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 업로드 옵션 (카메라 X + 미리보기 X) */}
          {!captureMode && !preview && (
            <div className="space-y-3">
              <button
                onClick={startCamera}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-8 px-6 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <div className="text-sm font-medium text-gray-700">카메라로 촬영하기</div>
              </button>
              <p></p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-8 px-6 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <div className="text-sm font-medium text-gray-700">파일 선택하기</div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <p className="text-xs text-gray-500 text-center mt-4">JPG, PNG (최대 10MB)</p>
            </div>
          )}

          {/* 미리보기 (결과 아직 없음) */}
          {preview && !result && (
            <div>
              <div className="relative border rounded-lg overflow-hidden mb-4">
                <img src={preview} alt="미리보기" className="w-full" />
                <button
                  onClick={removeFile}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-600 rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={processOCR}
                  disabled={isProcessing}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? '처리 중...' : 'OCR 처리하기'}
                </button>
                <button
                  onClick={removeFile}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors"
                >
                  다시 선택하기
                </button>
              </div>
            </div>
          )}

          {/* 처리 중 */}
          {isProcessing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900 mx-auto mb-4" />
              <p className="text-sm text-gray-600">임신확인서를 분석하고 있습니다...</p>
              <p className="text-xs text-gray-500 mt-2">최초 처리 시 시간이 걸릴 수 있습니다</p>
            </div>
          )}

          {/* 결과 (에러 또는 성공 직후 안내) */}
          {result && (
            <div>
              {result.success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-green-800">OCR 처리 완료 — 저장 후 홈으로 이동합니다.</h3>
                  </div>
                  {result.usedPath && (
                    <div className="text-xs text-green-600 mb-2">사용한 엔드포인트: {result.usedPath}</div>
                  )}
                  <div className="space-y-2 text-sm">
                    <Row label="산모이름" value={result.fields.patientName} />
                    <Row label="병원" value={result.fields.hospitalName} />
                    <Row label="발급일자" value={result.fields.issueDate} />
                    <Row label="예정일" value={result.fields.dueDate} />
                  </div>
                  {result.text && (
                    <div className="mt-4 pt-3 border-t border-green-200">
                      <h4 className="text-xs font-medium text-green-700 mb-2">인식된 전체 텍스트</h4>
                      <div className="text-xs text-gray-600 bg-white p-2 rounded border max-h-24 overflow-y-auto whitespace-pre-wrap">
                        {result.text}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <X className="w-5 h-5 text-red-600" />
                    <h3 className="font-medium text-red-800">처리 실패</h3>
                  </div>
                  <p className="text-sm text-red-700 whitespace-pre-wrap">
                    {result.error || 'OCR 중 오류가 발생했습니다.'}
                  </p>
                </div>
              )}

              <button
                onClick={removeFile}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                새 문서 업로드하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value || '-'}</span>
    </div>
  );
}
