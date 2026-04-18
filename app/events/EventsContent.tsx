'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import EventCard from '@/components/event/EventCard';
import { eventApi } from '@/lib/api';
import { Event } from '@/types';

const CATS = [
  { key: '', label: '전체' },
  { key: 'CONCERT', label: '콘서트' },
  { key: 'MUSICAL', label: '뮤지컬' },
  { key: 'PLAY', label: '연극' },
  { key: 'CLASSIC', label: '클래식' },
];

const SORTS = [
  { key: 'newest', label: '최신순' },
  { key: 'popular', label: '인기순' },
  { key: 'price_asc', label: '가격 낮은순' },
  { key: 'price_desc', label: '가격 높은순' },
];

type EventListItem = {
  eventId?: number;
  id?: number;
  title?: string;
  eventTitle?: string;
  description?: string;
  category?: Event['category'];
  eventCategoryType?: Event['category'];
  status?: Event['status'];
  posterUrl?: string;
  venue?: {
    venueId?: number;
    name?: string;
    address?: string;
    capacity?: number;
  };
  placeId?: number;
  placeName?: string;
  placeAddress?: string;
  schedules?: Event['schedules'];
  minPrice?: number;
  maxPrice?: number;
};

export default function EventsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || '0');

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      setLoading(true);

      try {
        const response = await eventApi.list({
          category: category || undefined,
          sort,
          page,
          size: 16,
        });

        const responseData = response?.data;
        const rawList: unknown[] = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.content)
            ? responseData.content
            : [];

        const mappedEvents: Event[] = rawList.map((item, index) => {
          const eventItem: EventListItem =
            typeof item === 'object' && item !== null
              ? (item as EventListItem)
              : {};

          return {
            eventId: eventItem.eventId ?? eventItem.id ?? index + 1,
            title: eventItem.title ?? eventItem.eventTitle ?? '',
            description: eventItem.description ?? '',
            category: eventItem.category ?? eventItem.eventCategoryType ?? 'CONCERT',
            status: eventItem.status ?? 'ON_SALE',
            posterUrl: eventItem.posterUrl,
            venue: {
              venueId: eventItem.venue?.venueId ?? eventItem.placeId ?? index + 1,
              name: eventItem.venue?.name ?? eventItem.placeName ?? '',
              address: eventItem.venue?.address ?? eventItem.placeAddress ?? '',
              capacity: eventItem.venue?.capacity ?? 0,
            },
            schedules: eventItem.schedules ?? [],
            minPrice: eventItem.minPrice ?? 0,
            maxPrice: eventItem.maxPrice ?? 0,
          };
        });

        if (!ignore) {
          setEvents(mappedEvents);
          setTotalPages(responseData?.totalPages ?? 0);
        }
      } catch {
        if (!ignore) {
          setEvents([]);
          setTotalPages(0);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, [category, sort, page]);

  const setFilter = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams.toString());

    if (val) p.set(key, val);
    else p.delete(key);

    p.set('page', '0');
    router.push(`/events?${p.toString()}`);
  };

  const movePage = (nextPage: number) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('page', String(nextPage));
    router.push(`/events?${p.toString()}`);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)', padding: '1.25rem 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>전체 공연</h1>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 'var(--radius)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {CATS.map((c) => {
              const active = category === c.key;

              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setFilter('category', c.key)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    background: active ? 'var(--primary)' : 'var(--gray-100)',
                    color: active ? '#fff' : 'var(--text-sub)',
                    border: 'none',
                    borderRadius: 100,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <select
            aria-label="정렬 방식"
            value={sort}
            onChange={(e) => setFilter('sort', e.target.value)}
            className="events-sort-select"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          총 <strong style={{ color: 'var(--text-main)' }}>{events.length}</strong>개 공연
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ paddingBottom: '150%' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
            {events.map((ev, i) => (
              <div key={ev.eventId} className={`anim-up d${Math.min(i + 1, 8)}`}>
                <EventCard event={ev} index={i} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginTop: '2.5rem' }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => movePage(i)}
                style={{
                  width: 36,
                  height: 36,
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  background: page === i ? 'var(--primary)' : '#fff',
                  border: `1px solid ${page === i ? 'var(--primary)' : 'var(--gray-300)'}`,
                  borderRadius: 6,
                  color: page === i ? '#fff' : 'var(--text-sub)',
                  fontWeight: page === i ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:1024px){div[style*="repeat(4,1fr)"]{grid-template-columns:repeat(3,1fr)!important}}
        @media(max-width:640px){div[style*="repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>
    </div>
  );
}