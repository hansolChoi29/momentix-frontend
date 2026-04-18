'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  const formattedAmount = useMemo(() => {
    if (!amount) return null;
    const parsed = Number(amount);
    if (Number.isNaN(parsed)) return amount;
    return `${parsed.toLocaleString()}원`;
  }, [amount]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, rgba(255,240,243,0.9) 0%, var(--gray-100) 38%, var(--gray-100) 100%)',
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
            PAYMENT COMPLETE
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
            결제가 정상적으로 완료되었어요
          </h1>

          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-sub)',
              lineHeight: 1.7,
            }}
          >
            예매가 정상적으로 접수되었습니다.
            <br />
            아래 결제 정보를 확인하고 내 예매 내역으로 이동해보세요.
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
                'linear-gradient(135deg, rgba(255,75,110,0.1) 0%, rgba(255,255,255,1) 55%)',
              borderBottom: '1px solid var(--gray-200)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 78,
                height: 78,
                borderRadius: '50%',
                background: 'var(--primary-bg)',
                border: '1.5px solid rgba(255,75,110,0.18)',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 24px rgba(255,75,110,0.14)',
              }}
            >
              <svg
                width="34"
                height="34"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.4"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
              결제 승인 완료
            </p>
            <p
              style={{
                fontSize: '0.86rem',
                color: 'var(--text-muted)',
              }}
            >
              예매 정보는 마이페이지에서 다시 확인할 수 있어요.
            </p>
          </div>

          <div style={{ padding: '1.5rem 2rem 2rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                  주문번호
                </p>
                <p
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    wordBreak: 'break-all',
                  }}
                >
                  {orderId || '확인 중'}
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
                  결제 금액
                </p>
                <p
                  style={{
                    fontSize: '1.02rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                  }}
                >
                  {formattedAmount || '확인 중'}
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
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  marginBottom: '0.45rem',
                }}
              >
                결제 키
              </p>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-sub)',
                  wordBreak: 'break-all',
                  lineHeight: 1.7,
                }}
              >
                {paymentKey || '확인 중'}
              </p>
            </div>

            <div
              style={{
                background: '#FFF9F0',
                border: '1.5px solid #FFD899',
                borderRadius: 12,
                padding: '0.95rem 1rem',
                marginBottom: '1.5rem',
              }}
            >
              <p
                style={{
                  fontSize: '0.82rem',
                  color: '#996600',
                  lineHeight: 1.7,
                }}
              >
                결제 직후 예매 내역 반영까지 잠깐의 시간이 걸릴 수 있어요.
                <br />
                목록에 바로 보이지 않으면 새로고침 후 다시 확인해보세요.
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
                href="/my/reservations"
                className="btn-primary"
                style={{
                  minWidth: 180,
                  justifyContent: 'center',
                  padding: '0.9rem 1.25rem',
                }}
              >
                예매 내역 보러가기
              </Link>

              <Link
                href="/events"
                className="btn-outline"
                style={{
                  minWidth: 180,
                  justifyContent: 'center',
                  padding: '0.9rem 1.25rem',
                }}
              >
                다른 공연 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>로딩 중...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}