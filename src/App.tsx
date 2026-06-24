import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { getToken, getAppRole, getRoleHomePath, ROLE_KEY } from './api/auth';
import type { AppRole } from './api/auth';
import FanApp from './apps/FanApp';
import AgencyApp from './apps/AgencyApp';
import AdminApp from './apps/AdminApp';
import AdminLoginPage from './apps/AdminLoginPage';
import PasswordResetPage from './apps/PasswordResetPage';
import OAuthCallbackPage from './apps/OAuthCallbackPage';
import PartnershipApplication from './apps/PartnershipApplication';
import TermsPage from './apps/TermsPage';
import PrivacyPage from './apps/PrivacyPage';

export type Role = AppRole;
export { ROLE_KEY };

function RequireRole({ allowed, children }: { allowed: Role[]; children: ReactElement }) {
  if (!getToken()) {
    const loginPath = allowed.length === 1 && allowed[0] === 'ADMIN' ? '/admin/login' : '/fan';
    return <Navigate to={loginPath} replace />;
  }
  const role = getAppRole();
  if (!role || !allowed.includes(role)) {
    return <Navigate to={role ? getRoleHomePath(role) : '/fan'} replace />;
  }
  return children;
}

function RootRedirect() {
  if (!getToken()) return <Navigate to="/fan" replace />;
  const role = getAppRole();
  return <Navigate to={role ? getRoleHomePath(role) : '/fan'} replace />;
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
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Navigate to="/fan" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/signup" element={<Navigate to="/fan" replace />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/apply" element={<ApplyWrapper />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/fan" element={<FanApp role="FAN" />} />
        <Route path="/artist" element={<RequireRole allowed={['ARTIST']}><FanApp role="ARTIST" /></RequireRole>} />
        <Route path="/agency" element={<RequireRole allowed={['AGENCY']}><AgencyApp /></RequireRole>} />
        <Route path="/admin" element={<RequireRole allowed={['ADMIN']}><AdminApp /></RequireRole>} />
        <Route path="*" element={<Navigate to="/fan" replace />} />
      </Routes>
    </BrowserRouter>
  );
}