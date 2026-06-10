import { useState } from 'react';
import FanApp from './apps/FanApp';
import DevSwitcher from './components/DevSwitcher';
import AgencyApp from './apps/AgencyApp';
import AdminApp from './apps/AdminApp';
import LoginPage from './apps/LoginPage';
import PartnershipApplication from './apps/PartnershipApplication';

export type Role = 'FAN' | 'ARTIST' | 'ADMIN' | 'AGENCY' | null;

const ROLE_KEY = 'fd_role';

export default function App() {
  const [role, setRole] = useState<Role>(() => {
    // 토스 결제 콜백(paymentKey 파라미터) 시 role 복원
    const params = new URLSearchParams(window.location.search);
    if (params.get('paymentKey') || params.get('code')) {
      return (localStorage.getItem(ROLE_KEY) as Role) || null;
    }
    return null;
  });
  const [showApplication, setShowApplication] = useState(false);

  const handleLogin = (r: Role) => {
    setRole(r);
    if (r) localStorage.setItem(ROLE_KEY, r);
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem(ROLE_KEY);
  };

  const handleApplySubmission = () => {
    setShowApplication(false);
  };

  if (showApplication) {
    return (
      <>
        <DevSwitcher currentRole={role || 'FAN'} onRoleChange={handleLogin} />
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
        handleLogin(newRole);
        setShowApplication(false);
      }} />

      {role === null && <LoginPage onLogin={handleLogin} onApply={() => setShowApplication(true)} />}
      {role === 'FAN' && <FanApp role={role} onLogout={handleLogout} onApply={() => setShowApplication(true)} />}
      {role === 'ARTIST' && <FanApp role={role} onLogout={handleLogout} onApply={() => setShowApplication(true)} />}
      {role === 'AGENCY' && <AgencyApp onLogout={handleLogout} />}
      {role === 'ADMIN' && <AdminApp onLogout={handleLogout} />}
    </>
  );
}