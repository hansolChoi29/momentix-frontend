'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy)', color: '#fff', marginTop: 0 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.85rem' }}>
              <div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 13V6l5-4 5 4v7H10V9H6v4H3z" fill="white"/></svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>momentix</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 260 }}>
              콘서트, 연극, 뮤지컬의 모든 공연 티켓을 한 곳에서. 특별한 순간을 Momentix와 함께하세요.
            </p>
          </div>
          {[
            { title: '공연', links: ['전체 공연', '콘서트', '뮤지컬', '연극'] },
            { title: '고객지원', links: ['자주 묻는 질문', '취소/환불', '1:1 문의'] },
            { title: '회사', links: ['서비스 소개', '이용약관', '개인정보처리방침'] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>{col.title}</p>
              {col.links.map(l => (
                <p key={l} style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.5rem', cursor: 'pointer', transition: 'color 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}>
                  {l}
                </p>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>© 2025 MaeJinImBack.</p>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>공연 티켓팅의 새로운 기준</p>
        </div>
      </div>
      <style>{`@media(max-width:768px){footer .footer-grid{grid-template-columns:1fr 1fr !important}}`}</style>
    </footer>
  );
}
