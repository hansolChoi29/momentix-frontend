'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventApi } from '@/lib/api';
import { SearchResult } from '@/types';
import './search.css';

const MOCK_RESULTS: SearchResult[] = [
  {
    eventId: 1,
    title: '2025 IU HEREH WORLD TOUR IN SEOUL',
    category: 'CONCERT',
    venue: '올림픽 주경기장',
    date: '2025-08-15',
    minPrice: 110000,
    posterUrl:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80',
  },
  {
    eventId: 2,
    title: '레미제라블 내한공연',
    category: 'MUSICAL',
    venue: 'LG아트센터 서울',
    date: '2025-09-01',
    minPrice: 99000,
    posterUrl:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
  },
  {
    eventId: 3,
    title: '오페라의 유령',
    category: 'MUSICAL',
    venue: '블루스퀘어',
    date: '2025-10-10',
    minPrice: 110000,
    posterUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
  },
];

const CATEGORY_LABEL: Record<string, string> = {
  CONCERT: '콘서트',
  MUSICAL: '뮤지컬',
  PLAY: '연극',
  CLASSIC: '클래식',
};

type SearchResultsProps = {
  keyword: string;
};

function SearchResults({ keyword }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(keyword));

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      try {
        const { data } = await eventApi.search({ keyword });

        const nextResults =
          data?.content ||
          MOCK_RESULTS.filter((item) =>
            item.title.toLowerCase().includes(keyword.toLowerCase())
          );

        if (!ignore) {
          setResults(nextResults);
        }
      } catch {
        if (!ignore) {
          setResults(
            MOCK_RESULTS.filter((item) =>
              item.title.toLowerCase().includes(keyword.toLowerCase())
            )
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    if (keyword.trim()) {
      run();
    }

    return () => {
      ignore = true;
    };
  }, [keyword]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-24" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-5xl mb-4 search-empty-icon">◇</p>
        <p className="font-display text-xl mb-2 search-empty-title">
          검색 결과가 없습니다
        </p>
        <p className="text-sm search-empty-desc">다른 키워드로 검색해 보세요</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm mb-6 search-result-summary">
        <span className="font-semibold search-result-keyword">
          &quot;{keyword}&quot;
        </span>{' '}
        검색 결과 — <span className="search-result-count">{results.length}건</span>
      </p>

      <div className="space-y-3">
        {results.map((result, i) => (
          <Link key={result.eventId} href={`/events/${result.eventId}`}>
            <div
              className={`card flex gap-4 p-4 group cursor-pointer anim-up d${Math.min(
                i + 1,
                8
              )}`}
            >
              <div className="relative overflow-hidden flex-shrink-0 search-poster-wrap">
                <img
                  src={result.posterUrl || ''}
                  alt={result.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="badge badge-gold mb-2 inline-block">
                  {CATEGORY_LABEL[result.category] || result.category}
                </span>
                <h3 className="font-display font-semibold text-base mb-1 search-result-title">
                  {result.title}
                </h3>
                <p className="text-xs mb-1 search-result-meta">{result.venue}</p>
                <p className="text-xs search-result-meta">
                  {result.date &&
                    new Date(result.date).toLocaleDateString('ko-KR')}
                </p>
              </div>

              <div className="flex-shrink-0 text-right flex flex-col justify-center">
                <p className="text-xs mb-1 search-price-label">최저가</p>
                <p className="font-display font-semibold search-price-value">
                  {result.minPrice > 0
                    ? `${result.minPrice.toLocaleString()}원`
                    : '무료'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-xs tracking-widest mb-4 search-kicker">SEARCH</p>

          <form onSubmit={handleSearch} className="flex gap-0">
            <label htmlFor="search-input" className="sr-only">
              공연 검색
            </label>
            <input
              key={initialQ}
              id="search-input"
              name="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="공연명, 아티스트, 공연장 검색..."
              className="input-dark flex-1 text-lg py-4 search-input"
            />
            <button
              type="submit"
              className="btn-gold px-8 flex-shrink-0 search-submit-btn"
              aria-label="검색"
              title="검색"
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {!initialQ.trim() ? (
          <div className="text-center py-16">
            <p className="font-display text-6xl mb-6 search-empty-icon">◈</p>
            <p className="font-display text-2xl mb-3 search-empty-title">
              공연을 검색해보세요
            </p>
            <p className="text-sm search-empty-desc">
              아티스트 이름, 공연 제목, 공연장을 입력해보세요
            </p>

            <div className="flex gap-2 justify-center flex-wrap mt-8">
              {['IU', '뮤지컬', '올림픽 주경기장', '클래식', '콘서트', '오페라'].map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="badge badge-gold cursor-pointer search-tag-button"
                  >
                    #{tag}
                  </button>
                )
              )}
            </div>
          </div>
        ) : (
          <SearchResults key={initialQ} keyword={initialQ} />
        )}
      </div>
    </div>
  );
}