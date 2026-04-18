'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventApi } from '@/lib/api';
import { SearchResult } from '@/types';

const MOCK_RESULTS: SearchResult[] = [
  { eventId: 1, title: '2025 IU HEREH WORLD TOUR IN SEOUL', category: 'CONCERT', venue: '올림픽 주경기장', date: '2025-08-15', minPrice: 110000, posterUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80' },
  { eventId: 2, title: '레미제라블 내한공연', category: 'MUSICAL', venue: 'LG아트센터 서울', date: '2025-09-01', minPrice: 99000, posterUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80' },
  { eventId: 3, title: '오페라의 유령', category: 'MUSICAL', venue: '블루스퀘어', date: '2025-10-10', minPrice: 110000, posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
];
const CATEGORY_LABEL: Record<string, string> = { CONCERT:'콘서트', MUSICAL:'뮤지컬', THEATER:'연극', DANCE:'무용', EXHIBITION:'전시', SPORT:'스포츠' };

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true); setSearched(true);
    try {
      const { data } = await eventApi.search({ keyword: q });
      setResults(data?.content || MOCK_RESULTS.filter(r => r.title.toLowerCase().includes(q.toLowerCase())));
    } catch { setResults(MOCK_RESULTS.filter(r => r.title.toLowerCase().includes(q.toLowerCase()))); }
    setIsLoading(false);
  }, []);

  useEffect(() => { if (initialQ) doSearch(initialQ); }, [initialQ, doSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    doSearch(query);
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '4rem' }}>
      <div style={{ background: 'var(--charcoal)', borderBottom: '1px solid var(--muted)' }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-xs tracking-widest mb-4" style={{ color: 'var(--gold)', letterSpacing: '0.3em' }}>SEARCH</p>
          <form onSubmit={handleSearch} className="flex gap-0">
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="공연명, 아티스트, 공연장 검색..." className="input-dark flex-1 text-lg py-4" style={{ fontSize: '1.1rem', borderRight: 'none' }} />
            <button type="submit" className="btn-gold px-8 flex-shrink-0" style={{ borderRadius: 0 }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {!searched && !initialQ ? (
          <div className="text-center py-16">
            <p className="font-display text-6xl mb-6" style={{ color: 'var(--muted)' }}>◈</p>
            <p className="font-display text-2xl mb-3" style={{ color: 'var(--text-dim)' }}>공연을 검색해보세요</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>아티스트 이름, 공연 제목, 공연장을 입력해보세요</p>
            <div className="flex gap-2 justify-center flex-wrap mt-8">
              {['IU','뮤지컬','올림픽 주경기장','발레','BTS','오페라'].map(tag => (
                <button key={tag} onClick={() => { setQuery(tag); router.push(`/search?q=${tag}`); doSearch(tag); }} className="badge badge-gold cursor-pointer" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>#{tag}</button>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24" />)}</div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-display text-5xl mb-4" style={{ color: 'var(--muted)' }}>◇</p>
            <p className="font-display text-xl mb-2" style={{ color: 'var(--text-dim)' }}>검색 결과가 없습니다</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>다른 키워드로 검색해 보세요</p>
          </div>
        ) : (
          <>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--gold)' }}>"{initialQ}"</span> 검색 결과 —&nbsp;
              <span style={{ color: 'var(--text-main)' }}>{results.length}건</span>
            </p>
            <div className="space-y-3">
              {results.map((result, i) => (
                <Link key={result.eventId} href={`/events/${result.eventId}`}>
                  <div className="card flex gap-4 p-4 group cursor-pointer animate-fade-up" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                    <div className="relative overflow-hidden flex-shrink-0" style={{ width: '70px', height: '90px' }}>
                      <img src={result.posterUrl || ''} alt={result.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="badge badge-gold mb-2 inline-block">{CATEGORY_LABEL[result.category] || result.category}</span>
                      <h3 className="font-display font-semibold text-base mb-1" style={{ color: 'var(--text-bright)' }}>{result.title}</h3>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{result.venue}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{result.date && new Date(result.date).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <div className="flex-shrink-0 text-right flex flex-col justify-center">
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>최저가</p>
                      <p className="font-display font-semibold" style={{ color: 'var(--gold)', fontSize: '1rem' }}>{result.minPrice > 0 ? `${result.minPrice.toLocaleString()}원` : '무료'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
