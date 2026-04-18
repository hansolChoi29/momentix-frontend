import { Suspense } from 'react';
import EventsContent from './EventsContent';

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', paddingTop: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <p className="font-display text-4xl mb-4" style={{ color: 'var(--muted)' }}>◈</p>
          <p style={{ color: 'var(--text-muted)' }}>공연 목록을 불러오는 중...</p>
        </div>
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}
