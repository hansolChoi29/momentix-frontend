export type DemoBookedSeat = {
  eventId: number;
  scheduleId: number;
  seatIds: number[];
};

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const KEY = 'demo-booked-seats';

export function getDemoBookedSeats(): DemoBookedSeat[] {
  if (typeof window === 'undefined') return [];

  const raw = localStorage.getItem(KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as DemoBookedSeat[];
  } catch {
    return [];
  }
}

export function saveDemoBookedSeats(payload: DemoBookedSeat) {
  if (typeof window === 'undefined') return;

  const current = getDemoBookedSeats();

  const found = current.find(
    (item) =>
      item.eventId === payload.eventId &&
      item.scheduleId === payload.scheduleId
  );

  if (found) {
    found.seatIds = Array.from(new Set([...found.seatIds, ...payload.seatIds]));
  } else {
    current.push(payload);
  }

  localStorage.setItem(KEY, JSON.stringify(current));
}

export function getDemoBookedSeatIds(eventId: number, scheduleId: number) {
  return getDemoBookedSeats()
    .filter(
      (item) => item.eventId === eventId && item.scheduleId === scheduleId
    )
    .flatMap((item) => item.seatIds);
}