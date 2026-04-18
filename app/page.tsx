'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import EventCard from '@/components/event/EventCard';
import { eventApi } from '@/lib/api';
import { Event } from '@/types';

const BANNERS = [
  { title: '2025 IU HEREH WORLD TOUR', desc: '아이유 단독 콘서트 · 올림픽 주경기장', date: '8.15(금) ~ 8.17(일)', img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1400&q=85', badge: '예매중' },
  { title: '레미제라블 내한공연 2025', desc: '오리지널 브로드웨이 제작사 · LG아트센터', date: '9.1(월) ~ 10.31(금)', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1400&q=85', badge: '오픈예정' },
  { title: 'Coldplay Music Of The Spheres', desc: '콜드플레이 내한공연 · 잠실 올림픽 경기장', date: '10.10(금) ~ 10.12(일)', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1400&q=85', badge: '예매중' },
];

const QUICK_CATS = [
  { key: 'CONCERT',   label: '콘서트',  emoji: '🎤' },
  { key: 'MUSICAL',   label: '뮤지컬',  emoji: '🎭' },
  { key: 'THEATER',   label: '연극',    emoji: '🎬' },
  { key: 'DANCE',     label: '무용',    emoji: '💃' },
  { key: 'EXHIBITION',label: '전시',    emoji: '🖼️' },
  { key: 'SPORT',     label: '스포츠',  emoji: '⚽' },
];

const MOCK: Event[] = Array.from({ length: 8 }, (_, i) => ({
  eventId: i + 1,
  title: ['2025 IU HEREH WORLD TOUR', '레미제라블 내한공연', '오페라의 유령', '호두까기 인형', 'Coldplay 내한공연', '지킬앤하이드', '베르사유의 장미', '맘마미아'][i],
  description: '', category: ['CONCERT','MUSICAL','MUSICAL','DANCE','CONCERT','MUSICAL','MUSICAL','MUSICAL'][i] as Event['category'],
  status: ['ON_SALE','UPCOMING','ON_SALE','ON_SALE','SOLD_OUT','ON_SALE','UPCOMING','ON_SALE'][i] as Event['status'],
  venue: { venueId: i, name: ['올림픽 주경기장','LG아트센터','블루스퀘어','예술의전당','잠실실내체육관','세종문화회관','국립극장','성남아트센터'][i], address: '서울', capacity: 5000 },
  schedules: [{ scheduleId: i, date: `2025-0${(i%9)+1}-15`, startTime: '19:30', endTime: '21:30' }],
  minPrice: [165000,99000,110000,88000,143000,77000,99000,99000][i], maxPrice: 220000,
}));

export default function HomePage() {
  const [idx, setIdx] = useState(0);
  const [events, setEvents] = useState<Event[]>(MOCK);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i+1) % BANNERS.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    eventApi.list({ size: 8 }).then(({ data }) => { if (data?.content?.length) setEvents(data.content); }).catch(() => {});
  }, []);

  const b = BANNERS[idx];

  return (
    <div>
      {/* ── 메인 배너 ── */}
      <section style={{ position: 'relative', height: 480, overflow: 'hidden', background: '#000' }}>
        {BANNERS.map((s, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === idx ? 1 : 0, transition: 'opacity 0.9s ease' }}>
            <img src={s.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }} />
          </div>
        ))}

        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
            <div key={idx} className="anim-up">
              <span style={{
                display: 'inline-block', background: 'var(--primary)', color: '#fff',
                fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.75rem',
                borderRadius: 100, letterSpacing: '0.05em', marginBottom: '0.85rem',
              }}>{b.badge}</span>
              <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '0.6rem', maxWidth: 620 }}>
                {b.title}
              </h1>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.3rem' }}>{b.desc}</p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.75rem' }}>{b.date}</p>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <Link href="/events" className="btn-primary" style={{ fontSize: '0.88rem', padding: '0.7rem 1.8rem' }}>지금 예매하기</Link>
                <Link href="/events" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '0.7rem 1.5rem', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.28)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)'; }}>
                  전체 보기
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 슬라이드 도트 */}
        <div style={{ position: 'absolute', bottom: 20, right: '1.5rem', display: 'flex', gap: 6 }}>
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 7, height: 7, borderRadius: 4, background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
          ))}
        </div>

        {/* 배너 카운터 */}
        <div style={{ position: 'absolute', bottom: 22, left: '1.5rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
          {idx + 1} / {BANNERS.length}
        </div>
      </section>

      {/* ── 카테고리 빠른 메뉴 ── */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
            {QUICK_CATS.map((c, i) => (
              <Link key={c.key} href={`/events?category=${c.key}`} style={{
                textDecoration: 'none', textAlign: 'center', padding: '1.25rem 0.5rem',
                borderRight: i < QUICK_CATS.length - 1 ? '1px solid var(--gray-100)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-bg)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>{c.emoji}</div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)' }}>{c.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 인기 공연 ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>HOT</p>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>지금 인기 있는 공연</h2>
          </div>
          <Link href="/events" style={{ fontSize: '0.83rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            전체 보기 <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {events.slice(0, 8).map((ev, i) => (
            <div key={ev.eventId} className={`anim-up d${Math.min(i+1,8)}`}>
              <EventCard event={ev} index={i} />
            </div>
          ))}
        </div>
        <style>{`@media(max-width:1024px){.hot-grid{grid-template-columns:repeat(3,1fr)!important}}@media(max-width:640px){.hot-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      </section>

      {/* ── 프로모션 배너 ── */}
      <section style={{ background: 'var(--primary-bg)', borderTop: '1px solid rgba(255,75,110,0.12)', borderBottom: '1px solid rgba(255,75,110,0.12)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.3rem' }}>🎁 신규 회원 혜택</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>지금 가입하면 첫 예매 5,000원 할인</p>
          </div>
          <Link href="/signup" className="btn-primary" style={{ flexShrink: 0 }}>지금 가입하기</Link>
        </div>
      </section>

      {/* ── 장르별 추천 ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>NEW</p>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>신규 오픈 공연</h2>
          </div>
          <Link href="/events?sort=newest" style={{ fontSize: '0.83rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            더 보기 <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {MOCK.slice(4).map((ev, i) => (
            <Link key={ev.eventId} href={`/events/${ev.eventId}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ display: 'flex', overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ width: 90, height: 100, flexShrink: 0, overflow: 'hidden', background: 'var(--gray-200)' }}>
                  <img
                    src={MOCK[i % 6].posterUrl || `https://images.unsplash.com/photo-150128166874${i}-f7f57925c3b4?w=200&q=80`}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                  />
                </div>
                <div style={{ padding: '0.75rem', flex: 1, minWidth: 0 }}>
                  <span className="badge badge-navy" style={{ marginBottom: '0.35rem', fontSize: '0.63rem' }}>
                    {({ CONCERT:'콘서트', MUSICAL:'뮤지컬', THEATER:'연극', DANCE:'무용' } as Record<string, string>)[ev.category] || ev.category}
                  </span>
                  <p style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ev.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{ev.venue?.name}</p>
                  <p style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary)' }}>{ev.minPrice.toLocaleString()}원~</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
