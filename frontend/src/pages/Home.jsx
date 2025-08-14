// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, CheckSquare, User, FileText, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

export default function Home() {
  const navigate = useNavigate();
  const { user, name, loading } = useAuth();

  const userName =
    (typeof name === 'string' && name.trim()) ||
    (user?.displayName && user.displayName.trim()) ||
    '사용자';

  const [certOpen, setCertOpen] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState('');
  const [cert, setCert] = useState(null); // {name, hospital, issueDate, dueDate}

  async function openCertificate() {
    setCertOpen(true);
    setCertLoading(true);
    setCertError('');
    setCert(null);
    try {
      const { data } = await api.get('/certificate/me');
      setCert(data?.certificate || null);
      if (!data?.certificate) {
        setCertError('저장된 임신확인서가 없습니다. OCR에서 먼저 업로드/인식해주세요.');
      }
    } catch (e) {
      setCertError('인증서 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setCertLoading(false);
    }
  }

  // OCR에서 막 저장하고 돌아왔으면 자동으로 열기
  useEffect(() => {
    if (localStorage.getItem('certJustUpdated') === '1') {
      localStorage.removeItem('certJustUpdated');
      openCertificate();
    }
  }, []);

  const menuItems = [
    { title: '실시간\n좌석 조회', icon: MapPin, route: '/seat-search' },
    { title: '좌석\n예약 & 취소', icon: Search, route: '/reservation' },
    { title: '좌석 이용 내역', icon: CheckSquare, route: '/reservation-history' },
    { title: '내 정보 관리', icon: User, route: '/profile' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFF7F3' }}>
        <div className="max-w-md mx-auto p-6">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF7F3' }}>
      <div className="max-w-md mx-auto p-6">
        {/* Logo */}
        <div className="text-center mt-8 mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#C599B6' }}>
            맘편한자리
          </h1>
        </div>

        {/* 임신확인서 보기 카드 */}
        <div
          className="bg-white rounded-2xl p-6 mb-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={openCertificate} // 👈 클릭 시 모달 열고 /certificate/me 조회
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileText size={32} style={{ color: '#7D6073' }} />
              <span className="text-lg font-medium">내 임신확인서 보기</span>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
          </div>
        </div>

        {/* 인사말 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">안녕하세요, {userName} 님!</h2>
          <p className="text-gray-600 flex items-center">
            임산부 인증 완료 <span className="ml-2 text-green-500">✓</span>
          </p>
        </div>

        {/* 메뉴 그리드 */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.route)}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center space-y-4">
                <item.icon
                  size={40}
                  style={{ color: index % 2 === 0 ? '#C599B6' : '#7D6073' }}
                />
                <div className="text-center">
                  <h3 className="font-bold text-lg whitespace-pre-line leading-tight">
                    {item.title}
                  </h3>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 인증서 모달 */}
      {certOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">내 임신확인서</h3>
              <button onClick={() => setCertOpen(false)} className="p-1">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {certLoading ? (
              <div className="py-8 text-center text-sm text-gray-600">불러오는 중…</div>
            ) : certError ? (
              <div className="py-4 text-sm text-red-600">{certError}</div>
            ) : (
              <div className="space-y-2 text-sm">
                <Row label="산모이름" value={cert?.name} />
                <Row label="병원" value={cert?.hospital} />
                <Row label="발급일자" value={cert?.issueDate} />
                <Row label="예정일" value={cert?.dueDate} />
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => navigate('/ocr')}
                className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                재업로드/OCR 다시하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value || '-'}</span>
    </div>
  );
}
