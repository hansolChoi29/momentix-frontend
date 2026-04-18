'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { reservationApi } from '@/lib/api';
import { Reservation } from '@/types';
import { useAuthStore } from '@/store/authStore';

const MOCK_RESERVATIONS: Reservation[] = [
  {
    reservationId: 1,
    event: { eventId: 1, title: '2025 IU HEREH WORLD TOUR IN SEOUL', category: 'CONCERT', status: 'ON_SALE', description: '', venue: { venueId: 1, name: '올림픽 주경기장', address: '서울', capacity: 68000 }, schedules: [], minPrice: 110000, maxPrice: 220000, posterUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80' },
    schedule: { scheduleId: 1, date: '2025-08-15', startTime: '18:00', endTime: '20:30' },
    seat: { seatId: 1, seatNumber: 'A12', row: 'A', grade: 'VIP', price: 165000, status: 'BOOKED' },
    status: 'CONFIRMED', createdAt: '2025-04-10T14:30:00',
  },
  {
    reservationId: 2,
    event: { eventId: 2, title: '레미제라블 내한공연', category: 'MUSICAL', status: 'UPCOMING', description: '', venue: { venueId: 2, name: 'LG아트센터 서울', address: '서울', capacity: 1200 }, schedules: [], minPrice: 99000, maxPrice: 143000, posterUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80' },
    schedule: { scheduleId: 2, date: '2025-09-01', startTime: '19:30', endTime: '22:00' },
    seat: { seatId: 2, seatNumber: 'R7', row: 'R', grade: 'R', price: 132000, status: 'BOOKED' },
    status: 'PAYMENT_PENDING', createdAt: '2025-04-12T09:20:00',
  },
];

const STATUS_INFO: Record<string, { label: string; cls: string }> = {
  CONFIRMED: { label: '결제 완료', cls: 'badge-teal' },
  PAYMENT_PENDING: { label: '결제 대기', cls: 'badge-gold' },
  CANCELLED: { label: '취소됨', cls: 'badge-crimson' },
};

export default function MyReservationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [cancelId, setCancelId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    const fetch = async () => {
      try {
        const { data } = await reservationApi.myList();
        if (data?.length) setReservations(data);
      } catch {}
    };
    fetch();
  }, [isAuthenticated, router]);

  const handleCancel = async (id: number) => {
    if (!confirm('예매를 취소하시겠습니까? 취소 수수료가 발생할 수 있습니다.')) return;
    try {
      await reservationApi.cancel(id);
      setReservations(prev => prev.map(r => r.reservationId === id ? { ...r, status: 'CANCELLED' } : r));
    } catch (e: any) {
      alert(e.response?.data?.message || '취소에 실패했습니다.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '4rem' }}>
      <div style={{ background: 'var(--charcoal)', borderBottom: '1px solid var(--muted)' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-xs tracking-widest mb-2" style={{ color: 'var(--gold)', letterSpacing: '0.3em' }}>MY PAGE</p>
          <h1 className="font-display text-4xl font-semibold" style={{ color: 'var(--text-bright)' }}>예매 내역</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {reservations.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-5xl mb-4" style={{ color: 'var(--muted)' }}>◇</p>
            <p className="font-display text-xl mb-2" style={{ color: 'var(--text-dim)' }}>예매 내역이 없습니다</p>
            <button onClick={() => router.push('/events')} className="btn-outline mt-6">공연 둘러보기</button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map(r => {
              const st = STATUS_INFO[r.status] || { label: r.status, cls: '' };
              const canCancel = r.status !== 'CANCELLED' && new Date(r.schedule.date) > new Date();
              return (
                <div key={r.reservationId} className="card p-0 overflow-hidden">
                  <div className="flex gap-0">
                    <div className="relative overflow-hidden flex-shrink-0" style={{ width: '90px' }}>
                      <img src={r.event.posterUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&q=80'} alt={r.event.title} className="w-full h-full object-cover" style={{ minHeight: '110px' }} />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`badge ${st.cls}`}>{st.label}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(r.createdAt).toLocaleDateString('ko-KR')} 예매
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-sm mb-1" style={{ color: 'var(--text-bright)' }}>{r.event.title}</h3>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                        {r.event.venue?.name} · {r.schedule.date} {r.schedule.startTime}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-4">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {r.seat.grade}석 {r.seat.seatNumber}
                          </span>
                          <span className="font-display font-semibold" style={{ color: 'var(--gold)', fontSize: '0.95rem' }}>
                            {r.seat.price.toLocaleString()}원
                          </span>
                        </div>
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(r.reservationId)}
                            className="text-xs px-3 py-1.5 transition-all"
                            style={{ border: '1px solid rgba(139,26,26,0.4)', color: '#E07070', background: 'transparent' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,26,26,0.15)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          >
                            예매 취소
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
