'use client';

import Link from 'next/link';
import { Event } from '@/types';
import {
  CATEGORY_LABEL,
  normalizeEventCategory,
  normalizeEventSource,
} from '@/lib/events';

const ST: Record<string, { label: string; cls: string }> = {
  ON_SALE: { label: '예매중', cls: 'badge-red' },
  SOLD_OUT: { label: '매진', cls: 'badge-gray' },
  UPCOMING: { label: '오픈예정', cls: 'badge-orange' },
  ENDED: { label: '종료', cls: 'badge-gray' },
  CANCELLED: { label: '취소', cls: 'badge-gray' },
};

const IMGS = [
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
  'https://images.unsplash.com/photo-1574172519799-6b5d7d978cde?w=400&q=80',
  'https://images.unsplash.com/photo-1508997449629-303059a039c0?w=400&q=80',
];

export default function EventCard({
  event,
  index = 0,
}: {
  event: Event;
  index?: number;
}) {
  const st = ST[event.status] || { label: event.status, cls: 'badge-gray' };
  const category = normalizeEventCategory(event.category);
  const sourceType = normalizeEventSource(event.sourceType);
  const img = event.posterUrl || IMGS[index % IMGS.length];
  const date = event.schedules?.[0]?.date;
  const isSoldOut = event.status === 'SOLD_OUT';
  const hasPrice = typeof event.minPrice === 'number' && event.minPrice > 0;
  const href =
    sourceType === 'EXTERNAL' && event.externalEventId
      ? `/events/${event.eventId}?sourceType=EXTERNAL&externalEventId=${event.externalEventId}`
      : `/events/${event.eventId}`;

  return (
    <Link
      href={href}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        className="card"
        style={{
          cursor: 'pointer',
          opacity: isSoldOut ? 0.72 : 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            position: 'relative',
            paddingBottom: '133%',
            overflow: 'hidden',
            background: 'var(--gray-200)',
          }}
        >
          <img
            src={img}
            alt={event.title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
            }}
          />

          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <span className="badge badge-navy" style={{ fontSize: '0.65rem' }}>
              {CATEGORY_LABEL[category]}
            </span>
          </div>

          <div style={{ position: 'absolute', left: 8, bottom: 8 }}>
            <span
              className={`badge ${sourceType === 'EXTERNAL' ? 'badge-orange' : 'badge-green'}`}
              style={{ fontSize: '0.63rem' }}
            >
              {sourceType === 'EXTERNAL' ? '외부 연동' : '주최자 등록'}
            </span>
          </div>

          {st.label && (
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
              <span className={`badge ${st.cls}`} style={{ fontSize: '0.65rem' }}>
                {st.label}
              </span>
            </div>
          )}

          {isSoldOut && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  padding: '0.3rem 0.9rem',
                  borderRadius: 100,
                }}
              >
                매진
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 168,
          }}
        >
          <p
            style={{
              fontSize: '0.73rem',
              color: 'var(--text-muted)',
              marginBottom: '0.25rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {event.venue?.name}
          </p>
          <h3
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              lineHeight: 1.35,
              marginBottom: '0.3rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.title}
          </h3>
          {date && (
            <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              {new Date(date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'auto',
              paddingTop: '0.35rem',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>최저</span>
            <span
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: isSoldOut ? 'var(--text-muted)' : 'var(--primary)',
              }}
            >
              {hasPrice
                ? `${event.minPrice.toLocaleString()}원`
                : sourceType === 'EXTERNAL'
                  ? '가격 정보 확인'
                  : '무료'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
