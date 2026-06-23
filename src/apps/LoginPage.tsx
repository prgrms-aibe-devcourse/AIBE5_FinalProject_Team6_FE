import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setToken, syncAppRole, getRoleHomePath } from '../api/auth';

const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI ?? 'http://localhost:5173/oauth/callback';
const PROVIDER_KEY = 'oauth_provider';

function redirectToKakao() {
  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
  sessionStorage.setItem(PROVIDER_KEY, 'KAKAO');
  window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
}

function redirectToGoogle() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  sessionStorage.setItem(PROVIDER_KEY, 'GOOGLE');
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=email%20profile`;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await login(identifier, password);
      setToken(token);
      const role = syncAppRole(token.accessToken);
      navigate(getRoleHomePath(role), { replace: true });
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EE] flex flex-col font-sans">
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C2507A] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7F77DD] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

        <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#EDE8E2] relative z-10 mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-[2px] font-mono mb-2">FANDROPS</h1>
            <p className="text-[#888]">당신의 최애와 더 가까이</p>
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3 mb-3">
            <button
              onClick={redirectToKakao}
              className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#191919] font-bold py-4 rounded-2xl transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
            >
              <span className="text-lg">카카오로 1초 로그인</span>
            </button>
            <button
              onClick={redirectToGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#E5E5E5] text-[#111] font-bold py-4 rounded-2xl transition-all hover:bg-gray-50 active:scale-[0.98] shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              구글로 로그인
            </button>
          </div>
          <p className="text-center text-xs text-[#AAA] mb-6">소셜 계정은 카카오·구글 버튼을 이용해주세요.</p>

          {/* 구분선 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-[1px] bg-[#EDE8E2]"></div>
            <span className="text-xs text-[#BBB] font-medium uppercase tracking-wider">또는</span>
            <div className="flex-1 h-[1px] bg-[#EDE8E2]"></div>
          </div>

          {/* 통합 이메일/아이디 폼 */}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="이메일 또는 아이디"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
              className="w-full bg-[#F7F3EE] border border-[#EDE8E2] text-[#111] px-4 py-3.5 rounded-xl focus:border-[#C2507A] focus:outline-none transition-colors"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-[#F7F3EE] border border-[#EDE8E2] text-[#111] px-4 py-3.5 rounded-xl focus:border-[#C2507A] focus:outline-none transition-colors"
            />
            {error && <p className="text-[#C2507A] text-sm text-center font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 rounded-xl font-bold text-white transition-opacity hover:opacity-90 shadow-md active:scale-[0.98] disabled:opacity-50"
              style={{ background: '#111' }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="flex justify-center gap-4 mt-5 text-sm text-[#666]">
            <button onClick={() => navigate('/reset-password')} className="hover:text-[#111]">비밀번호 찾기</button>
            <span className="text-[#E5E5E5]">|</span>
            <button onClick={() => navigate('/signup')} className="hover:text-[#111]">회원가입</button>
          </div>

          <div className="mt-10 pt-8 border-t border-[#EDE8E2] text-center space-y-3">
            <div>
              <p className="text-sm text-[#888] mb-1 font-medium">기획사/아티스트이신가요?</p>
              <button
                onClick={() => navigate('/apply')}
                className="text-[#C2507A] font-bold hover:underline text-sm"
              >
                기획사 입점 신청 →
              </button>
            </div>
            <button
              onClick={() => navigate('/admin/login')}
              className="text-xs text-[#AAA] hover:text-[#888] transition-colors"
            >
              관리자이신가요? 관리자 로그인 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
