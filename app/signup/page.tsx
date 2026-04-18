'use client';

import axios from 'axios';
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
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    phone: '',
    birthDate: '',
    businessNumber: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hostResult, setHostResult] = useState<{ username: string; password: string } | null>(null);

  const f = (key: keyof typeof form, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (role === 'consumer' && form.password !== form.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      if (role === 'consumer') {
        await authApi.signUp(form.email, {
          password: form.password,
          confirmPassword: form.confirmPassword,
          nickname: form.nickname,
          phone: form.phone,
          birthDate: form.birthDate,
        });
      } else {
        const { data } = await authApi.signUp('', {
          businessNumber: form.businessNumber,
          nickname: form.nickname,
          phone: form.phone,
        });
        setHostResult(data);
      }

      setStep('done');
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message || '가입 중 오류가 발생했습니다.');
      } else {
        setError('가입 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--gray-100)',
          padding: '2rem',
        }}
      >
        <div
          className="anim-pop card"
          style={{ maxWidth: 420, width: '100%', padding: '3rem 2.5rem', textAlign: 'center' }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              background: 'var(--primary-bg)',
              borderRadius: '50%',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="30" height="30" fill="none" stroke="var(--primary)" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            {role === 'consumer' ? '가입을 환영합니다! 🎉' : '호스트 계정이 발급되었습니다'}
          </h2>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: hostResult ? '1.5rem' : '2rem',
            }}
          >
            {role === 'consumer' ? '이제 원하는 공연을 예매해보세요.' : '아래 정보로 로그인하세요.'}
          </p>
          {hostResult && (
            <div
              style={{
                background: 'var(--primary-bg)',
                border: '1.5px solid rgba(255,75,110,0.2)',
                borderRadius: 10,
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
              }}
            >
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                발급된 계정 정보 (안전하게 보관하세요)
              </p>
              <p
                style={{
                  fontSize: '0.88rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-main)',
                  marginBottom: '0.2rem',
                }}
              >
                ID: {hostResult.username}
              </p>
              <p style={{ fontSize: '0.88rem', fontFamily: 'monospace', color: 'var(--text-main)' }}>
                PW: {hostResult.password}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
          >
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  if (step === 'role') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--gray-100)',
          padding: '2rem',
        }}
      >
        <div className="anim-up" style={{ maxWidth: 460, width: '100%' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <p
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--primary)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}
            >
              JOIN US
            </p>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              회원가입
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
              어떤 유형으로 가입하시겠어요?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { key: 'consumer' as Role, emoji: '🎫', label: '일반 회원', desc: '공연 예매 및 관리' },
                { key: 'host' as Role, emoji: '🎭', label: '공연 주최자', desc: '공연 등록 및 판매' },
              ].map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  style={{
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: role === r.key ? 'var(--primary-bg)' : 'var(--gray-100)',
                    border: `2px solid ${role === r.key ? 'var(--primary)' : 'var(--gray-200)'}`,
                    borderRadius: 10,
                    transition: 'all 0.18s',
                  }}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{r.emoji}</div>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: role === r.key ? 'var(--primary)' : 'var(--text-main)',
                      marginBottom: '0.15rem',
                    }}
                  >
                    {r.label}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.desc}</p>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.9rem' }}
            >
              다음 →
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              이미 계정이 있으신가요?{' '}
              <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const CONSUMER_FIELDS = [
    { key: 'email', label: '이메일', type: 'email', placeholder: 'example@email.com' },
    { key: 'nickname', label: '닉네임', type: 'text', placeholder: '닉네임을 입력하세요' },
    { key: 'phone', label: '전화번호', type: 'tel', placeholder: '010-0000-0000' },
    { key: 'birthDate', label: '생년월일', type: 'date', placeholder: '' },
    { key: 'password', label: '비밀번호', type: 'password', placeholder: '8자 이상 입력하세요' },
    { key: 'confirmPassword', label: '비밀번호 확인', type: 'password', placeholder: '비밀번호를 다시 입력하세요' },
  ] as const;

  const HOST_FIELDS = [
    { key: 'nickname', label: '업체명', type: 'text', placeholder: '업체명을 입력하세요' },
    { key: 'businessNumber', label: '사업자 등록번호', type: 'text', placeholder: '000-00-00000' },
    { key: 'phone', label: '대표 연락처', type: 'tel', placeholder: '010-0000-0000' },
  ] as const;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--gray-100)',
        padding: '2rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="anim-up" style={{ maxWidth: 480, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setStep('role')}
            style={{
              background: '#fff',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 8,
              padding: '0.45rem 0.7rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.82rem',
              color: 'var(--text-sub)',
              fontFamily: 'inherit',
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M15.75 19.5L8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            이전
          </button>
          <div>
            <p
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--primary)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {role === 'consumer' ? '일반 회원' : '공연 주최자'}
            </p>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>정보 입력</p>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {role === 'consumer' ? (
              CONSUMER_FIELDS.map((field) => (
                <div key={field.key}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-sub)',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    className="input-field"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(e) => f(field.key, e.target.value)}
                    required
                  />
                </div>
              ))
            ) : (
              <>
                {HOST_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--text-sub)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      className="input-field"
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(e) => f(field.key, e.target.value)}
                      required
                    />
                  </div>
                ))}
                <div
                  style={{
                    background: '#FFF9F0',
                    border: '1.5px solid #FFD899',
                    borderRadius: 8,
                    padding: '0.85rem',
                    display: 'flex',
                    gap: '0.6rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>ℹ️</span>
                  <p style={{ fontSize: '0.78rem', color: '#996600', lineHeight: 1.55 }}>
                    호스트 계정은 시스템이 자동으로 ID/PW를 발급합니다. 가입 완료 후 화면에 표시됩니다.
                  </p>
                </div>
              </>
            )}

            {error && (
              <div
                style={{
                  background: '#FFF0F3',
                  border: '1.5px solid rgba(255,75,110,0.3)',
                  borderRadius: 8,
                  padding: '0.7rem 0.9rem',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 500 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.9rem',
                fontSize: '0.9rem',
                marginTop: '0.25rem',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? '처리 중...' : '가입 완료'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}