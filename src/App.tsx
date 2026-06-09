import { useState } from 'react';
import FanApp from './apps/FanApp';
import DevSwitcher from './components/DevSwitcher';
import AgencyApp from './apps/AgencyApp';
import AdminApp from './apps/AdminApp';
import LoginPage from './apps/LoginPage';
import PartnershipApplication from './apps/PartnershipApplication';

export type Role = 'FAN' | 'ARTIST' | 'ADMIN' | 'AGENCY' | null;

export default function App() {
  const [role, setRole] = useState<Role>(null);
  const [showApplication, setShowApplication] = useState(false);

  const handleLogout = () => {
    setRole(null);
  };

  const handleApplySubmission = () => {
    setShowApplication(false);
  };

  if (showApplication) {
    return (
      <>
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
      {role === 'ADMIN' && <AdminApp onLogout={handleLogout} />}
    </>
  );
}