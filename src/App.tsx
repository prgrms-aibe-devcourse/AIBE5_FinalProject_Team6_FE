import { useState, useEffect } from 'react';
import FanApp from './apps/FanApp';
import DevSwitcher from './components/DevSwitcher';
import AgencyApp from './apps/AgencyApp';
import AdminApp from './apps/AdminApp';
import LoginPage from './apps/LoginPage';
import PartnershipApplication from './apps/PartnershipApplication';
import { AgencyApplication, ApplicationStatus } from './types/partnership';

export type Role = 'FAN' | 'ARTIST' | 'ADMIN' | 'AGENCY' | null;

const INITIAL_APPLICATIONS: AgencyApplication[] = [
  {
    id: 'app-1',
    businessRegistrationNumber: '123-45-67890',
    ceoName: '박혁거세',
    companyName: 'StarShip Ent',
    managerName: '김지은',
    businessEmail: 'biz@starship.com',
    contactNumber: '010-1234-5678',
    artistName: '별빛스튜디오',
    artistType: '버추얼 아이돌',
    platforms: ['유튜브', '치지직'],
    services: ['굿즈 판매', '팬미팅 예약'],
    introduction: '2024년 데뷔한 버추얼 아이돌 그룹으로...',
    status: 'PENDING',
    appliedAt: '2025-05-14 20:30',
  },
  {
    id: 'app-2',
    businessRegistrationNumber: '234-56-78901',
    ceoName: '이순신',
    companyName: 'Hybe Labels',
    managerName: '이지수',
    businessEmail: 'agency@hybe.com',
    contactNumber: '010-9876-5432',
    artistName: '문라이트',
    artistType: '중소 아이돌',
    platforms: ['유튜브', '인스타그램'],
    services: ['굿즈 판매', '티켓 판매'],
    introduction: '하이브 레이블의 신인 아이돌 문라이트입니다.',
    status: 'APPROVED',
    appliedAt: '2025-05-12 10:00',
  },
  {
    id: 'app-3',
    businessRegistrationNumber: '345-67-89012',
    ceoName: '홍길동',
    companyName: 'Neo Corp',
    managerName: '박기범',
    businessEmail: 'neo@neocorp.io',
    contactNumber: '010-1111-2222',
    artistName: '네온버즈',
    artistType: '버추얼 아이돌',
    platforms: ['치지직', '틱톡'],
    services: ['커뮤니티 운영'],
    introduction: '새로운 가상 세계의 주인공 네온버즈입니다.',
    status: 'PENDING',
    appliedAt: '2025-05-13 15:45',
  }
];

export default function App() {
  // If role is null, show login screen
  const [role, setRole] = useState<Role>(null);
  const [showApplication, setShowApplication] = useState(false);
  const [agencyApplications, setAgencyApplications] = useState<AgencyApplication[]>(INITIAL_APPLICATIONS);

  // Sandbox mode: backend 미연결 시 FAN 데모 뷰 자동 진입 (테스트/오프라인 환경)
  useEffect(() => {
    fetch('/api/v1/health').catch(() => {
      setRole(prev => prev ?? 'FAN');
    });
  }, []);

  const handleLogout = () => {
    setRole(null);
  };

  const handleApplySubmission = (newApp: AgencyApplication) => {
    setAgencyApplications(prev => [newApp, ...prev]);
    if (newApp.status === 'APPROVED') {
      // Auto-approved case
      setTimeout(() => {
        setRole('AGENCY');
        setShowApplication(false);
      }, 2000); // 1.5s display + margin
    }
  };

  const updateApplicationStatus = (id: string, status: ApplicationStatus, rejectionReason?: string) => {
    setAgencyApplications(prev => prev.map(app => 
      app.id === id ? { ...app, status, rejectionReason } : app
    ));
  };

  if (showApplication) {
    return (
      <>
        {/* We still inject DevSwitcher to keep the user from getting totally stuck */}
        <DevSwitcher currentRole={role || 'FAN'} onRoleChange={setRole} />
        <PartnershipApplication 
          onBack={() => setShowApplication(false)} 
          onSubmit={handleApplySubmission}
        />
      </>
    );
  }

  return (
    <>
      <DevSwitcher currentRole={role || 'FAN'} onRoleChange={(newRole) => {
        setRole(newRole);
        setShowApplication(false);
      }} />
      
      {role === null && <LoginPage onLogin={setRole} onApply={() => setShowApplication(true)} />}
      {role === 'FAN' && <FanApp role={role} onLogout={handleLogout} onApply={() => setShowApplication(true)} />}
      {role === 'ARTIST' && <FanApp role={role} onLogout={handleLogout} onApply={() => setShowApplication(true)} />}
      {role === 'AGENCY' && <AgencyApp onLogout={handleLogout} />}
      {role === 'ADMIN' && <AdminApp 
        onLogout={handleLogout} 
        applications={agencyApplications}
        onUpdateStatus={updateApplicationStatus}
      />}
    </>
  );
}
