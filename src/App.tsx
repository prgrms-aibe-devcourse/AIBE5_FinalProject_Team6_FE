import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { getToken } from './api/auth';
import FanApp from './apps/FanApp';
import AgencyApp from './apps/AgencyApp';
import AdminApp from './apps/AdminApp';
import LoginPage from './apps/LoginPage';
import SignupPage from './apps/SignupPage';
import PasswordResetPage from './apps/PasswordResetPage';
import PartnershipApplication from './apps/PartnershipApplication';
import DevSwitcher from './components/DevSwitcher';

export type Role = 'FAN' | 'ARTIST' | 'ADMIN' | 'AGENCY';
export const ROLE_KEY = 'fd_role';

function RequireAuth({ children }: { children: ReactElement }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return children;
}

function RootRedirect() {
  if (!getToken()) return <Navigate to="/login" replace />;
  const role = localStorage.getItem(ROLE_KEY) as Role | null;
  if (role === 'AGENCY') return <Navigate to="/agency" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'ARTIST') return <Navigate to="/artist" replace />;
  return <Navigate to="/fan" replace />;
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
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/apply" element={<ApplyWrapper />} />
        <Route path="/fan" element={<RequireAuth><FanApp role="FAN" /></RequireAuth>} />
        <Route path="/artist" element={<RequireAuth><FanApp role="ARTIST" /></RequireAuth>} />
        <Route path="/agency" element={<RequireAuth><AgencyApp /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><AdminApp /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}