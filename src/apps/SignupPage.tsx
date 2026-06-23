import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, setToken, syncAppRole, getRoleHomePath } from '../api/auth';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!termsAgreed) {
      setError('이용약관에 동의해주세요.');
      return;
    }
    setLoading(true);
    try {
      const token = await signup(email, password, nickname, termsAgreed);
      setToken(token);
      const role = syncAppRole(token.accessToken);
      navigate(getRoleHomePath(role), { replace: true });
    } catch {
      setError('회원가입에 실패했습니다. 이미 사용 중인 이메일일 수 있습니다.');
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
            <p className="text-[#888]">팬 계정 만들기</p>
          </div>

          <div className="mb-6 bg-[#F7F3EE] rounded-2xl px-4 py-3 border border-[#EDE8E2] text-sm text-[#666] text-center">
            기획사·아티스트 계정은 입점 승인 후 별도 발급됩니다.{' '}
            <button
              type="button"
              onClick={() => navigate('/apply')}
              className="text-[#C2507A] font-bold hover:underline"
            >
              입점 신청 →
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-[#F7F3EE] border border-[#EDE8E2] text-[#111] px-4 py-3.5 rounded-xl focus:border-[#C2507A] focus:outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              required
              className="w-full bg-[#F7F3EE] border border-[#EDE8E2] text-[#111] px-4 py-3.5 rounded-xl focus:border-[#C2507A] focus:outline-none transition-colors"
            />
            <input
              type="password"
              placeholder="비밀번호 (최소 8자)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-[#F7F3EE] border border-[#EDE8E2] text-[#111] px-4 py-3.5 rounded-xl focus:border-[#C2507A] focus:outline-none transition-colors"
            />
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              required
              className="w-full bg-[#F7F3EE] border border-[#EDE8E2] text-[#111] px-4 py-3.5 rounded-xl focus:border-[#C2507A] focus:outline-none transition-colors"
            />
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={e => setTermsAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#C2507A] shrink-0"
              />
              <span className="text-sm text-[#555]">
                FANDROPS{' '}
                <span className="font-bold text-[#111]">이용약관</span> 및{' '}
                <span className="font-bold text-[#111]">개인정보 처리방침</span>에 동의합니다.
              </span>
            </label>
            {error && <p className="text-[#C2507A] text-sm text-center font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading || !termsAgreed}
              className="w-full py-4 mt-2 rounded-xl font-bold text-white transition-opacity hover:opacity-90 shadow-md active:scale-[0.98] disabled:opacity-50"
              style={{ background: '#111' }}
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-[#888] hover:text-[#111]"
            >
              ← 로그인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
