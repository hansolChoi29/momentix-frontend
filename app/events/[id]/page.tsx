'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SeatMap from '@/components/seat/SeatMap';
import { Event, EventSchedule, SeatGrade } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { getDemoBookedSeatIds, isDemoMode } from '@/lib/demo';
import { eventApi, reservationApi } from '@/lib/api';
import { getCachedExternalEvent, normalizeEventSource } from '@/lib/events';

const MOCK: Event = {
  eventId: 1,
  title: '2025 IU HEREH WORLD TOUR IN SEOUL',
  description:
    '아이유의 월드 투어 서울 공연입니다. 좌석 선택 후 결제까지 기존 플로우를 확인할 수 있습니다.',
  category: 'CONCERT',
  status: 'ON_SALE',
  posterUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=90',
  venue: {
    venueId: 1,
    name: '올림픽 주경기장',
    address: '서울 송파구 올림픽로 25',
    capacity: 68000,
  },
  schedules: [
    { scheduleId: 1, date: '2025-08-15', startTime: '18:00', endTime: '20:30' },
    { scheduleId: 2, date: '2025-08-16', startTime: '18:00', endTime: '20:30' },
    { scheduleId: 3, date: '2025-08-17', startTime: '17:00', endTime: '19:30' },
  ],
  minPrice: 100,
  maxPrice: 100,
  runningTime: 150,
  rating: '전체 관람가',
  hostName: '카카오엔터테인먼트',
  tags: ['아이유', 'IU', '콘서트'],
};

type SeatApiItem = {
  id?: number;
  seatGradeType?: string;
  seatPrice?: number | string;
  seatReserveStatus?: string;
  seatRow?: number;
  seatCol?: number;
};

function unwrapResponse<T>(payload: unknown): T {
  const source = payload as { data?: unknown };
  return (source?.data ?? source) as T;
}

