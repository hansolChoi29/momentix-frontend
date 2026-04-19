'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { paymentApi, ticketApi } from '@/lib/api';
import { Ticket } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { isDemoMode } from '@/lib/demo';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  ISSUED: { label: '발급 완료', cls: 'badge-teal' },
  USED: { label: '사용 완료', cls: 'badge-gold' },
  CANCELLED: { label: '결제 취소', cls: 'badge-crimson' },
};

type RawTicket = Record<string, unknown>;

function normalizeTicket(raw: RawTicket, index: number): Ticket {
  const paymentId = Number(raw.paymentHistoryId ?? raw.paymentId ?? 0) || undefined;
  const ticketId = Number(raw.ticketId ?? raw.id ?? index + 1);
  const scheduleDate = String(raw.eventDate ?? raw.scheduleDate ?? '2026-08-15');
  const scheduleTime = String(raw.eventTime ?? raw.startTime ?? '18:00');

  return {
    ticketId,
    ticketCode: String(raw.ticketCode ?? raw.ticketNumber ?? `MX-${ticketId}`),
    paymentHistoryId: paymentId,
    paymentId,
    paymentMethod: String(raw.paymentMethod ?? 'CARD'),
    event: {
      eventId: Number(raw.eventId ?? 0) || ticketId,
      title: String(raw.eventTitle ?? '공연 정보'),
      category: 'CONCERT',
      status: 'ON_SALE',
      description: '',
      venue: {
        venueId: Number(raw.venueId ?? 1),
        name: String(raw.venueName ?? '공연장'),
        address: String(raw.venueAddress ?? ''),
        capacity: undefined,
      },
      schedules: [],
      minPrice: Number(raw.price ?? 0),
      maxPrice: Number(raw.price ?? 0),
      posterUrl: String(raw.posterUrl ?? 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80'),
    },
    schedule: {
      scheduleId: Number(raw.scheduleId ?? 1),
      date: scheduleDate,
      startTime: scheduleTime,
      endTime: '',
    },
    seat: {
      seatId: Number(raw.seatId ?? 0) || ticketId,
      seatNumber: String(raw.seatNumber ?? '1'),
      row: String(raw.seatRow ?? 'A'),
      grade: String(raw.seatGrade ?? 'R'),
      price: Number(raw.price ?? 0),
      status: 'BOOKED',
    },
    status: (String(raw.ticketStatus ?? raw.status ?? 'ISSUED').toUpperCase() as Ticket['status']) ?? 'ISSUED',
    issuedAt: String(raw.issuedAt ?? new Date().toISOString()),
  };
}

export default function MyTicketsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [nowTs] = useState(() => Date.now());

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const { data } = await ticketApi.myList();
        const source = data?.content ?? data ?? [];
        if (Array.isArray(source)) {
          const normalized = source.map((item: unknown, index: number) =>
            normalizeTicket((item ?? {}) as RawTicket, index)
          );
          setTickets(normalized);
        } else {
          setTickets([]);
        }
      } catch {
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTickets();
  }, [isAuthenticated, router]);

  const filtered = useMemo(
    () => (filter === 'ALL' ? tickets : tickets.filter((ticket) => ticket.status === filter)),
    [filter, tickets]
  );

  const handleCancelPayment = async (ticket: Ticket) => {
    if (ticket.status === 'CANCELLED') return;
    if (!confirm('결제를 취소하시겠습니까?')) return;

    setCancelingId(ticket.ticketId);
    try {
      if (isDemoMode) {
        setTickets((prev) =>
          prev.map((item) =>
            item.ticketId === ticket.ticketId
              ? { ...item, status: 'CANCELLED', refundedAt: new Date().toISOString() }
              : item
          )
        );
        return;
      }

      const paymentId = ticket.paymentHistoryId ?? ticket.paymentId;
      if (!paymentId) {
        alert('결제 정보가 없어 취소할 수 없습니다. 결제 상세에서 다시 시도해주세요.');
        return;
      }

      await paymentApi.cancel(paymentId);

      setTickets((prev) =>
        prev.map((item) =>
          item.ticketId === ticket.ticketId
            ? { ...item, status: 'CANCELLED', refundedAt: new Date().toISOString() }
            : item
        )
      );
    } catch (e: unknown) {
      const apiError = e as { response?: { data?: { message?: string } } };
      alert(apiError.response?.data?.message || '결제 취소에 실패했습니다.');
    } finally {
      setCancelingId(null);
    }
  };

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
        <h1 style={{ marginTop: '0.35rem', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>내 티켓</h1>
        <p style={{ marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          발급된 티켓과 결제 상태를 확인하고, 필요 시 결제 취소를 진행할 수 있습니다.
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem 1.3rem 2.4rem' }}>
        <div style={{ display: 'inline-flex', gap: '0.35rem', padding: '0.25rem', borderRadius: 999, background: '#fff', border: '1px solid var(--gray-200)', marginBottom: '1rem' }}>
          {[{ key: 'ALL', label: '전체' }, { key: 'ISSUED', label: '발급' }, { key: 'USED', label: '사용' }, { key: 'CANCELLED', label: '취소' }].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              style={{
                border: 'none',
                cursor: 'pointer',
                borderRadius: 999,
                padding: '0.5rem 0.95rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: filter === item.key ? 'var(--primary)' : 'transparent',
                color: filter === item.key ? '#fff' : 'var(--text-muted)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 120 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '3rem 1.2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-sub)', fontSize: '1rem', fontWeight: 700 }}>표시할 티켓이 없습니다.</p>
            <button onClick={() => router.push('/events')} className="btn-outline" style={{ marginTop: '0.9rem' }}>
              공연 보러가기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ticket) => {
              const statusInfo = STATUS_MAP[ticket.status] || { label: ticket.status, cls: '' };
              const selected = selectedId === ticket.ticketId;
              const paymentId = ticket.paymentHistoryId ?? ticket.paymentId;
              const isUpcoming = ticket.status === 'ISSUED' && new Date(ticket.schedule.date) > new Date(nowTs);

              return (
                <article
                  key={ticket.ticketId}
                  className="card"
                  style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 24px rgba(26,26,62,0.06)' }}
                >
                  <div
                    onClick={() => setSelectedId((prev) => (prev === ticket.ticketId ? null : ticket.ticketId))}
                    style={{ display: 'grid', gridTemplateColumns: '94px 1fr 84px', cursor: 'pointer' }}
                  >
                    <div style={{ height: '100%', minHeight: 122, position: 'relative', overflow: 'hidden' }}>
                      <img
                        src={ticket.event.posterUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&q=80'}
                        alt={ticket.event.title}
                        className="w-full h-full object-cover"
                        style={{ minHeight: 122 }}
                      />
                    </div>

                    <div style={{ padding: '1rem 1.1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                          {isUpcoming && (
                            <span className="badge badge-gold">
                              D-{Math.ceil((new Date(ticket.schedule.date).getTime() - nowTs) / 86400000)}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                          {ticket.ticketCode}
                        </span>
                      </div>

                      <h3 style={{ marginTop: '0.45rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{ticket.event.title}</h3>
                      <p style={{ marginTop: '0.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {ticket.event.venue?.name}
                      </p>
                      <p style={{ marginTop: '0.15rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(ticket.schedule.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}{' '}
                        {ticket.schedule.startTime}
                      </p>
                    </div>

                    <div style={{ borderLeft: '1px dashed var(--gray-300)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0.5rem' }}>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>좌석</p>
                      <p style={{ marginTop: '0.1rem', fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>{ticket.seat.grade}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{ticket.seat.seatNumber}</p>
                    </div>
                  </div>

                  {selected && (
                    <div style={{ borderTop: '1px dashed var(--gray-300)', padding: '1rem 1.1rem 1.1rem', background: '#fff' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.8rem' }}>
                        <div style={{ border: '1px solid var(--gray-200)', borderRadius: 10, padding: '0.75rem' }}>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>결제수단</p>
                          <p style={{ marginTop: '0.2rem', fontWeight: 700 }}>{ticket.paymentMethod || 'CARD'}</p>
                        </div>
                        <div style={{ border: '1px solid var(--gray-200)', borderRadius: 10, padding: '0.75rem' }}>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>결제금액</p>
                          <p style={{ marginTop: '0.2rem', fontWeight: 700 }}>{ticket.seat.price.toLocaleString()}원</p>
                        </div>
                      </div>

                      <div style={{ background: '#FFF9F0', border: '1px solid #FFD899', borderRadius: 10, padding: '0.8rem 0.95rem', marginBottom: '0.85rem' }}>
                        <p style={{ fontSize: '0.82rem', color: '#996600', lineHeight: 1.7 }}>
                          결제 취소 시 결제하신 수단으로 영업일 기준 3일 이내 환불 처리됩니다.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                        {paymentId && (
                          <Link href={`/my/payments/${paymentId}`} className="btn-outline" style={{ padding: '0.52rem 0.88rem', fontSize: '0.79rem' }} onClick={(e) => e.stopPropagation()}>
                            결제 상세 보기
                          </Link>
                        )}

                        {ticket.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '0.52rem 0.88rem', fontSize: '0.79rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleCancelPayment(ticket);
                            }}
                            disabled={cancelingId === ticket.ticketId}
                          >
                            {cancelingId === ticket.ticketId ? '취소 처리 중...' : '결제 취소'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
