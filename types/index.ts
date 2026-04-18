export type EventCategory = 'CONCERT' | 'THEATER' | 'MUSICAL' | 'DANCE' | 'EXHIBITION' | 'SPORT';
export type EventStatus = 'ON_SALE' | 'SOLD_OUT' | 'UPCOMING' | 'ENDED' | 'CANCELLED';
export type SeatStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED';
export type TicketStatus = 'ISSUED' | 'USED' | 'CANCELLED';
export type RoleType = 'ROLE_CONSUMER' | 'ROLE_HOST' | 'ROLE_ADMIN';

export interface User {
  userId: number;
  email: string;
  nickname: string;
  role: RoleType;
  profileImage?: string;
  point: number;
}

export interface EventSchedule {
  scheduleId: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Venue {
  venueId: number;
  name: string;
  address: string;
  capacity: number;
  latitude?: number;
  longitude?: number;
}

export interface Event {
  eventId: number;
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  posterUrl?: string;
  venue: Venue;
  schedules: EventSchedule[];
  minPrice: number;
  maxPrice: number;
  runningTime?: number;
  rating?: string;
  hostName?: string;
  tags?: string[];
}

export interface Seat {
  seatId: number;
  seatNumber: string;
  row: string;
  grade: string;
  price: number;
  status: SeatStatus;
}

export interface SeatGrade {
  grade: string;
  price: number;
  color: string;
  seats: Seat[];
}

export interface Reservation {
  reservationId: number;
  event: Event;
  schedule: EventSchedule;
  seat: Seat;
  status: string;
  createdAt: string;
}

export interface Ticket {
  ticketId: number;
  ticketCode: string;
  event: Event;
  schedule: EventSchedule;
  seat: Seat;
  status: TicketStatus;
  issuedAt: string;
  qrCode?: string;
}

export interface PaymentHistory {
  paymentHistoryId: number;
  amount: number;
  method: string;
  status: string;
  paidAt: string;
  event: Event;
}

export interface SearchResult {
  eventId: number;
  title: string;
  category: EventCategory;
  venue: string;
  date: string;
  minPrice: number;
  posterUrl?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