function ensureSchedules(event: Event): Event {
  if (Array.isArray(event.schedules) && event.schedules.length > 0) {
    return event;
  }

  const today = new Date().toISOString().slice(0, 10);
  return {
    ...event,
    schedules: [
      {
        scheduleId: 1,
        date: today,
        startTime: '',
        endTime: '',
      },
    ],
  };
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  const [event, setEvent] = useState<Event>(MOCK);
  const [selSched, setSelSched] = useState<EventSchedule | null>(null);
  const [grades, setGrades] = useState<SeatGrade[]>([]);
  const [selSeats, setSelSeats] = useState<number[]>([]);
  const [step, setStep] = useState<'info' | 'seat' | 'done'>('info');
  const [tab, setTab] = useState<'info' | 'venue' | 'notice'>('info');
  const [loading, setLoading] = useState(false);

  const externalEventId = searchParams.get('externalEventId');
  const isExternalEvent =
    normalizeEventSource(searchParams.get('sourceType')) === 'EXTERNAL' &&
    Boolean(externalEventId);
  const img =
    event.posterUrl ||
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=90';

  useEffect(() => {
    if (!isExternalEvent || !externalEventId) return;

    const loadExternalDetail = async () => {
      try {
        const cached = getCachedExternalEvent(externalEventId);
        if (cached) {
          setEvent(ensureSchedules(cached));
        }

        const response = await fetch(
          `/api/external-events/detail?externalEventId=${encodeURIComponent(externalEventId)}`
        );
        if (!response.ok) return;

        const externalEvent = (await response.json()) as Event;
        setEvent(ensureSchedules(externalEvent));
      } catch {
      }
    };

    void loadExternalDetail();
  }, [externalEventId, isExternalEvent]);

  const pickSched = async (s: EventSchedule) => {
    setSelSched(s);
    setSelSeats([]);
    setStep('seat');
    setLoading(true);

    const eventIdNum = Number(id);
    const scheduleIdNum = Number(s.scheduleId);
    const placeIdNum = Number(event.venue?.venueId ?? 1);

    const applyDemoGrades = () => {
      const demoBookedSeatIds = getDemoBookedSeatIds(eventIdNum, scheduleIdNum);

      const applyDemoBooked = (
        seatId: number,
        defaultStatus: 'AVAILABLE' | 'RESERVED'
      ) => (demoBookedSeatIds.includes(seatId) ? 'RESERVED' : defaultStatus);

      setGrades([
        {
          grade: 'R',
          color: '#7c3aed',
          price: event.minPrice + 70000,
          seats: Array.from({ length: 20 }, (_, i) => ({
            seatId: i + 1,
            grade: 'R',
            floor: 1,
            row: String(Math.floor(i / 10) + 1),
            seatNumber: String((i % 10) + 1),
            price: event.minPrice + 70000,
            status: applyDemoBooked(i + 1, i % 5 === 0 ? 'RESERVED' : 'AVAILABLE'),
          })),
        },
        {
          grade: 'S',
          color: '#2563eb',
          price: event.minPrice + 30000,
          seats: Array.from({ length: 30 }, (_, i) => ({
            seatId: 100 + i + 1,
            grade: 'S',
            floor: 1,
            row: String(Math.floor(i / 10) + 1),
            seatNumber: String((i % 10) + 1),
            price: event.minPrice + 30000,
            status: applyDemoBooked(100 + i + 1, i % 7 === 0 ? 'RESERVED' : 'AVAILABLE'),
          })),
        },
        {
          grade: 'A',
          color: '#10b981',
          price: event.minPrice,
          seats: Array.from({ length: 40 }, (_, i) => ({
            seatId: 200 + i + 1,
            grade: 'A',
            floor: 2,
            row: String(Math.floor(i / 10) + 1),
            seatNumber: String((i % 10) + 1),
            price: event.minPrice,
            status: applyDemoBooked(200 + i + 1, i % 8 === 0 ? 'RESERVED' : 'AVAILABLE'),
          })),
        },
      ]);
    };

    if (isDemoMode) {
      applyDemoGrades();
      setLoading(false);
      return;
    }

    try {
      const response = await eventApi.seats(eventIdNum, placeIdNum, scheduleIdNum, {
        page: 0,
        size: 500,
      });
      const pageData = unwrapResponse<{ content?: SeatApiItem[] }>(response.data);
      const seatItems = Array.isArray(pageData?.content) ? pageData.content : [];

      if (seatItems.length > 0) {
        const gradeMap = new Map<string, SeatGrade>();
        for (const seat of seatItems) {
          const grade = seat.seatGradeType ?? 'A';
          const price = Number(seat.seatPrice ?? event.minPrice);

          if (!gradeMap.has(grade)) {
            gradeMap.set(grade, {
              grade,
              price,
              color: '#7c3aed',
              seats: [],
            });
          }

          const rawStatus = String(seat.seatReserveStatus ?? 'AVAILABLE').toUpperCase();
          const status = rawStatus === 'AVAILABLE' ? 'AVAILABLE' : 'RESERVED';

          gradeMap.get(grade)!.seats.push({
            seatId: Number(seat.id ?? 0),
            grade,
            row: String(seat.seatRow ?? ''),
            seatNumber: String(seat.seatCol ?? ''),
            price,
            status,
          });
        }

        setGrades(Array.from(gradeMap.values()));
        return;
      }
    } catch {
      applyDemoGrades();
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!selSched || selSeats.length === 0) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const goDemoPayment = () => {
      const allSeats = grades.flatMap((grade) => grade.seats);
      const amount = selSeats.reduce((total, seatId) => {
        const seat = allSeats.find((item) => item.seatId === seatId);
        return total + Number(seat?.price ?? event.minPrice ?? 0);
      }, 0);
      const seatIds = selSeats.join(',');

      router.push(
        `/payment/9999?amount=${amount}&eventId=${id}&scheduleId=${selSched.scheduleId}&seatIds=${seatIds}&external=${isExternalEvent ? '1' : '0'}`
      );
    };

    if (isDemoMode || isExternalEvent) {
      goDemoPayment();
      return;
    }

    try {
      setLoading(true);

      const eventIdNum = Number(id);
      const placeIdNum = Number(event.venue?.venueId ?? 1);
      const scheduleIdNum = Number(selSched.scheduleId);

      const reservationRes = await reservationApi.selectAll(
        eventIdNum,
        placeIdNum,
        scheduleIdNum
      );
      const reservation = unwrapResponse<{ reservationId?: number }>(reservationRes.data);
      const reservationId = Number(reservation?.reservationId);
      if (!reservationId) throw new Error('reservationId missing');

      for (const seatId of selSeats) {
        await reservationApi.selectSeat(reservationId, seatId);
      }

      const allSeats = grades.flatMap((grade) => grade.seats);
      const amount = selSeats.reduce((total, seatId) => {
        const seat = allSeats.find((item) => item.seatId === seatId);
        return total + Number(seat?.price ?? event.minPrice);
      }, 0);

      router.push(
        `/payment/${reservationId}?amount=${amount}&eventId=${id}&scheduleId=${selSched.scheduleId}&seatIds=${selSeats.join(',')}`
      );
    } catch (e: unknown) {
      const apiError = e as { response?: { status?: number; data?: { message?: string } } };
      if (apiError?.response?.status === 403) {
        goDemoPayment();
        return;
      }

      const message =
        apiError?.response?.data?.message ||
        '좌석 선점 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      alert(message);

      if (selSched) {
        await pickSched(selSched);
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          className="anim-up card"
          style={{ padding: '3rem 2.5rem', textAlign: 'center', maxWidth: 400, width: '100%' }}
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>예매 완료!</h2>
          <p style={{ color: 'var(--text-sub)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{event.title}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            {selSched?.date} {selSched?.startTime} · {selSeats.length}매
          </p>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Link href="/my/tickets" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              내 티켓 보기
            </Link>
            <Link href="/events" className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
              계속 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-100)' }}>
      <div style={{ background: '#000', height: 320, position: 'relative', overflow: 'hidden' }}>
        <img
          src={img}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45)' }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem 1.75rem', width: '100%' }}>
            <span className="badge badge-red" style={{ marginBottom: '0.6rem' }}>
              {{
                CONCERT: '콘서트',
                MUSICAL: '뮤지컬',
                PLAY: '연극',
              }[event.category] || event.category}
            </span>
            <h1
              style={{
                fontSize: 'clamp(1.3rem, 3.5vw, 2.2rem)',
                fontWeight: 800,
                color: '#fff',
                marginBottom: '0.4rem',
                maxWidth: 680,
                lineHeight: 1.2,
              }}
            >
              {event.title}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
              {event.venue?.name} · {event.runningTime}분 · {event.rating}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem' }}>
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            {step === 'info' && (
              <div className="card">
                <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', padding: '0 1.25rem' }}>
                  {(['info', 'venue', 'notice'] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`tab-btn ${tab === t ? 'active' : ''}`}>
                      {t === 'info' ? '공연 정보' : t === 'venue' ? '공연장 안내' : '유의사항'}
                    </button>
                  ))}
                </div>

                <div style={{ padding: '1.5rem' }}>
                  {tab === 'info' && (
                    <div className="anim-in">
                      <img
                        src={img}
                        alt=""
                        style={{
                          width: '100%',
                          maxHeight: 340,
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: '1.25rem',
                        }}
                      />
                      <p style={{ fontSize: '0.9rem', lineHeight: 1.85, color: 'var(--text-sub)', whiteSpace: 'pre-line' }}>
                        {event.description}
                      </p>
                      {event.tags && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                          {event.tags.map((t) => (
                            <span key={t} className="badge badge-navy" style={{ fontSize: '0.72rem' }}>
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {tab === 'venue' && (
                    <div className="anim-in" style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', padding: '1.25rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{event.venue?.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{event.venue?.address}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        수용 인원: {event.venue?.capacity?.toLocaleString()}명
                      </p>
                    </div>
                  )}

                  {tab === 'notice' && (
                    <div className="anim-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        '예매 및 결제 내역은 마이페이지에서 확인 가능합니다.',
                        '공연 시작 30분 전부터 입장이 가능하며, 지연 입장은 제한될 수 있습니다.',
                        '음식물 및 주류 반입은 허용되지 않습니다.',
                        '사진 및 영상 촬영은 현장 정책에 따라 제한될 수 있습니다.',
                        '취소 및 환불 규정은 공연 3일 전까지 적용됩니다.',
                      ].map((n, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.87rem', color: 'var(--text-sub)', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>·</span>
                          {n}
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
                      display: 'flex',
                    }}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M15.75 19.5L8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1rem' }}>좌석 선택</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(selSched.date).toLocaleDateString('ko-KR')} {selSched.startTime}
                    </p>
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

          <div style={{ position: 'sticky', top: 76 }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ height: 160, overflow: 'hidden' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ padding: '1.1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem', lineHeight: 1.35 }}>{event.title}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>{event.venue?.name}</p>

                <div
                  style={{
                    background: 'var(--primary-bg)',
                    borderRadius: 8,
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>최저가</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>{event.minPrice.toLocaleString()}원</span>
                </div>

                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
                  날짜 선택
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                  {event.schedules.map((s) => {
                    const active = selSched?.scheduleId === s.scheduleId;
                    return (
                      <button
                        key={s.scheduleId}
                        onClick={() => pickSched(s)}
                        style={{
                          textAlign: 'left',
                          padding: '0.7rem 0.85rem',
                          background: active ? 'var(--primary-bg)' : 'var(--gray-100)',
                          border: `1.5px solid ${active ? 'var(--primary)' : 'transparent'}`,
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.background = 'var(--gray-200)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.background = 'var(--gray-100)';
                          }
                        }}
                      >
                        <p style={{ fontSize: '0.85rem', fontWeight: active ? 700 : 500, color: active ? 'var(--primary)' : 'var(--text-main)', marginBottom: 2 }}>
                          {new Date(s.date).toLocaleDateString('ko-KR', {
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: active ? 'var(--primary-lt)' : 'var(--text-muted)' }}>
                          {s.startTime} ~ {s.endTime}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {selSeats.length > 0 && (
                  <div
                    style={{
                      background: 'var(--gray-100)',
                      borderRadius: 8,
                      padding: '0.6rem 0.85rem',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>선택 좌석</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>{selSeats.length}매</span>
                  </div>
                )}

                {step === 'seat' && selSeats.length > 0 ? (
                  <button
                    onClick={handleReserve}
                    disabled={loading}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.9rem' }}
                  >
                    {loading ? '처리 중...' : `${selSeats.length}매 예매하기`}
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.9rem', opacity: 0.5, cursor: 'default' }}
                    disabled
                  >
                    날짜를 선택해주세요
                  </button>
                )}

                {event.hostName && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                    주최: {event.hostName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
