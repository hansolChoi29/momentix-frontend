import { Event } from '@/types';

export const CATEGORY_LABEL: Record<Event['category'], string> = {
  CONCERT: '콘서트',
  MUSICAL: '뮤지컬',
  PLAY: '연극',
};

const CATEGORY_ALIASES: Record<string, Event['category']> = {
  CONCERT: 'CONCERT',
  MUSICAL: 'MUSICAL',
  PLAY: 'PLAY',
  CLASSIC: 'CONCERT',
  THEATER: 'PLAY',
};

export function normalizeEventCategory(value?: string | null): Event['category'] {
  if (!value) return 'CONCERT';
  return CATEGORY_ALIASES[value.toUpperCase()] ?? 'CONCERT';
}

export function normalizeEventSource(value?: string | null): 'INTERNAL' | 'EXTERNAL' {
  return value?.toUpperCase() === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';
}

const EXTERNAL_EVENT_CACHE_KEY = 'momentix:external-events-cache';

export function cacheExternalEvents(events: Event[]) {
  if (typeof window === 'undefined') return;

  const externalOnly = events.filter(
    (event) =>
      normalizeEventSource(event.sourceType) === 'EXTERNAL' &&
      Boolean(event.externalEventId)
  );
  if (externalOnly.length === 0) return;

  const existingRaw = sessionStorage.getItem(EXTERNAL_EVENT_CACHE_KEY);
  const existing: Record<string, Event> = existingRaw
    ? (JSON.parse(existingRaw) as Record<string, Event>)
    : {};

  externalOnly.forEach((event) => {
    if (!event.externalEventId) return;
    existing[event.externalEventId] = event;
  });

  sessionStorage.setItem(EXTERNAL_EVENT_CACHE_KEY, JSON.stringify(existing));
}

export function getCachedExternalEvent(externalEventId: string) {
  if (typeof window === 'undefined') return null;
  const existingRaw = sessionStorage.getItem(EXTERNAL_EVENT_CACHE_KEY);
  if (!existingRaw) return null;

  const existing: Record<string, Event> = JSON.parse(existingRaw) as Record<
    string,
    Event
  >;
  return existing[externalEventId] ?? null;
}
