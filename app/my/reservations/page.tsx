'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { reservationApi } from '@/lib/api';
import { Reservation } from '@/types';
import { useAuthStore } from '@/store/authStore';

const STATUS_INFO: Record<string, { label: string; cls: string }> = {
  CONFIRMED: { label: '결제 완료', cls: 'badge-teal' },
  PAYMENT_PENDING: { label: '결제 대기', cls: 'badge-gold' },
  CANCELLED: { label: '취소 완료', cls: 'badge-crimson' },
};

export default function MyReservationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const { data } = await reservationApi.myList();
        const list = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
        setReservations(list);
      } catch {
        setReservations([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchReservations();
  }, [isAuthenticated, router]);

  const sortedReservations = useMemo(
    () => [...reservations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reservations]
  );

  const handleCancel = async (id: number) => {
    if (!confirm('예매를 취소하시겠습니까?')) return;

    try {
      await reservationApi.cancel(id);
      setReservations((prev) => prev.map((item) => (item.reservationId === id ? { ...item, status: 'CANCELLED' } : item)));
    } catch (e: unknown) {
      const apiError = e as { response?: { data?: { message?: string } } };
      alert(apiError.response?.data?.message || '예매 취소에 실패했습니다.');
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
        <h1 style={{ marginTop: '0.35rem', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>예매 내역</h1>
        <p style={{ marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          예매 상태를 확인하고, 공연 전에는 예매 취소를 진행할 수 있습니다.
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem 1.3rem 2.4rem' }}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 110 }} />
            ))}
          </div>
        ) : sortedReservations.length === 0 ? (
          <div className="card" style={{ padding: '3rem 1.2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-sub)', fontSize: '1rem', fontWeight: 700 }}>표시할 예매 내역이 없습니다.</p>
            <button onClick={() => router.push('/events')} className="btn-outline" style={{ marginTop: '0.9rem' }}>
              공연 보러가기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedReservations.map((reservation) => {
              const statusInfo = STATUS_INFO[reservation.status] || { label: reservation.status, cls: '' };
              const canCancel = reservation.status !== 'CANCELLED' && new Date(reservation.schedule.date) > new Date();

              return (
                <article
                  key={reservation.reservationId}
                  className="card"
                  style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 24px rgba(26,26,62,0.06)' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '94px 1fr', minHeight: 110 }}>
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <img
                        src={reservation.event.posterUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&q=80'}
                        alt={reservation.event.title}
                        className="w-full h-full object-cover"
                        style={{ minHeight: 110 }}
                      />
                    </div>

                    <div style={{ padding: '1rem 1.1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.8rem' }}>
                        <span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{new Date(reservation.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>

                      <h3 style={{ marginTop: '0.45rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{reservation.event.title}</h3>
                      <p style={{ marginTop: '0.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {reservation.event.venue?.name} · {reservation.schedule.date} {reservation.schedule.startTime}
                      </p>

                      <div style={{ marginTop: '0.55rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                            {reservation.seat.grade}석 {reservation.seat.seatNumber}
                          </span>
                          <span style={{ fontSize: '0.92rem', color: 'var(--primary)', fontWeight: 800 }}>
                            {reservation.seat.price.toLocaleString()}원
                          </span>
                        </div>

                        {canCancel && (
                          <button
                            onClick={() => handleCancel(reservation.reservationId)}
                            style={{
                              border: '1px solid rgba(139,26,26,0.4)',
                              color: '#E07070',
                              background: 'transparent',
                              borderRadius: 8,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: '0.38rem 0.68rem',
                            }}
                          >
                            예매 취소
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
