'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';

const NAV = [
  { href: '/events', label: '전체 공연' },
  { href: '/events?category=CONCERT', label: '콘서트' },
  { href: '/events?category=MUSICAL', label: '뮤지컬' },
  { href: '/events?category=PLAY', label: '연극' }
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleSignOut = async () => {
    try { await authApi.signOut(); } catch {}
    clearAuth(); setUserMenu(false); router.push('/');
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 60,
        background: '#fff',
        borderBottom: scrolled ? '1px solid var(--gray-200)' : '1px solid var(--gray-200)',
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
        transition: 'box-shadow 0.2s',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', height: '100%', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

          {/* 로고 */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, background: 'var(--primary)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 13V6l5-4 5 4v7H10V9H6v4H3z" fill="white"/>
              </svg>
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              momentix
            </span>
          </Link>

          {/* 데스크탑 네비 */}
          <div style={{ display: 'flex', gap: '0.15rem', flex: 'none' }} className="nav-links">
            {NAV.map(n => {
              const active = n.href === '/events' ? pathname === '/events' : pathname?.startsWith(n.href.split('?')[0]) && (n.href.includes('?') ? true : false) || false;
              const isEvents = n.href === '/events' && pathname === '/events';
              return (
                <Link key={n.href} href={n.href} style={{
                  textDecoration: 'none', padding: '0.4rem 0.8rem',
                  fontSize: '0.875rem', fontWeight: isEvents ? 700 : 500,
                  color: isEvents ? 'var(--primary)' : 'var(--text-sub)',
                  borderRadius: 6, transition: 'background 0.15s, color 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gray-100)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-main)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = isEvents ? 'var(--primary)' : 'var(--text-sub)'; }}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>

          {/* 검색창 */}
          <div style={{ flex: 1, maxWidth: 320, position: 'relative' }} className="nav-search">
            <form onSubmit={e => { e.preventDefault(); if (searchVal.trim()) { router.push(`/search?q=${encodeURIComponent(searchVal)}`); setSearchVal(''); setSearchFocus(false); } }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
                  placeholder="공연명, 아티스트 검색"
                  style={{
                    width: '100%', height: 36,
                    background: searchFocus ? '#fff' : 'var(--gray-100)',
                    border: searchFocus ? '1.5px solid var(--primary)' : '1.5px solid var(--gray-200)',
                    borderRadius: 100, padding: '0 1rem 0 2.1rem',
                    fontSize: '0.83rem', outline: 'none', fontFamily: 'inherit',
                    color: 'var(--text-main)', transition: 'all 0.18s',
                    boxShadow: searchFocus ? '0 0 0 3px rgba(255,75,110,0.1)' : 'none',
                  }}
                />
              </div>
            </form>

            {/* 검색 드롭다운 */}
            {searchFocus && !searchVal && (
              <div className="anim-pop" style={{
                position: 'absolute', top: '110%', left: 0, right: 0,
                background: '#fff', borderRadius: 10,
                boxShadow: 'var(--shadow-lg)', padding: '0.75rem',
                border: '1px solid var(--gray-200)', zIndex: 200,
              }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>인기 검색어</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {['IU', 'BTS', '레미제라블', '오페라의 유령', '호두까기'].map(t => (
                    <button key={t} onMouseDown={() => { router.push(`/search?q=${t}`); }}
                      style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 100, padding: '0.25rem 0.7rem', fontSize: '0.78rem', color: 'var(--text-sub)', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 우측 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: 'auto' }}>
            {isAuthenticated && user ? (
              <div ref={userRef} style={{ position: 'relative' }}>
                <button onClick={() => setUserMenu(v => !v)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem 0.5rem',
                  borderRadius: 8, transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gray-100)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user.nickname?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }} className="nav-username">{user.nickname}</span>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)', transform: userMenu ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {userMenu && (
                  <div className="anim-pop" style={{
                    position: 'absolute', right: 0, top: '110%', width: 190,
                    background: '#fff', borderRadius: 10,
                    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--gray-200)',
                    overflow: 'hidden', zIndex: 200,
                  }}>
                    <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-100)' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{user.nickname}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</p>
                    </div>
                    {[{ href: '/my/tickets', label: '내 티켓', icon: '🎫' }, { href: '/my/reservations', label: '예매 내역', icon: '📋' }, { href: '/my/profile', label: '프로필 설정', icon: '⚙️' }].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setUserMenu(false)} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '0.65rem 1rem', textDecoration: 'none',
                        fontSize: '0.85rem', color: 'var(--text-sub)', transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gray-100)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                      >
                        <span>{item.icon}</span>{item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid var(--gray-200)' }}>
                      <button onClick={handleSignOut} style={{
                        width: '100%', textAlign: 'left', padding: '0.65rem 1rem',
                        background: 'none', border: 'none', fontSize: '0.85rem',
                        color: 'var(--primary)', cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-bg)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                      >
                        <span>🚪</span>로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.83rem' }}>로그인</Link>
                <Link href="/signup" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.83rem' }}>회원가입</Link>
              </>
            )}

            {/* 햄버거 */}
            <button onClick={() => setMobileOpen(v => !v)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 6 }} className="hamburger">
              <div style={{ width: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[0,1,2].map(i => <span key={i} style={{ display: 'block', height: 2, background: 'var(--text-main)', borderRadius: 2, transition: 'all 0.2s' }} />)}
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      {mobileOpen && (
        <div className="anim-in" style={{
          position: 'fixed', top: 60, left: 0, right: 0,
          background: '#fff', borderBottom: '1px solid var(--gray-200)',
          boxShadow: 'var(--shadow-md)', zIndex: 90, padding: '1rem',
        }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '0.7rem 0.5rem', fontSize: '0.95rem', color: 'var(--text-sub)', textDecoration: 'none', borderBottom: '1px solid var(--gray-100)' }}>
              {n.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem' }}>
              <Link href="/login" className="btn-ghost" style={{ flex: 1, textAlign: 'center' }} onClick={() => setMobileOpen(false)}>로그인</Link>
              <Link href="/signup" className="btn-primary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setMobileOpen(false)}>회원가입</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .nav-links { display: none !important; } }
        @media (max-width: 640px) { .nav-search { display: none !important; } .nav-username { display: none !important; } .hamburger { display: flex !important; } }
      `}</style>
    </>
  );
}
