'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentFailContent() {
  const searchParams = useSearchParams();

  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, rgba(255,240,243,0.75) 0%, var(--gray-100) 38%, var(--gray-100) 100%)',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '4rem 1.5rem 5rem',
        }}
      >
        <div className="anim-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: 'var(--primary)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            PAYMENT FAILED
          </p>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.2,
              marginBottom: '0.75rem',
            }}
          >
            결제가 완료되지 않았어요
          </h1>

          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-sub)',
              lineHeight: 1.7,
            }}
          >
            결제 과정에서 문제가 발생했어요.
            <br />
            아래 안내를 확인한 뒤 다시 시도해주세요.
          </p>
        </div>

        <div
          className="card anim-pop"
          style={{
            maxWidth: 760,
            margin: '0 auto',
            borderRadius: 18,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '2rem 2rem 1.5rem',
              background:
                'linear-gradient(135deg, rgba(26,26,62,0.06) 0%, rgba(255,255,255,1) 55%)',
              borderBottom: '1px solid var(--gray-200)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 78,
                height: 78,
                borderRadius: '50%',
                background: '#FFF0F3',
                border: '1.5px solid rgba(255,75,110,0.18)',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 24px rgba(26,26,62,0.08)',
              }}
            >
              <svg
                width="32"
                height="32"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.4"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
              </svg>
            </div>

            <p
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                marginBottom: '0.35rem',
              }}
            >
              결제 승인 실패
            </p>
            <p
              style={{
                fontSize: '0.86rem',
                color: 'var(--text-muted)',
              }}
            >
              카드 정보 또는 인증 과정, 네트워크 상태를 다시 확인해주세요.
            </p>
          </div>

          <div style={{ padding: '1.5rem 2rem 2rem' }}>
            <div
              style={{
                display: 'grid',
                gap: '0.9rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 12,
                  padding: '1rem',
                }}
              >
                <p
                  style={{
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '0.35rem',
                  }}
                >
                  오류 코드
                </p>
                <p
                  style={{
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    wordBreak: 'break-all',
                  }}
                >
                  {code || '알 수 없음'}
                </p>
              </div>

              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 12,
                  padding: '1rem',
                }}
              >
                <p
                  style={{
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '0.35rem',
                  }}
                >
                  오류 메시지
                </p>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-sub)',
                    lineHeight: 1.7,
                    wordBreak: 'break-word',
                  }}
                >
                  {message || '결제를 완료하지 못했습니다.'}
                </p>
              </div>
            </div>

            <div
              style={{
                background: 'var(--gray-100)',
                border: '1px solid var(--gray-200)',
                borderRadius: 12,
                padding: '1rem 1.1rem',
                marginBottom: '1.5rem',
              }}
            >
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-sub)',
                  lineHeight: 1.7,
                }}
              >
                같은 문제가 반복되면 결제 수단을 바꾸거나 잠시 후 다시 시도해보세요.
                <br />
                실제로 결제가 승인되지 않은 경우 예매는 확정되지 않습니다.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/events"
                className="btn-primary"
                style={{
                  minWidth: 180,
                  justifyContent: 'center',
                  padding: '0.9rem 1.25rem',
                }}
              >
                공연 다시 보러가기
              </Link>

              <Link
                href="/my/reservations"
                className="btn-outline"
                style={{
                  minWidth: 180,
                  justifyContent: 'center',
                  padding: '0.9rem 1.25rem',
                }}
              >
                예매 내역 확인
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>로딩 중...</div>}>
      <PaymentFailContent />
    </Suspense>
  );
}