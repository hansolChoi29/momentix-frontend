'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

type Step = 'role' | 'form' | 'done';
type Role = 'consumer' | 'host';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role>('consumer');
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', nickname: '', phone: '', birthDate: '', businessNumber: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hostResult, setHostResult] = useState<{ username: string; password: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('비밀번호가 일치하지 않습니다.'); return; }
    setIsLoading(true);
    try {
      if (role === 'consumer') {
        await authApi.signUp(form.email, { password: form.password, confirmPassword: form.confirmPassword, nickname: form.nickname, phone: form.phone, birthDate: form.birthDate });
        setStep('done');
      } else {
        const { data } = await authApi.signUp('', { businessNumber: form.businessNumber, nickname: form.nickname, phone: form.phone });
        setHostResult(data);
        setStep('done');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    }
    setIsLoading(false);
  };

  const f = (key: keyof typeof form, val: string) => setForm(p => ({ ...p, [key]: val }));

  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ paddingTop: '4rem', background: 'var(--charcoal)' }}>
        <div className="text-center max-w-md animate-fade-up">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center animate-pulse-gold" style={{ border: '2px solid var(--gold)' }}>
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--gold)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          </div>
          <p className="text-xs tracking-widest mb-3" style={{ color: 'var(--gold)', letterSpacing: '0.3em' }}>WELCOME</p>
          <h2 className="font-display text-3xl font-semibold mb-4" style={{ color: 'var(--text-bright)' }}>
            {role === 'consumer' ? '가입을 환영합니다' : '호스트 계정이 발급되었습니다'}
          </h2>
          {hostResult && (
            <div className="p-4 mb-6 text-left" style={{ background: 'var(--surface)', border: '1px solid var(--gold-dim)' }}>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>발급된 계정 정보를 안전하게 보관하세요</p>
              <p className="text-sm font-mono" style={{ color: 'var(--gold)' }}>ID: {hostResult.username}</p>
              <p className="text-sm font-mono" style={{ color: 'var(--gold)' }}>PW: {hostResult.password}</p>
            </div>
          )}
          <button onClick={() => router.push('/login')} className="btn-gold px-10">로그인 하러 가기</button>
        </div>
      </div>
    );
  }

  if (step === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ paddingTop: '4rem', background: 'var(--charcoal)' }}>
        <div className="w-full max-w-md animate-fade-up">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-7 h-7 flex items-center justify-center" style={{ border: '1px solid var(--gold-dim)' }}>
              <span className="font-display text-sm" style={{ color: 'var(--gold)' }}>M</span>
            </div>
            <span className="font-display tracking-widest" style={{ color: 'var(--gold-light)', letterSpacing: '0.25em' }}>MOMENTIX</span>
          </Link>
          <p className="text-xs tracking-widest mb-2" style={{ color: 'var(--gold)', letterSpacing: '0.3em' }}>JOIN US</p>
          <h1 className="font-display text-3xl font-semibold mb-8" style={{ color: 'var(--text-bright)' }}>계정 유형 선택</h1>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {([
              { key: 'consumer', icon: '◇', label: '일반 회원', desc: '공연 예매 및 티켓 관리' },
              { key: 'host', icon: '◈', label: '공연 주최자', desc: '공연 등록 및 티켓 판매' },
            ] as const).map(r => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className="p-6 text-center transition-all duration-200"
                style={{
                  background: role === r.key ? 'rgba(201,168,76,0.1)' : 'var(--surface)',
                  border: `1px solid ${role === r.key ? 'var(--gold)' : 'var(--muted)'}`,
                }}
              >
                <div className="font-display text-3xl mb-3" style={{ color: role === r.key ? 'var(--gold)' : 'var(--text-muted)' }}>{r.icon}</div>
                <p className="font-semibold text-sm mb-1" style={{ color: role === r.key ? 'var(--text-bright)' : 'var(--text-dim)' }}>{r.label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.desc}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setStep('form')} className="btn-gold w-full py-4">다음 단계</button>
          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
            이미 계정이 있으신가요?{' '}
            <Link href="/login" style={{ color: 'var(--gold)' }}>로그인</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16" style={{ paddingTop: '5rem', background: 'var(--charcoal)' }}>
      <div className="w-full max-w-md animate-fade-up">
        <div className="flex items-center gap-3 mb-10">
          <button onClick={() => setStep('role')} style={{ color: 'var(--text-muted)' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
            </svg>
          </button>
          <div>
            <p className="text-xs tracking-widest" style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}>{role === 'consumer' ? '일반 회원' : '공연 주최자'}</p>
            <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-bright)' }}>회원가입</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === 'consumer' ? (
            <>
              {[
                { key: 'email', label: '이메일', type: 'email', placeholder: 'example@email.com' },
                { key: 'nickname', label: '닉네임', type: 'text', placeholder: '닉네임을 입력하세요' },
                { key: 'phone', label: '전화번호', type: 'tel', placeholder: '010-0000-0000' },
                { key: 'birthDate', label: '생년월일', type: 'date', placeholder: '' },
                { key: 'password', label: '비밀번호', type: 'password', placeholder: '8자 이상 입력하세요' },
                { key: 'confirmPassword', label: '비밀번호 확인', type: 'password', placeholder: '비밀번호를 다시 입력하세요' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{field.label}</label>
                  <input
                    type={field.type}
                    className="input-dark"
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => f(field.key as keyof typeof form, e.target.value)}
                    required
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                { key: 'nickname', label: '업체명', type: 'text', placeholder: '업체명을 입력하세요' },
                { key: 'businessNumber', label: '사업자 등록번호', type: 'text', placeholder: '000-00-00000' },
                { key: 'phone', label: '대표 연락처', type: 'tel', placeholder: '010-0000-0000' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{field.label}</label>
                  <input
                    type={field.type}
                    className="input-dark"
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => f(field.key as keyof typeof form, e.target.value)}
                    required
                  />
                </div>
              ))}
              <div className="p-4 text-xs" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--text-muted)' }}>
                호스트 계정은 시스템이 자동으로 ID/PW를 발급합니다. 가입 완료 후 화면에 표시됩니다.
              </div>
            </>
          )}

          {error && (
            <div className="p-3 text-xs" style={{ background: 'rgba(139,26,26,0.2)', border: '1px solid rgba(139,26,26,0.4)', color: '#E07070' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-gold w-full py-4 mt-2" disabled={isLoading}>
            {isLoading ? '처리 중...' : '가입 완료'}
          </button>
        </form>
      </div>
    </div>
  );
}
