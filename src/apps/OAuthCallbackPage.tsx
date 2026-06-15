import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { socialLogin, setToken } from '../api/auth';
import { ROLE_KEY } from '../App';

const PROVIDER_KEY = 'oauth_provider';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get('code');
    const provider = sessionStorage.getItem(PROVIDER_KEY);

    if (!code || !provider) {
      navigate('/login', { replace: true });
      return;
    }

    sessionStorage.removeItem(PROVIDER_KEY);

    socialLogin(provider, code)
      .then(token => {
        setToken(token);
        localStorage.setItem(ROLE_KEY, 'FAN');
        navigate('/fan', { replace: true });
      })
      .catch(() => setError('소셜 로그인에 실패했습니다. 다시 시도해주세요.'));
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-[#C2507A] font-bold mb-4">{error}</p>
            <button onClick={() => navigate('/login')} className="text-[#111] underline">로그인으로 돌아가기</button>
          </>
        ) : (
          <p className="text-[#888] font-bold">로그인 처리 중...</p>
        )}
      </div>
    </div>
  );
}