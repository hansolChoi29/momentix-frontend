'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import EventCard from '@/components/event/EventCard';
import { eventApi } from '@/lib/api';
import { Event } from '@/types';

const CATS = [
  { key:'', label:'전체' },{ key:'CONCERT', label:'콘서트' },{ key:'MUSICAL', label:'뮤지컬' },
  { key:'THEATER', label:'연극' },{ key:'DANCE', label:'무용' },{ key:'EXHIBITION', label:'전시' },{ key:'SPORT', label:'스포츠' },
];
const SORTS = [
  { key:'newest', label:'최신순' },{ key:'popular', label:'인기순' },{ key:'price_asc', label:'가격 낮은순' },{ key:'price_desc', label:'가격 높은순' },
];
const MOCK: Event[] = Array.from({ length: 16 }, (_, i) => ({
  eventId: i+1,
  title: ['2025 IU HEREH','레미제라블','오페라의 유령','호두까기 인형','Coldplay','지킬앤하이드','베르사유의 장미','갈라파고스','맘마미아','브로드웨이42번가','시카고','캣츠','위키드','헤어스프레이','빌리 엘리어트','노트르담 드 파리'][i],
  description: '', category: ['CONCERT','MUSICAL','MUSICAL','DANCE','CONCERT','MUSICAL','MUSICAL','THEATER','MUSICAL','MUSICAL','MUSICAL','MUSICAL','MUSICAL','MUSICAL','MUSICAL','MUSICAL'][i] as Event['category'],
  status: ['ON_SALE','UPCOMING','ON_SALE','ON_SALE','SOLD_OUT','ON_SALE','UPCOMING','ON_SALE','ON_SALE','ON_SALE','UPCOMING','ON_SALE','ON_SALE','SOLD_OUT','ON_SALE','ON_SALE'][i] as Event['status'],
  venue: { venueId:i, name:['올림픽 주경기장','LG아트센터','블루스퀘어','예술의전당','고척돔','세종문화회관','국립극장','대학로','성남아트센터','광림아트센터','예술의전당','국립극장','충무아트센터','부산문화회관','대전예술의전당','인천문화예술회관'][i], address:'서울', capacity:5000 },
  schedules: [{ scheduleId:i, date:`2025-${String((i%12)+1).padStart(2,'0')}-15`, startTime:'19:30', endTime:'21:30' }],
  minPrice: [165000,99000,110000,88000,143000,77000,99000,44000,99000,88000,110000,77000,121000,66000,99000,110000][i], maxPrice:200000,
}));

export default function EventsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>(MOCK);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(2);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const filtered = category ? events.filter(e => e.category === category) : events;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await eventApi.list({ category: category || undefined, sort, page, size: 16 });
      if (data?.content?.length) { setEvents(data.content); setTotalPages(data.totalPages || 2); }
    } catch {}
    setLoading(false);
  }, [category, sort, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const setFilter = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    router.push(`/events?${p.toString()}`);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* 페이지 헤더 */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)', padding: '1.25rem 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>전체 공연</h1>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem' }}>
        {/* 필터 바 */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {CATS.map(c => {
              const active = category === c.key;
              return (
                <button key={c.key} onClick={() => setFilter('category', c.key)} style={{
                  padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontFamily: 'inherit',
                  background: active ? 'var(--primary)' : 'var(--gray-100)',
                  color: active ? '#fff' : 'var(--text-sub)',
                  border: 'none', borderRadius: 100,
                  fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--gray-200)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--gray-100)'; }}>
                  {c.label}
                </button>
              );
            })}
          </div>
          <select value={sort} onChange={e => setFilter('sort', e.target.value)} style={{
            background: 'var(--gray-100)', border: 'none', borderRadius: 6, padding: '0.4rem 0.75rem',
            fontSize: '0.82rem', color: 'var(--text-sub)', cursor: 'pointer', fontFamily: 'inherit', outline: 'none', fontWeight: 500,
          }}>
            {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          총 <strong style={{ color: 'var(--text-main)' }}>{filtered.length}</strong>개 공연
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ paddingBottom: '150%' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
            {filtered.map((ev, i) => (
              <div key={ev.eventId} className={`anim-up d${Math.min(i+1,8)}`}>
                <EventCard event={ev} index={i} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginTop: '2.5rem' }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)} style={{
                width: 36, height: 36, fontSize: '0.85rem', fontFamily: 'inherit',
                background: page === i ? 'var(--primary)' : '#fff',
                border: `1px solid ${page === i ? 'var(--primary)' : 'var(--gray-300)'}`,
                borderRadius: 6, color: page === i ? '#fff' : 'var(--text-sub)',
                fontWeight: page === i ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {i+1}
              </button>
            ))}
          </div>
        )}
      </div>
      <style>{`@media(max-width:1024px){div[style*="repeat(4,1fr)"]{grid-template-columns:repeat(3,1fr)!important}}@media(max-width:640px){div[style*="repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr)!important}}`}</style>
    </div>
  );
}
