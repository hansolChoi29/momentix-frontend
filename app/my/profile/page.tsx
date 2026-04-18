'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [form, setForm] = useState({ nickname: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user) setForm({ nickname: user.nickname || '', phone: '' });
  }, [isAuthenticated, user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await userApi.update(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setIsSaving(false);
  };

  const MENU_LINKS = [
    { href: '/my/tickets', label: '내 티켓', icon: '◇', desc: '예매한 티켓 확인' },
    { href: '/my/reservations', label: '예매 내역', icon: '◈', desc: '예매 현황 및 취소' },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '4rem' }}>
      <div style={{ background: 'var(--charcoal)', borderBottom: '1px solid var(--muted)' }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-xs tracking-widest mb-2" style={{ color: 'var(--gold)', letterSpacing: '0.3em' }}>MY PAGE</p>
          <h1 className="font-display text-4xl font-semibold" style={{ color: 'var(--text-bright)' }}>프로필 설정</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4 p-6 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--muted)' }}>
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center rounded-full text-2xl font-bold" style={{ background: 'var(--gold-dim)', color: 'var(--obsidian)' }}>
                {user?.nickname?.[0] || 'U'}
              </div>
              <p className="font-semibold" style={{ color: 'var(--text-bright)' }}>{user?.nickname}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
            <div className="space-y-px">
              {MENU_LINKS.map(m => (
                <button key={m.href} onClick={() => router.push(m.href)} className="w-full text-left p-4 transition-all flex items-center gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-dim)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--muted)'; }}
                >
                  <span className="font-display text-lg" style={{ color: 'var(--gold-dim)' }}>{m.icon}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{m.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <div style={{ background: 'var(--surface)', border: '1px solid var(--muted)' }}>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--muted)' }}>
                <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--text-bright)' }}>기본 정보</h2>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>이메일</label>
                  <input type="email" className="input-dark" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>닉네임</label>
                  <input type="text" className="input-dark" value={form.nickname} onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>전화번호</label>
                  <input type="tel" className="input-dark" placeholder="010-0000-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  {saved && <span className="flex items-center text-xs" style={{ color: 'var(--teal-bright)' }}>✓ 저장되었습니다</span>}
                  <button type="submit" className="btn-gold" disabled={isSaving}>{isSaving ? '저장 중...' : '변경사항 저장'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
