import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, CheckSquare, User, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // 사용자 이름 가져오기 (Firebase auth에서 displayName 사용)
  const userName = currentUser?.displayName || '사용자';

  const menuItems = [
    {
      title: '실시간\n좌석 조회',
      icon: MapPin,
      route: '/seat-search',
      description: '지하철 실시간 좌석 확인'
    },
    {
      title: '좌석\n예약 & 취소',
      icon: Search,
      route: '/seat-reservation',
      description: '임산부 좌석 예약/취소'
    },
    {
      title: '좌석 이용 내역',
      icon: CheckSquare,
      route: '/usage-history',
      description: '나의 좌석 이용 기록'
    },
    {
      title: '내 정보 관리',
      icon: User,
      route: '/profile',
      description: '프로필 및 설정'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF7F3' }}>
      <div className="max-w-md mx-auto p-6">
        {/* Logo */}
        <div className="text-center mt-8 mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#C599B6' }}>
            맘편한자리
          </h1>
        </div>

        {/* 임신확인서 업로드 카드 */}
        <div 
          className="bg-white rounded-2xl p-6 mb-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/upload-certificate')}
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
    </div>
  );
};

export default Home;