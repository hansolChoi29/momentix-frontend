'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import './profile.css';

type ProfileFormValues = {
  nickname: string;
  phone: string;
};

function ProfileForm({
  initialForm,
}: {
  initialForm: ProfileFormValues;
}) {
  const [form, setForm] = useState<ProfileFormValues>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await userApi.update(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="p-6 space-y-5">
      <div>
        <label
          htmlFor="nickname"
          className="block text-xs tracking-widest mb-2 profile-label"
        >
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          className="input-dark"
          value={form.nickname}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, nickname: e.target.value }))
          }
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-xs tracking-widest mb-2 profile-label"
        >
          전화번호
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="input-dark"
          placeholder="010-0000-0000"
          value={form.phone}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, phone: e.target.value }))
          }
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {saved && (
          <span className="flex items-center text-xs profile-saved-text">
            ✓ 저장되었습니다
          </span>
        )}
        <button type="submit" className="btn-gold" disabled={isSaving}>
          {isSaving ? '저장 중...' : '변경사항 저장'}
        </button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const MENU_LINKS = [
    { href: '/my/tickets', label: '내 티켓', icon: '◇', desc: '예매한 티켓 확인' },
    { href: '/my/reservations', label: '예매 내역', icon: '◈', desc: '예매 현황 및 취소' },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-xs tracking-widest mb-2 profile-header-kicker">
            MY PAGE
          </p>
          <h1 className="font-display text-4xl font-semibold profile-header-title">
            프로필 설정
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4 p-6 text-center profile-user-card">
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center rounded-full text-2xl font-bold profile-avatar">
                {user?.nickname?.[0] || 'U'}
              </div>
              <p className="font-semibold profile-user-name">{user?.nickname}</p>
              <p className="text-xs mt-1 profile-user-email">{user?.email}</p>
            </div>

            <div className="space-y-px">
              {MENU_LINKS.map((m) => (
                <button
                  key={m.href}
                  type="button"
                  onClick={() => router.push(m.href)}
                  className="w-full text-left p-4 transition-all flex items-center gap-3 profile-menu-button"
                >
                  <span className="font-display text-lg profile-menu-icon">
                    {m.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium profile-menu-label">
                      {m.label}
                    </p>
                    <p className="text-xs profile-menu-desc">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="profile-panel">
              <div className="px-6 py-4 profile-panel-header">
                <h2 className="font-display text-lg font-semibold profile-panel-title">
                  기본 정보
                </h2>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs tracking-widest mb-2 profile-label"
                  >
                    이메일
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="input-dark profile-input-disabled"
                    value={user?.email || ''}
                    disabled
                    readOnly
                  />
                </div>

                <ProfileForm
                  key={user?.email || 'profile-form'}
                  initialForm={{
                    nickname: user?.nickname || '',
                    phone: '',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}