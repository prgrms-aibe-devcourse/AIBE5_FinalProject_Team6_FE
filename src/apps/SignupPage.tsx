import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, setToken } from '../api/auth';
import { ROLE_KEY } from '../App';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      const token = await signup(email, password, nickname);
      setToken(token);
      localStorage.setItem(ROLE_KEY, 'FAN');
      navigate('/fan', { replace: true });
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
            <p className="text-[#888]">새 계정 만들기</p>
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
              placeholder="비밀번호"
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
            {error && <p className="text-[#C2507A] text-sm text-center font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading}
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
