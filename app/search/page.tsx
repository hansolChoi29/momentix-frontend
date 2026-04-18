import { Suspense } from 'react';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', paddingTop: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>검색 중...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
