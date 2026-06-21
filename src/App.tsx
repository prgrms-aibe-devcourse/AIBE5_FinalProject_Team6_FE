import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { getToken, getAppRole, getRoleHomePath, ROLE_KEY } from './api/auth';
import type { AppRole } from './api/auth';
import FanApp from './apps/FanApp';
import AgencyApp from './apps/AgencyApp';
import AdminApp from './apps/AdminApp';
import LoginPage from './apps/LoginPage';
import SignupPage from './apps/SignupPage';
import PasswordResetPage from './apps/PasswordResetPage';
import OAuthCallbackPage from './apps/OAuthCallbackPage';
import PartnershipApplication from './apps/PartnershipApplication';
import DevSwitcher from './components/DevSwitcher';

export type Role = AppRole;
export { ROLE_KEY };

function RequireRole({ allowed, children }: { allowed: Role[]; children: ReactElement }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  const role = getAppRole();
  if (!role || !allowed.includes(role)) {
    return <Navigate to={role ? getRoleHomePath(role) : '/login'} replace />;
  }
  return children;
}

function RootRedirect() {
  if (!getToken()) return <Navigate to="/login" replace />;
  const role = getAppRole();
  return <Navigate to={role ? getRoleHomePath(role) : '/login'} replace />;
}

function ApplyWrapper() {
  const navigate = useNavigate();
  return (
    <PartnershipApplication
      onBack={() => navigate(-1)}
      onSubmit={() => navigate(-1)}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {import.meta.env.DEV && <DevSwitcher />}
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/apply" element={<ApplyWrapper />} />
        <Route path="/fan" element={<RequireRole allowed={['FAN']}><FanApp role="FAN" /></RequireRole>} />
        <Route path="/artist" element={<RequireRole allowed={['ARTIST']}><FanApp role="ARTIST" /></RequireRole>} />
        <Route path="/agency" element={<RequireRole allowed={['AGENCY']}><AgencyApp /></RequireRole>} />
        <Route path="/admin" element={<RequireRole allowed={['ADMIN']}><AdminApp /></RequireRole>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}