import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, setToken, syncAppRole } from '../api/auth';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await adminLogin(email, password);
      setToken(token);
      syncAppRole(token.accessToken);
      navigate('/admin', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(
        msg === 'server_error'
          ? '서버 오류입니다. 잠시 후 다시 시도해주세요'
          : '이메일 또는 비밀번호가 올바르지 않습니다',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EE] flex flex-col font-sans">
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C2507A] rounded-full blur-[150px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7F77DD] rounded-full blur-[150px] opacity-10 pointer-events-none" />

        <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#EDE8E2] relative z-10 mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-[2px] font-mono mb-2">FANDROPS</h1>
            <p className="text-[#888]">관리자 전용 포털</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-[1px] bg-[#E5E5E5]" />
              <div className="text-xs text-[#888] font-medium uppercase tracking-wider">관리자 로그인</div>
              <div className="flex-1 h-[1px] bg-[#E5E5E5]" />
            </div>

            <input
              type="email"
              placeholder="관리자 이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#F7F3EE] border border-[#EDE8E2] text-[#111] px-4 py-3.5 rounded-xl focus:border-[#C2507A] focus:outline-none transition-colors"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              {loading ? '로그인 중...' : '관리자 로그인'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-xs text-[#888] mt-4 hover:text-[#111]"
            >
              ← 팬 로그인으로
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}