'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type ProfileFormValues = {
  nickname: string;
  phone: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [form, setForm] = useState<ProfileFormValues>({
    nickname: user?.nickname || '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await userApi.update(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert('프로필 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(255,240,243,0.42) 0%, #f7f8fa 34%, #f7f8fa 100%)',
        paddingTop: '4rem',
      }}
    >
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '1.8rem 1.3rem 0.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.14em' }}>MY PAGE</p>
        <h1 style={{ marginTop: '0.35rem', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>프로필 설정</h1>
        <p style={{ marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          계정 정보를 확인하고 닉네임/연락처를 수정할 수 있습니다.
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem 1.3rem 2.4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '0.9rem' }}>
          <article className="card" style={{ padding: '1.2rem', borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  background: 'var(--primary-bg)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(255,75,110,0.24)',
                }}
              >
                {user?.nickname?.[0] || 'U'}
              </div>
              <div>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{user?.nickname || '사용자'}</p>
                <p style={{ marginTop: '0.2rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>{user?.email || ''}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
              <button className="btn-outline" style={{ padding: '0.48rem 0.8rem', fontSize: '0.78rem' }} onClick={() => router.push('/my/tickets')}>
                내 티켓
              </button>
              <button className="btn-outline" style={{ padding: '0.48rem 0.8rem', fontSize: '0.78rem' }} onClick={() => router.push('/my/reservations')}>
                예매 내역
              </button>
              <button className="btn-outline" style={{ padding: '0.48rem 0.8rem', fontSize: '0.78rem' }} onClick={() => router.push('/my/payments')}>
                결제 내역
              </button>
            </div>
          </article>

          <article className="card" style={{ padding: '1.2rem', borderRadius: 14 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>기본 정보</h2>
            <p style={{ marginTop: '0.35rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              이메일은 변경할 수 없으며, 나머지 항목은 저장 버튼으로 즉시 반영됩니다.
            </p>

            <form onSubmit={handleSave} style={{ marginTop: '0.95rem', display: 'grid', gap: '0.9rem' }}>
              <label>
                <span style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', letterSpacing: '0.07em' }}>
                  이메일
                </span>
                <input className="input-field" value={user?.email || ''} disabled readOnly style={{ opacity: 0.65, cursor: 'not-allowed' }} />
              </label>

              <label>
                <span style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', letterSpacing: '0.07em' }}>
                  닉네임
                </span>
                <input
                  className="input-field"
                  value={form.nickname}
                  onChange={(e) => setForm((prev) => ({ ...prev, nickname: e.target.value }))}
                />
              </label>

              <label>
                <span style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', letterSpacing: '0.07em' }}>
                  전화번호
                </span>
                <input
                  className="input-field"
                  value={form.phone}
                  placeholder="010-0000-0000"
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.6rem', marginTop: '0.15rem' }}>
                {saved && <span style={{ fontSize: '0.8rem', color: '#1A8C6E', fontWeight: 700 }}>저장되었습니다.</span>}
                <button type="submit" className="btn-primary" style={{ padding: '0.68rem 1rem' }} disabled={isSaving}>
                  {isSaving ? '저장 중...' : '변경사항 저장'}
                </button>
              </div>
            </form>
          </article>
        </div>
      </section>
    </main>
  );
}
