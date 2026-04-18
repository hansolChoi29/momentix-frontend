'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ticketApi } from '@/lib/api';
import { Ticket } from '@/types';
import { useAuthStore } from '@/store/authStore';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  ISSUED: { label: '발급됨', cls: 'badge-teal' },
  USED: { label: '사용됨', cls: 'badge-gold' },
  CANCELLED: { label: '취소됨', cls: 'badge-crimson' },
};

const MOCK_TICKETS: Ticket[] = [
  {
    ticketId: 1, ticketCode: 'MX-2025-001234',
    event: { eventId: 1, title: '2025 IU HEREH WORLD TOUR IN SEOUL', category: 'CONCERT', status: 'ON_SALE', description: '', venue: { venueId: 1, name: '올림픽 주경기장', address: '서울', capacity: 68000 }, schedules: [], minPrice: 110000, maxPrice: 220000, posterUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80' },
    schedule: { scheduleId: 1, date: '2025-08-15', startTime: '18:00', endTime: '20:30' },
    seat: { seatId: 1, seatNumber: 'A12', row: 'A', grade: 'VIP', price: 165000, status: 'BOOKED' },
    status: 'ISSUED', issuedAt: '2025-04-10T14:30:00',
  },
  {
    ticketId: 2, ticketCode: 'MX-2025-000892',
    event: { eventId: 2, title: '레미제라블 내한공연', category: 'MUSICAL', status: 'UPCOMING', description: '', venue: { venueId: 2, name: 'LG아트센터 서울', address: '서울', capacity: 1200 }, schedules: [], minPrice: 99000, maxPrice: 143000, posterUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80' },
    schedule: { scheduleId: 2, date: '2025-09-01', startTime: '19:30', endTime: '22:00' },
    seat: { seatId: 2, seatNumber: 'R7', row: 'R', grade: 'R', price: 132000, status: 'BOOKED' },
    status: 'ISSUED', issuedAt: '2025-04-08T10:15:00',
  },
  {
    ticketId: 3, ticketCode: 'MX-2024-008821',
    event: { eventId: 3, title: '오페라의 유령', category: 'MUSICAL', status: 'ENDED', description: '', venue: { venueId: 3, name: '블루스퀘어', address: '서울', capacity: 2500 }, schedules: [], minPrice: 110000, maxPrice: 154000, posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
    schedule: { scheduleId: 3, date: '2024-12-24', startTime: '19:00', endTime: '21:30' },
    seat: { seatId: 3, seatNumber: 'S15', row: 'S', grade: 'S', price: 110000, status: 'BOOKED' },
    status: 'USED', issuedAt: '2024-12-10T09:00:00',
  },
];

export default function MyTicketsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [filter, setFilter] = useState<string>('ALL');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    const fetch = async () => {
      setIsLoading(true);
      try {
        const { data } = await ticketApi.myList();
        if (data?.content?.length) setTickets(data.content);
      } catch {}
      setIsLoading(false);
    };
    fetch();
  }, [isAuthenticated, router]);

  const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '4rem' }}>
      <div style={{ background: 'var(--charcoal)', borderBottom: '1px solid var(--muted)' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-xs tracking-widest mb-2" style={{ color: 'var(--gold)', letterSpacing: '0.3em' }}>MY PAGE</p>
          <h1 className="font-display text-4xl font-semibold" style={{ color: 'var(--text-bright)' }}>내 티켓</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* 필터 탭 */}
        <div className="flex gap-1 mb-8 p-1" style={{ background: 'var(--surface)', border: '1px solid var(--muted)', display: 'inline-flex' }}>
          {[{ key: 'ALL', label: '전체' }, { key: 'ISSUED', label: '예정' }, { key: 'USED', label: '사용됨' }, { key: 'CANCELLED', label: '취소됨' }].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-2 text-xs transition-all"
              style={{
                background: filter === f.key ? 'var(--gold)' : 'transparent',
                color: filter === f.key ? 'var(--obsidian)' : 'var(--text-muted)',
                fontWeight: filter === f.key ? 600 : 400,
                letterSpacing: '0.05em',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-5xl mb-4" style={{ color: 'var(--muted)' }}>◇</p>
            <p className="font-display text-xl mb-2" style={{ color: 'var(--text-dim)' }}>티켓이 없습니다</p>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>공연을 예매하고 특별한 순간을 즐겨보세요</p>
            <button onClick={() => router.push('/events')} className="btn-outline">공연 둘러보기</button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(ticket => {
              const st = STATUS_MAP[ticket.status] || { label: ticket.status, cls: '' };
              const isUpcoming = ticket.status === 'ISSUED' && new Date(ticket.schedule.date) > new Date();
              return (
                <div
                  key={ticket.ticketId}
                  className="ticket-card cursor-pointer group"
                  onClick={() => setSelected(selected?.ticketId === ticket.ticketId ? null : ticket)}
                >
                  <div className="flex gap-0">
                    {/* 포스터 */}
                    <div className="relative overflow-hidden flex-shrink-0" style={{ width: '100px' }}>
                      <img src={ticket.event.posterUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&q=80'} alt={ticket.event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ minHeight: '120px' }} />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(24,24,28,0.3))' }} />
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 p-4 pl-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`badge ${st.cls} mr-2`}>{st.label}</span>
                          {isUpcoming && <span className="badge badge-gold">D-{Math.ceil((new Date(ticket.schedule.date).getTime() - Date.now()) / 86400000)}</span>}
                        </div>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{ticket.ticketCode}</span>
                      </div>
                      <h3 className="font-display font-semibold text-base mb-1 transition-colors group-hover:text-gold-gradient" style={{ color: 'var(--text-bright)' }}>
                        {ticket.event.title}
                      </h3>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                        {ticket.event.venue?.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(ticket.schedule.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })} {ticket.schedule.startTime}
                      </p>
                    </div>

                    {/* 좌석 구분선 */}
                    <div className="ticket-perforation flex-shrink-0 px-4 flex flex-col items-center justify-center" style={{ minWidth: '80px' }}>
                      <p className="text-xs text-center mb-1" style={{ color: 'var(--text-muted)' }}>좌석</p>
                      <p className="font-display font-semibold text-center" style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>{ticket.seat.grade}</p>
                      <p className="text-xs text-center" style={{ color: 'var(--text-dim)' }}>{ticket.seat.seatNumber}</p>
                    </div>
                  </div>

                  {/* 확장 패널: QR / 상세 */}
                  {selected?.ticketId === ticket.ticketId && (
                    <div className="animate-fade-in" style={{ borderTop: '1px dashed var(--muted)', padding: '1.5rem', background: 'rgba(201,168,76,0.03)' }}>
                      <div className="flex flex-col md:flex-row gap-8 items-center">
                        {/* QR 코드 영역 */}
                        <div className="flex-shrink-0 text-center">
                          <div className="w-36 h-36 mx-auto mb-2 flex items-center justify-center" style={{ background: 'white', padding: '8px' }}>
                            {/* QR 패턴 */}
                            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                              <rect x="5" y="5" width="35" height="35" stroke="black" strokeWidth="4" fill="none"/>
                              <rect x="13" y="13" width="19" height="19" fill="black"/>
                              <rect x="60" y="5" width="35" height="35" stroke="black" strokeWidth="4" fill="none"/>
                              <rect x="68" y="13" width="19" height="19" fill="black"/>
                              <rect x="5" y="60" width="35" height="35" stroke="black" strokeWidth="4" fill="none"/>
                              <rect x="13" y="68" width="19" height="19" fill="black"/>
                              {[60,65,70,75,80,85,90,60,70,80,90,65,75,85,68,78,88,63,73,83,93].map((x, i) => (
                                <rect key={i} x={x} y={60 + (i % 7) * 5} width="4" height="4" fill={Math.random() > 0.4 ? 'black' : 'none'}/>
                              ))}
                            </svg>
                          </div>
                          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{ticket.ticketCode}</p>
                        </div>
                        {/* 상세 정보 */}
                        <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                          {[
                            { label: '공연명', value: ticket.event.title },
                            { label: '공연장', value: ticket.event.venue?.name },
                            { label: '날짜', value: `${ticket.schedule.date} ${ticket.schedule.startTime}` },
                            { label: '좌석', value: `${ticket.seat.grade}석 ${ticket.seat.seatNumber}` },
                            { label: '가격', value: `${ticket.seat.price.toLocaleString()}원` },
                            { label: '발급일시', value: new Date(ticket.issuedAt).toLocaleString('ko-KR') },
                          ].map(item => (
                            <div key={item.label}>
                              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{item.label}</p>
                              <p style={{ color: 'var(--text-main)' }}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
