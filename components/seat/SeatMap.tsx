'use client';
import { useState } from 'react';
import { Seat, SeatGrade } from '@/types';

interface Props {
  grades: SeatGrade[];
  selectedSeats: number[];
  onSeatToggle: (seatId: number) => void;
  maxSelect?: number;
}

const GRADE_COLORS: Record<string, string> = {
  'VIP': '#C9A84C',
  'R': '#8B1A4A',
  'S': '#1A4A8B',
  'A': '#1A6B6B',
  'B': '#4A3A8B',
};

export default function SeatMap({ grades, selectedSeats, onSeatToggle, maxSelect = 4 }: Props) {
  const [activeGrade, setActiveGrade] = useState<string | null>(null);

  const displayGrades = grades.length > 0 ? grades : [
    { grade: 'VIP', price: 165000, color: '#C9A84C', seats: Array.from({ length: 20 }, (_, i) => ({ seatId: i + 1, seatNumber: `${i + 1}`, row: 'A', grade: 'VIP', price: 165000, status: i % 7 === 0 ? 'BOOKED' : 'AVAILABLE' } as Seat)) },
    { grade: 'R', price: 132000, color: '#8B1A4A', seats: Array.from({ length: 30 }, (_, i) => ({ seatId: i + 21, seatNumber: `${i + 1}`, row: 'B', grade: 'R', price: 132000, status: i % 5 === 0 ? 'BOOKED' : 'AVAILABLE' } as Seat)) },
    { grade: 'S', price: 99000, color: '#1A4A8B', seats: Array.from({ length: 40 }, (_, i) => ({ seatId: i + 51, seatNumber: `${i + 1}`, row: 'C', grade: 'S', price: 99000, status: i % 4 === 0 ? 'BOOKED' : 'AVAILABLE' } as Seat)) },
    { grade: 'A', price: 77000, color: '#1A6B6B', seats: Array.from({ length: 50 }, (_, i) => ({ seatId: i + 91, seatNumber: `${i + 1}`, row: 'D', grade: 'A', price: 77000, status: i % 3 === 0 ? 'BOOKED' : 'AVAILABLE' } as Seat)) },
  ];

  const filteredGrades = activeGrade ? displayGrades.filter(g => g.grade === activeGrade) : displayGrades;

  return (
    <div>
      {/* 무대 */}
      <div className="text-center mb-8">
        <div
          className="inline-block px-16 py-3 text-xs tracking-widest font-semibold"
          style={{
            background: 'linear-gradient(180deg, rgba(201,168,76,0.15) 0%, transparent 100%)',
            border: '1px solid var(--gold-dim)',
            color: 'var(--gold)',
            letterSpacing: '0.3em',
          }}
        >
          S T A G E
        </div>
      </div>

      {/* 등급 필터 */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveGrade(null)}
          className="text-xs px-3 py-1.5 transition-all"
          style={{
            background: !activeGrade ? 'rgba(201,168,76,0.15)' : 'transparent',
            border: `1px solid ${!activeGrade ? 'var(--gold-dim)' : 'var(--muted)'}`,
            color: !activeGrade ? 'var(--gold)' : 'var(--text-muted)',
          }}
        >
          전체
        </button>
        {displayGrades.map(g => (
          <button
            key={g.grade}
            onClick={() => setActiveGrade(activeGrade === g.grade ? null : g.grade)}
            className="text-xs px-3 py-1.5 transition-all flex items-center gap-2"
            style={{
              background: activeGrade === g.grade ? `${GRADE_COLORS[g.grade] || g.color}22` : 'transparent',
              border: `1px solid ${activeGrade === g.grade ? (GRADE_COLORS[g.grade] || g.color) : 'var(--muted)'}`,
              color: activeGrade === g.grade ? (GRADE_COLORS[g.grade] || g.color) : 'var(--text-muted)',
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: GRADE_COLORS[g.grade] || g.color }} />
            {g.grade}석 {(g.price ?? 0).toLocaleString()}원
          </button>
        ))}
      </div>

      {/* 좌석 지도 */}
      <div className="space-y-4 overflow-x-auto pb-4">
        {filteredGrades.map(grade => {
          const chunkSize = grade.grade === 'VIP' ? 10 : grade.grade === 'R' ? 15 : 20;
          const chunks: Seat[][] = [];
          for (let i = 0; i < grade.seats.length; i += chunkSize) chunks.push(grade.seats.slice(i, i + chunkSize));
          const color = GRADE_COLORS[grade.grade] || grade.color;

          return (
            <div key={grade.grade}>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-xs font-semibold tracking-widest" style={{ color, letterSpacing: '0.15em' }}>
                  {grade.grade}석 — {grade.price.toLocaleString()}원
                </span>
              </div>
              <div className="space-y-1.5">
                {chunks.map((row, ri) => (
                  <div key={ri} className="flex gap-1 justify-center">
                    {row.map(seat => {
                      const isSelected = selectedSeats.includes(seat.seatId);
                      const isBooked = seat.status !== 'AVAILABLE';
                      const isMaxed = selectedSeats.length >= maxSelect && !isSelected;
                      return (
                        <button
                          key={seat.seatId}
                          disabled={isBooked || isMaxed}
                          onClick={() => onSeatToggle(seat.seatId)}
                          className="seat"
                          title={`${grade.grade}${seat.seatNumber}`}
                          style={
                            isBooked
                              ? { background: 'var(--muted)', borderColor: 'var(--muted)', cursor: 'not-allowed', opacity: 0.4 }
                              : isSelected
                              ? { background: color, borderColor: color, color: 'var(--obsidian)', fontWeight: 700 }
                              : isMaxed
                              ? { background: 'var(--surface-2)', borderColor: 'var(--muted)', cursor: 'not-allowed', opacity: 0.5 }
                              : { background: 'var(--surface-2)', borderColor: 'var(--muted)', color: 'var(--text-muted)' }
                          }
                        >
                          {seat.seatNumber}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex gap-6 mt-6 justify-center flex-wrap">
        {[
          { label: '선택 가능', style: { background: 'var(--surface-2)', borderColor: 'var(--muted)' } },
          { label: '선택됨', style: { background: 'var(--gold)', borderColor: 'var(--gold)' } },
          { label: '매진', style: { background: 'var(--muted)', opacity: 0.4, borderColor: 'var(--muted)' } },
        ].map(({ label, style }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-6 h-5 rounded-sm border" style={style} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
