import React, { useState, useRef } from 'react';
import { Camera, Upload, FileText, X, CheckCircle } from 'lucide-react';

const PregnancyOCRUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [captureMode, setCaptureMode] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setCaptureMode(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCaptureMode(true);
      setPreview(null);
      setSelectedFile(null);
    } catch (error) {
      alert('카메라에 접근할 수 없습니다. 브라우저 설정을 확인해주세요.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'captured_image.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreview(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }, 'image/jpeg', 0.8);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCaptureMode(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processOCR = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    try {
      console.log('OCR 처리 시작:', selectedFile.name);
      
      // FormData 객체 생성하여 파일 데이터 준비
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      console.log('API 호출 중...');
      
      // 5000번 포트를 최우선으로 시도
      const possibleUrls = [
        'http://localhost:5000/api/ocr/upload',  // 최우선
        'http://localhost:5000/ocr/upload',
        'http://localhost:5000/upload',
        'http://localhost:3000/api/ocr/upload',
        'http://localhost:3000/ocr/upload', 
        'http://localhost:3000/upload',
        'http://localhost:8000/api/ocr/upload',
        'http://localhost:8000/ocr/upload',
        'http://localhost:8000/upload'
      ];
      
      let response = null;
      let lastError = null;
      let successUrl = null;
      
      // 가능한 URL들을 순서대로 시도
      for (const url of possibleUrls) {
        try {
          console.log(`시도 중: ${url}`);
          
          // 각 요청에 타임아웃 설정
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
          
          response = await fetch(url, {
            method: 'POST',
            body: formData,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            console.log(`✅ 성공한 URL: ${url}, 상태: ${response.status}`);
            successUrl = url;
            break;
          } else {
            console.log(`❌ 실패한 URL: ${url}, 상태: ${response.status}`);
            const errorText = await response.text();
            console.log('응답 내용:', errorText);
          }
        } catch (err) {
          console.log(`🔥 연결 실패: ${url}`, err.message);
          lastError = err;
          continue;
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`모든 API 경로 시도 실패. 백엔드 서버(포트 5000)가 실행 중인지 확인해주세요.\n마지막 오류: ${lastError?.message || 'Unknown error'}`);
      }
      
      const result = await response.json();
      console.log('✅ API 응답 성공:', result);
      console.log('🎯 사용된 URL:', successUrl);
      
      // 백엔드 응답 구조에 맞게 결과 설정
      setResult({
        success: true,
        data: {
          patientName: result.name || '인식되지 않음',
          hospitalName: result.hospital || '인식되지 않음', 
          issueDate: result.date || '인식되지 않음',
          ocrText: result.ocrText || '텍스트 인식 실패',
          pregnancyInfo: result.pregnancyInfo || ''
        },
        usedUrl: successUrl
      });
      
    } catch (error) {
      console.error('❌ OCR 처리 중 오류 발생:', error);
      
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border">
        {/* 헤더 */}
        <div className="border-b p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-gray-600" />
            <h1 className="text-lg font-semibold text-gray-900">임신확인서 업로드</h1>
          </div>
          <p className="text-sm text-gray-600">
            임신확인서를 촬영하거나 업로드하여 OCR 처리하세요
          </p>
        </div>

        <div className="p-6">
          {/* 카메라 모드 */}
          {captureMode && (
            <div className="mb-6">
              <div className="relative border rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
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

          {/* 업로드 옵션 */}
          {!captureMode && !preview && (
            <div className="space-y-3">
              <button
                onClick={startCamera}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-8 px-6 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <div className="text-sm font-medium text-gray-700">카메라로 촬영하기</div>
              </button>

              <div className="text-center text-sm text-gray-500">또는</div>

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

              <p className="text-xs text-gray-500 text-center mt-4">
                JPG, PNG 파일을 지원합니다 (최대 10MB)
              </p>
            </div>
          )}

          {/* 미리보기 */}
          {preview && !result && (
            <div>
              <div className="relative border rounded-lg overflow-hidden mb-4">
                <img
                  src={preview}
                  alt="미리보기"
                  className="w-full"
                />
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

          {/* 처리 중 상태 */}
          {isProcessing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">임신확인서를 분석하고 있습니다...</p>
              <p className="text-xs text-gray-500 mt-2">최초 처리 시 시간이 걸릴 수 있습니다</p>
            </div>
          )}

          {/* 결과 표시 */}
          {result && (
            <div>
              {result.success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-green-800">OCR 처리 완료</h3>
                  </div>
                  
                  {result.usedUrl && (
                    <div className="text-xs text-green-600 mb-3">
                      사용된 API: {result.usedUrl}
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">환자명:</span>
                      <span className="font-medium">{result.data.patientName}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">의료기관:</span>
                      <span className="font-medium">{result.data.hospitalName}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">발급일자:</span>
                      <span className="font-medium">{result.data.issueDate}</span>
                    </div>
                    
                    {result.data.pregnancyInfo && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">임신정보:</span>
                        <span className="font-medium">{result.data.pregnancyInfo}</span>
                      </div>
                    )}
                    
                    {/* OCR 정확도가 낮을 수 있으니 전체 텍스트도 보여주기 */}
                    {result.data.ocrText && (
                      <div className="mt-4 pt-3 border-t border-green-200">
                        <h4 className="text-xs font-medium text-green-700 mb-2">인식된 전체 텍스트:</h4>
                        <div className="text-xs text-gray-600 bg-white p-2 rounded border max-h-20 overflow-y-auto">
                          {result.data.ocrText}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <X className="w-5 h-5 text-red-600" />
                    <h3 className="font-medium text-red-800">처리 실패</h3>
                  </div>
                  <p className="text-sm text-red-700 whitespace-pre-wrap">{result.error}</p>
                </div>
              )}
              
              <button
                onClick={removeFile}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                새 문서 업로드하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PregnancyOCRUpload;