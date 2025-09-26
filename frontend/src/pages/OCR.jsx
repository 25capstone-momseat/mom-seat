import React, { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, CheckCircle, X, Camera } from 'lucide-react';
import api from '../config/api';
import { clovaPregnancyCertByFile } from '../services/ocrService';
import { AuthContext } from '../contexts/AuthContext';
import styles from '../../styles/modules/OCR.module.css';

export default function OCR() {
  const navigate = useNavigate();
  const { refreshUserProfile } = useContext(AuthContext);

  // 파일/미리보기
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // 처리 상태
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // OCR 결과 & 수정 폼
  const [result, setResult] = useState(null);
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

  const runOCR = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError('');
    setSaved(false);
    try {
      const data = await clovaPregnancyCertByFile(file);
      console.log('[CLOVA OCR 응답]', data);

      const { fields, raw } = data;

      setResult({
        usedUrl: 'Clova OCR Service',
        raw,
        fields,
      });
      setForm(fields);
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

  const handleGoHome = async () => {
    if (saved) {
      await refreshUserProfile();
      navigate('/');
    } else {
      alert('먼저 저장을 완료해주세요.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <FileText className={styles.headerIcon} />
          <h1 className={styles.title}>임신확인서 업로드</h1>
        </div>
        <p className={styles.subtitle}>임신확인서를 촬영하거나 업로드하여 OCR 처리하세요.</p>

        {/* 파일 업로드 섹션 */}
        {!preview && !result && (
          <div className={styles.uploadSection}>
            <button
              onClick={() => inputRef.current?.click()}
              className={styles.fileUploadArea}
            >
              <Camera className={styles.uploadIcon} />
              <p>파일 선택하기</p>
              <span className={styles.selectFileBtn}>이미지 선택</span>
            </button>
            <input 
              ref={inputRef} 
              type="file" 
              accept="image/*" 
              className={styles.hiddenInput} 
              onChange={onPick} 
            />
          </div>
        )}

        {/* 미리보기 섹션 */}
        {preview && !result && (
          <div className={styles.previewSection}>
            <div className={styles.previewContainer}>
              <img src={preview} alt="미리보기" className={styles.previewImage} />
              <button
                onClick={resetAll}
                className={styles.closeButton}
                title="다시 선택"
              >
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.buttonGroup}>
              <button
                onClick={runOCR}
                disabled={!file || isProcessing}
                className={styles.ocrButton}
              >
                {isProcessing ? 'OCR 처리 중...' : 'OCR 처리하기'}
              </button>
              <button onClick={resetAll} className={styles.cancelBtn}>
                다시 선택
              </button>
            </div>
          </div>
        )}

        {/* 처리 중 */}
        {isProcessing && (
          <div className={styles.loading}>
            <div className={styles.loadingIcon}>🔍</div>
            <p>이미지를 분석하고 있습니다...</p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* OCR 결과 섹션 */}
        {result && (
          <div className={styles.resultSection}>
            <div className={styles.ocrResult}>
              <div className={styles.resultHeader}>
                <CheckCircle className={styles.checkIcon} />
                <h3>OCR 처리 완료</h3>
              </div>
              <p className={styles.apiInfo}>사용된 API: {result.usedUrl}</p>

              <table className={styles.infoTable}>
                <tbody>
                  <tr>
                    <td>산모명</td>
                    <td>
                      <input
                        className={styles.tableInput}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="예: 김OO"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>의료기관</td>
                    <td>
                      <input
                        className={styles.tableInput}
                        value={form.hospital}
                        onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                        placeholder="예: ○○산부인과"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>임신 확인일</td>
                    <td>
                      <input
                        className={styles.tableInput}
                        value={form.issueDate}
                        onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                        placeholder="YYYY-MM-DD"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>분만 예정일</td>
                    <td>
                      <input
                        className={styles.tableInput}
                        value={form.dueDate}
                        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                        placeholder="YYYY-MM-DD"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.actionButtons}>
              <button
                onClick={saveCertificate}
                disabled={isProcessing}
                className={styles.saveBtn}
              >
                {saved ? '다시 저장하기' : '저장하기'}
              </button>
              <button
                onClick={handleGoHome}
                className={styles.retryBtn}
              >
                홈으로 이동
              </button>
              <button onClick={resetAll} className={styles.cancelBtn}>
                새 문서 업로드하기
              </button>
            </div>

            {saved && (
              <p className={styles.successMessage}>
                저장되었습니다. 홈 화면에서 확인할 수 있어요.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}