'use client';

import axios from 'axios';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const DEMO_ACCOUNT = {
  email: 'demo@momentix.com',
  password: '1234qwer!',
  nickname: '데모사용자',
};

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  // 서버용
  // const [form, setForm] = useState({ username: '', password: '' });

   const [form, setForm] = useState({
    username: DEMO_ACCOUNT.email,
    password: DEMO_ACCOUNT.password,
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { mockLogin } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  // 서버용
//   try {
//     const response = await authApi.signIn({
//   username: form.username,
//   password: form.password,
// });

//     const token =
//       response.data?.data ??
//       response.data?.accessToken ??
//       response.data?.token;

//     if (!token) throw new Error('토큰 없음');

//     setAuth(null, token);
//     router.push('/');
//   } catch (err: unknown) {
//     if (axios.isAxiosError<{ message?: string }>(err)) {
//       setError(err.response?.data?.message || '이메일 또는 비밀번호를 확인해주세요.');
//     } else {
//       setError('이메일 또는 비밀번호를 확인해주세요.');
//     }
//   } finally {
//     setIsLoading(false);
//   }
// };

try {
      if (
        form.username !== DEMO_ACCOUNT.email ||
        form.password !== DEMO_ACCOUNT.password
      ) {
        setError('데모 계정 정보를 확인해주세요.');
        return;
      }

      setAuth(
        {
          email: DEMO_ACCOUNT.email,
          nickname: DEMO_ACCOUNT.nickname,
        },
        'demo-access-token'
      );

      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* ── 좌측 이미지 패널 ── */}
      <div style={{ flex: '0 0 46%', position: 'relative', overflow: 'hidden' }} className="login-img-panel">
        <img
          src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=90"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* 그라디언트 오버레이 */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(26,26,62,0.55) 0%, rgba(26,26,62,0.15) 60%, rgba(26,26,62,0.7) 100%)' }} />

        {/* 카드 */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '3rem' }}>

          {/* 카피 */}
          <div>
            <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: '1rem' }}>
              무대 위의 감동이<br />당신을 기다립니다
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['콘서트', '뮤지컬', '연극'].map(tag => (
                <span key={tag} style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: 100, border: '1px solid rgba(255,255,255,0.25)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 우측 폼 패널 ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#fff', overflowY: 'auto' }}>
        <div className="anim-up" style={{ width: '100%', maxWidth: 400 }}>

          {/* 모바일용 로고 */}
          <Link href="/" style={{ textDecoration: 'none', display: 'none', alignItems: 'center', gap: 8, marginBottom: '2rem' }} className="login-mobile-logo">
            <div style={{ width: 30, height: 30, background: 'var(--primary)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 13V6l5-4 5 4v7H10V9H6v4H3z" fill="white"/></svg>
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>momentix</span>
          </Link>

          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>WELCOME BACK</p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem' }}>로그인</h1>
          

          {/* 폼 */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '0.4rem' }}>이메일</label>
              <input
                type="email"
                className="input-field"
                placeholder="example@email.com"
                value={form.username}
                onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)' }}>비밀번호</label>
               
              </div>
              <input
                type="password"
                className="input-field"
                placeholder="비밀번호를 입력하세요"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              
            </div>

            {error && (
              <div style={{ background: '#FFF0F3', border: '1.5px solid rgba(255,75,110,0.3)', borderRadius: 8, padding: '0.7rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="15" height="15" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 500 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '0.95rem', marginTop: '0.25rem', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  로그인 중...
                </span>
              ) : '로그인'}
            </button>
            {process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' && (
              <button
                type="button"
                onClick={() => {
                  mockLogin();
                  router.push('/');
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.9rem',
                  fontSize: '0.95rem',
                  marginTop: '0.75rem',
                  background: '#fff',
                  color: 'var(--text-main)',
                  border: '1.5px solid var(--gray-300)',
                  boxShadow: 'none',
                }}
              >
                임시 로그인
              </button>
            )}
          </form>
          <div className="flex justify-between gap-4">
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginBottom: 0,
              }}
            >
              계정이 없으신가요?{' '}
              <Link
                href="/signup"
                style={{
                  color: 'var(--primary)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                회원가입
              </Link>
            </p>

            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.78rem',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              비밀번호 찾기
            </button>
          </div>

          {/* 구분선 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>또는 소셜 계정으로</span>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
          </div>

          {/* 소셜 로그인 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => {
                const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || window.location.origin;
                window.location.href = `${apiBase}/oauth2/authorization/naver`;
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                padding: '0.8rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#03C75A', color: '#fff', fontSize: '0.88rem', fontWeight: 700,
                fontFamily: 'inherit', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
              </svg>
              네이버로 로그인
            </button>

            <button
              type="button"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                padding: '0.8rem', borderRadius: 8, border: '1.5px solid var(--gray-300)', cursor: 'pointer',
                background: '#FEE500', color: '#191919', fontSize: '0.88rem', fontWeight: 700,
                fontFamily: 'inherit', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.72 5.2 4.32 6.72L5.4 21l4.08-2.16c.83.18 1.69.28 2.52.28 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
              </svg>
              카카오로 로그인
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-img-panel { display: none !important; }
          .login-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
