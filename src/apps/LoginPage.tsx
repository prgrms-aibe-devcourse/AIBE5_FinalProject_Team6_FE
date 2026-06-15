import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setToken } from '../api/auth';
import { ROLE_KEY } from '../App';
import type { Role } from '../App';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showB2BForm, setShowB2BForm] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');

    try {
      const token = await login(email, password);
      setToken(token);
      let role: Role = 'FAN';
      if (email.includes('admin')) role = 'ADMIN';
      else if (email.includes('artist')) role = 'ARTIST';
      localStorage.setItem(ROLE_KEY, role);
      navigate(role === 'ADMIN' ? '/admin' : role === 'ARTIST' ? '/artist' : '/fan', { replace: true });
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다');
    }
  };

  const handleSocialLogin = () => {
    localStorage.setItem(ROLE_KEY, 'FAN');
    navigate('/fan', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F7F3EE] flex flex-col font-sans">
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C2507A] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7F77DD] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

        <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#EDE8E2] relative z-10 mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-[2px] font-mono mb-2">FANDROPS</h1>
            <p className="text-[#888]">당신의 최애와 더 가까이</p>
          </div>

          <div className="space-y-4 mb-8">
            <button
                onClick={handleSocialLogin}
                className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#191919] font-bold py-4 rounded-2xl transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
            >
              <span className="text-lg">카카오로 1초 로그인</span>
            </button>
            <button
                onClick={handleSocialLogin}
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

          {!showB2BForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowB2BForm(true)}
                className="text-xs text-[#888] font-medium hover:text-[#111] underline underline-offset-4"
              >
                기획사/아티스트 전용 로그인
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-[1px] bg-[#E5E5E5]"></div>
                <div className="text-xs text-[#888] font-medium uppercase tracking-wider">Agency Login</div>
                <div className="flex-1 h-[1px] bg-[#E5E5E5]"></div>
              </div>
              <input
                type="text"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F7F3EE] border border-[#EDE8E2] text-[#111] px-4 py-3.5 rounded-xl focus:border-[#C2507A] focus:outline-none transition-colors"
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F7F3EE] border border-[#EDE8E2] text-[#111] px-4 py-3.5 rounded-xl focus:border-[#C2507A] focus:outline-none transition-colors"
              />
              {error && <p className="text-[#C2507A] text-sm text-center font-medium mt-2">{error}</p>}
              <button
                type="submit"
                className="w-full py-4 mt-2 rounded-xl font-bold text-white transition-opacity hover:opacity-90 shadow-md active:scale-[0.98]"
                style={{ background: '#111' }}
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => setShowB2BForm(false)}
                className="w-full text-xs text-[#888] mt-4 hover:text-[#111]"
              >
                ← 뒤로가기
              </button>
            </form>
          )}

          <div className="flex justify-center gap-4 mt-6 text-sm text-[#666]">
            <button onClick={() => navigate('/reset-password')} className="hover:text-[#111]">비밀번호 찾기</button>
            <span className="text-[#E5E5E5]">|</span>
            <button onClick={() => navigate('/signup')} className="hover:text-[#111]">회원가입</button>
          </div>

          <div className="mt-12 pt-8 border-t border-[#EDE8E2] text-center">
            <p className="text-sm text-[#888] mb-2 font-medium">기획사/아티스트이신가요?</p>
            <button
              onClick={() => navigate('/apply')}
              className="text-[#C2507A] font-bold hover:underline"
            >
              기획사 입점 신청 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}