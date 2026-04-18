'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SeatMap from '@/components/seat/SeatMap';
import { eventApi, reservationApi } from '@/lib/api';
import { Event, EventSchedule, SeatGrade } from '@/types';
import { useAuthStore } from '@/store/authStore';

const MOCK: Event = {
  eventId:1, title:'2025 IU HEREH WORLD TOUR IN SEOUL',
  description:`아이유의 세 번째 단독 월드투어 "HEREH"가 서울에서 펼쳐집니다.\n\n데뷔 17주년을 맞아 기획된 이번 투어는 아이유의 전 음악 커리어를 아우르는 특별한 무대로 구성됩니다.\n화려한 퍼포먼스와 함께 팬들에게 잊지 못할 추억을 선사할 예정입니다.\n\n공연 시간: 약 150분 (인터미션 없음)\n관람 연령: 만 7세 이상`,
  category:'CONCERT', status:'ON_SALE',
  posterUrl:'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=90',
  venue:{ venueId:1, name:'올림픽 주경기장', address:'서울특별시 송파구 올림픽로 25', capacity:68000 },
  schedules:[
    { scheduleId:1, date:'2025-08-15', startTime:'18:00', endTime:'20:30' },
    { scheduleId:2, date:'2025-08-16', startTime:'18:00', endTime:'20:30' },
    { scheduleId:3, date:'2025-08-17', startTime:'17:00', endTime:'19:30' },
  ],
  minPrice:100, maxPrice:100, runningTime:150,
  rating:'전체 관람가', hostName:'카카오엔터테인먼트', tags:['아이유','IU','콘서트'],
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [event, setEvent] = useState<Event>(MOCK);
  const [selSched, setSelSched] = useState<EventSchedule | null>(null);
  const [grades, setGrades] = useState<SeatGrade[]>([]);
  const [selSeats, setSelSeats] = useState<number[]>([]);
  const [step, setStep] = useState<'info'|'seat'|'done'>('info');
  const [tab, setTab] = useState<'info'|'venue'|'notice'>('info');
  const [loading, setLoading] = useState(false);
  const img = event.posterUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=90';



const pickSched = async (s: EventSchedule) => {
  setSelSched(s);
  setStep('seat');

  setGrades([
    {
      grade: 'R',
      color: '#FF4B6E',
      price: 220000,
      seats: Array.from({ length: 20 }, (_, i) => ({
        seatId: i + 1,
        seatNumber: String(i + 1),
        row: 'R',
        grade: 'R',
        price: 220000,
        status: i % 5 === 0 ? 'RESERVED' : 'AVAILABLE',
      })),
    },
    {
      grade: 'S',
      color: '#5B8CFF',
      price: 165000,
      seats: Array.from({ length: 20 }, (_, i) => ({
        seatId: i + 101,
        seatNumber: String(i + 1),
        row: 'S',
        grade: 'S',
        price: 165000,
        status: i % 6 === 0 ? 'RESERVED' : 'AVAILABLE',
      })),
    },
  ]);
};

const handleReserve = async () => {
  if (!isAuthenticated) {
    router.push('/login');
    return;
  }

  if (!selSched || !selSeats.length) return;

  // 지금은 백엔드 reservation API 구조가 프론트와 안 맞으니,
  // UX 확인용으로 바로 결제 페이지 이동
  const fakeReservationId = 9999;
  const amount = event.minPrice * selSeats.length;

  router.push(`/payment/${fakeReservationId}?amount=${amount}`);
};

  if (step === 'done') return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="anim-up card" style={{ padding: '3rem 2.5rem', textAlign: 'center', maxWidth: 400, width: '100%' }}>
        <div style={{ width: 64, height: 64, background: 'var(--primary-bg)', borderRadius: '50%', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="30" height="30" fill="none" stroke="var(--primary)" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>예매 완료!</h2>
        <p style={{ color: 'var(--text-sub)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{event.title}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>{selSched?.date} {selSched?.startTime} · {selSeats.length}매</p>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link href="/my/tickets" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>내 티켓 보기</Link>
          <Link href="/events" className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>계속 보기</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-100)' }}>
      {/* 상단 이미지 배너 */}
      <div style={{ background: '#000', height: 320, position: 'relative', overflow: 'hidden' }}>
        <img src={img} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem 1.75rem', width: '100%' }}>
            <span className="badge badge-red" style={{ marginBottom: '0.6rem' }}>
              {{
                CONCERT: '콘서트',
                MUSICAL: '뮤지컬',
                PLAY: '연극',
                CLASSIC: '클래식',
              }[event.category] || event.category}
            </span>
            <h1 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#fff', marginBottom: '0.4rem', maxWidth: 680, lineHeight: 1.2 }}>{event.title}</h1>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{event.venue?.name} · {event.runningTime}분 · {event.rating}</p>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

          {/* 좌측 */}
          <div>
            {step === 'info' && (
              <div className="card">
                {/* 탭 */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', padding: '0 1.25rem' }}>
                  {(['info','venue','notice'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`tab-btn ${tab === t ? 'active' : ''}`}>
                      {t === 'info' ? '공연 정보' : t === 'venue' ? '공연장 안내' : '유의사항'}
                    </button>
                  ))}
                </div>

                <div style={{ padding: '1.5rem' }}>
                  {tab === 'info' && (
                    <div className="anim-in">
                      <img src={img} alt="" style={{ width: '100%', maxHeight: 340, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }} />
                      <p style={{ fontSize: '0.9rem', lineHeight: 1.85, color: 'var(--text-sub)', whiteSpace: 'pre-line' }}>{event.description}</p>
                      {event.tags && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                          {event.tags.map(t => <span key={t} className="badge badge-navy" style={{ fontSize: '0.72rem' }}>#{t}</span>)}
                        </div>
                      )}
                    </div>
                  )}
                  {tab === 'venue' && (
                    <div className="anim-in" style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', padding: '1.25rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{event.venue?.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{event.venue?.address}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>수용 인원: {event.venue?.capacity?.toLocaleString()}명</p>
                    </div>
                  )}
                  {tab === 'notice' && (
                    <div className="anim-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {['티켓은 예매 후 마이페이지에서 확인 가능합니다.','공연 시작 후 30분 경과 시 입장이 제한될 수 있습니다.','음식물 반입은 허용되지 않습니다.','사진/영상 촬영은 금지됩니다.','취소 및 환불은 공연일 3일 전까지 가능합니다.'].map((n, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.87rem', color: 'var(--text-sub)', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>·</span>{n}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'seat' && selSched && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    aria-label="뒤로가기"
                    onClick={() => {
                      setStep('info');
                      setSelSeats([]);
                      setSelSched(null);
                    }}
                    style={{
                      background: 'var(--gray-100)',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      padding: '0.4rem',
                      display: 'flex'
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M15.75 19.5L8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1rem' }}>좌석 선택</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(selSched.date).toLocaleDateString('ko-KR')} {selSched.startTime}</p>
                  </div>
                </div>
                <SeatMap
                  grades={grades}
                  selectedSeats={selSeats}
                  onSeatToggle={(seatId) =>
                    setSelSeats((prev) =>
                      prev.includes(seatId)
                        ? prev.filter((x) => x !== seatId)
                        : [...prev, seatId]
                    )
                  }
                  maxSelect={4}
                />
              </div>
            )}
          </div>

          {/* 우측 예매 패널 */}
          <div style={{ position: 'sticky', top: 76 }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              {/* 포스터 썸네일 */}
              <div style={{ height: 160, overflow: 'hidden' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ padding: '1.1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem', lineHeight: 1.35 }}>{event.title}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>{event.venue?.name}</p>

                <div style={{ background: 'var(--primary-bg)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>최저가</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>{event.minPrice.toLocaleString()}원~</span>
                </div>

                {/* 날짜 선택 */}
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>날짜 선택</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                  {event.schedules.map(s => {
                    const active = selSched?.scheduleId === s.scheduleId;
                    return (
                      <button key={s.scheduleId} onClick={() => pickSched(s)} style={{
                        textAlign: 'left', padding: '0.7rem 0.85rem',
                        background: active ? 'var(--primary-bg)' : 'var(--gray-100)',
                        border: `1.5px solid ${active ? 'var(--primary)' : 'transparent'}`,
                        borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--gray-200)'; }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--gray-100)'; }}
                      >
                        <p style={{ fontSize: '0.85rem', fontWeight: active ? 700 : 500, color: active ? 'var(--primary)' : 'var(--text-main)', marginBottom: 2 }}>
                          {new Date(s.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: active ? 'var(--primary-lt)' : 'var(--text-muted)' }}>{s.startTime} ~ {s.endTime}</p>
                      </button>
                    );
                  })}
                </div>

                {selSeats.length > 0 && (
                  <div style={{ background: 'var(--gray-100)', borderRadius: 8, padding: '0.6rem 0.85rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>선택 좌석</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>{selSeats.length}매</span>
                  </div>
                )}

                {step === 'seat' && selSeats.length > 0 ? (
                  <button onClick={handleReserve} disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.9rem' }}>
                    {loading ? '처리 중...' : `${selSeats.length}매 예매하기`}
                  </button>
                ) : (
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.9rem', opacity: 0.5, cursor: 'default' }} disabled>
                    날짜를 선택해주세요
                  </button>
                )}

                {event.hostName && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>주최: {event.hostName}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.detail-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
