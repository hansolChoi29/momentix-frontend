'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, userApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await authApi.signIn(form);
      const token = data.accessToken || data.token;
      if (token) {
        const { data: user } = await userApi.me();
        setAuth(user, token);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '이메일 또는 비밀번호를 확인해주세요.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ paddingTop: '4rem' }}>
      {/* 좌측 이미지 */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=90"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,10,11,0.6) 0%, rgba(10,10,11,0.2) 100%)' }} />
        <div className="absolute bottom-16 left-16 right-16">
          <p className="font-headline text-4xl font-bold mb-4" style={{ color: 'var(--text-bright)' }}>
            무대 위의 감동이<br />당신을 기다립니다
          </p>
          <p className="font-display text-lg" style={{ color: 'var(--gold)' }}>— MOMENTIX</p>
        </div>
      </div>

      {/* 우측 폼 */}
      <div className="flex-1 flex items-center justify-center px-6" style={{ background: 'var(--charcoal)' }}>
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-10">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="w-7 h-7 flex items-center justify-center" style={{ border: '1px solid var(--gold-dim)' }}>
                <span className="font-display text-sm" style={{ color: 'var(--gold)' }}>M</span>
              </div>
              <span className="font-display tracking-widest" style={{ color: 'var(--gold-light)', letterSpacing: '0.25em' }}>MOMENTIX</span>
            </Link>
            <p className="text-xs tracking-widest mb-2" style={{ color: 'var(--gold)', letterSpacing: '0.3em' }}>WELCOME BACK</p>
            <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-bright)' }}>로그인</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>이메일</label>
              <input
                type="email"
                className="input-dark"
                placeholder="이메일을 입력하세요"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>비밀번호</label>
              <input
                type="password"
                className="input-dark"
                placeholder="비밀번호를 입력하세요"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            {error && (
              <div className="p-3 text-xs" style={{ background: 'rgba(139,26,26,0.2)', border: '1px solid rgba(139,26,26,0.4)', color: '#E07070' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-gold w-full py-4 mt-6" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="divider-gold my-8" />

          {/* 소셜 로그인 */}
          <div className="space-y-3">
            <p className="text-xs text-center tracking-widest mb-4" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>소셜 계정으로 로그인</p>
            <button
              className="w-full py-3 text-sm flex items-center justify-center gap-3 transition-all"
              style={{ background: '#03C75A', color: 'white', border: 'none' }}
              onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/oauth2/authorization/naver`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
              </svg>
              네이버로 로그인
            </button>
          </div>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
            계정이 없으신가요?{' '}
            <Link href="/signup" style={{ color: 'var(--gold)' }} className="transition-colors hover:text-gold-light">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
