import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { requestPasswordReset, confirmPasswordReset } from '../api/auth';

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setDone(true);
    } catch {
      setError('이메일 전송에 실패했습니다. 가입된 이메일인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(token!, newPassword);
      setDone(true);
    } catch {
      setError('비밀번호 재설정에 실패했습니다. 링크가 만료되었을 수 있습니다.');
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
            <p className="text-[#888]">{token ? '새 비밀번호 설정' : '비밀번호 찾기'}</p>
          </div>

          {!token && !done && (
            <p className="text-xs text-center text-[#AAA] mb-6">
              이메일로 가입한 팬 계정만 이용 가능합니다.<br />
              소셜 가입 계정은 카카오·구글로 로그인해주세요.
            </p>
          )}

          {done ? (
            <div className="text-center space-y-4">
              <p className="text-[#111] font-medium">
                {token
                  ? '비밀번호가 변경되었습니다.'
                  : '이메일을 확인해주세요. 재설정 링크를 발송했습니다.'}
              </p>
              <button
                onClick={() => navigate('/fan')}
                className="w-full py-4 rounded-xl font-bold text-white transition-opacity hover:opacity-90 shadow-md active:scale-[0.98]"
                style={{ background: '#111' }}
              >
                로그인으로 이동
              </button>
            </div>
          ) : token ? (
            <form onSubmit={handleConfirm} className="space-y-4">
              <input
                type="password"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                className="w-full bg-[#F7F3EE] border border-[#EDE8E2] text-[#111] px-4 py-3.5 rounded-xl focus:border-[#C2507A] focus:outline-none transition-colors"
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
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
                {loading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRequest} className="space-y-4">
              <input
                type="email"
                placeholder="가입한 이메일"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                {loading ? '전송 중...' : '재설정 링크 받기'}
              </button>
            </form>
          )}

          {!done && (
            <div className="text-center mt-6">
              <button
                onClick={() => navigate('/fan')}
                className="text-sm text-[#888] hover:text-[#111]"
              >
                ← 로그인으로 돌아가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
