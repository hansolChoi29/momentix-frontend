'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { paymentApi } from '@/lib/api';

function makeIdempotencyKey() {
  return `pay-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function makeOrderId(reservationId: string) {
  return `MOMENTIX-${reservationId}-${Date.now()}`;
}

function PaymentPageContent() {
  const params = useParams<{ reservationId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const reservationId = Number(params.reservationId);
  const amount = Number(searchParams.get('amount') ?? '0');

  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'toss' | 'mock'>('toss');

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  useEffect(() => {
    if (!clientKey) {
      alert('토스 클라이언트 키가 없습니다.');
    }
  }, [clientKey]);

  const formattedAmount = useMemo(() => {
    if (!amount) return '0원';
    return `${amount.toLocaleString()}원`;
  }, [amount]);

  const handlePay = async () => {
    if (!clientKey || !reservationId || !amount) {
      alert('결제 정보가 올바르지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      const tossPayments = await loadTossPayments(clientKey);

      await tossPayments.requestPayment('카드', {
        amount,
        orderId: makeOrderId(String(reservationId)),
        orderName: `Momentix 예매 결제 #${reservationId}`,
        successUrl: `${window.location.origin}/payment/success?reservationId=${reservationId}&amount=${amount}`,
        failUrl: `${window.location.origin}/payment/fail?reservationId=${reservationId}`,
      });
    } catch {
      alert('결제창을 띄우는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockPay = async () => {
    try {
      setLoading(true);

      const createRes = await paymentApi.create({
        reservationId,
        payer: 'SELF',
        paymentMethod: 'TOSS_TEST',
        paymentPrice: amount,
        idempotencyKey: makeIdempotencyKey(),
      });

      await paymentApi.confirm(createRes.data.paymentHistoryId, {
        reservationId,
        pointsToUse: 0,
      });

      router.push('/my/tickets');
    } catch {
      alert('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, rgba(255,240,243,0.88) 0%, var(--gray-100) 34%, var(--gray-100) 100%)',
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="anim-up mb-8 text-center sm:mb-10">
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
            PAYMENT
          </p>

          <h1 className="mb-3 text-[2rem] font-extrabold leading-tight text-[var(--text-main)] sm:text-[2.4rem] md:text-[2.9rem]">
            예매 결제를 진행해주세요
          </h1>

          <p className="mx-auto max-w-2xl text-sm leading-7 text-[var(--text-sub)] sm:text-[0.95rem]">
            예약 정보를 확인한 뒤 원하는 결제 방식으로 진행할 수 있어요.
            <br className="hidden sm:block" />
            개발 중에는 빠른 결제로 테스트 흐름도 확인할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
          <div className="card anim-pop overflow-hidden rounded-[18px]">
            <div
              style={{
                padding: '1.2rem 1.25rem',
                borderBottom: '1px solid var(--gray-200)',
                background:
                  'linear-gradient(135deg, rgba(255,75,110,0.08) 0%, rgba(255,255,255,1) 55%)',
              }}
              className="sm:px-6 sm:py-6"
            >
              <p
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.4rem',
                }}
              >
                Reservation Info
              </p>
              <h2 className="text-[1.05rem] font-extrabold text-[var(--text-main)] sm:text-[1.2rem]">
                예약 정보 확인
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    예약 번호
                  </p>
                  <p className="text-[0.95rem] font-bold text-[var(--text-main)] sm:text-base">
                    #{reservationId || '-'}
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
                    결제 예정 금액
                  </p>
                  <p className="text-[0.95rem] font-extrabold text-[var(--primary)] sm:text-base">
                    {formattedAmount}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--gray-100)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 12,
                  padding: '1rem 1rem',
                  marginBottom: '1rem',
                }}
                className="sm:px-[1.1rem]"
              >
                <div className="mb-2 flex items-center justify-between gap-4 sm:mb-3">
                  <span className="text-[0.88rem] text-[var(--text-sub)] sm:text-[0.9rem]">
                    상품 금액
                  </span>
                  <span className="text-[0.92rem] font-bold text-[var(--text-main)] sm:text-[0.95rem]">
                    {formattedAmount}
                  </span>
                </div>

                <div className="mb-3 flex items-center justify-between gap-4 sm:mb-4">
                  <span className="text-[0.88rem] text-[var(--text-sub)] sm:text-[0.9rem]">
                    할인 / 포인트
                  </span>
                  <span className="text-[0.92rem] font-bold text-[var(--text-main)] sm:text-[0.95rem]">
                    0원
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-[var(--gray-200)] pt-3 sm:pt-4">
                  <span className="text-[0.95rem] font-bold text-[var(--text-main)] sm:text-base">
                    최종 결제 금액
                  </span>
                  <span className="text-[1.15rem] font-extrabold text-[var(--text-main)] sm:text-[1.3rem]">
                    {formattedAmount}
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: '#FFF9F0',
                  border: '1.5px solid #FFD899',
                  borderRadius: 12,
                  padding: '0.95rem 1rem',
                }}
              >
                <p className="text-[0.78rem] leading-7 text-[#996600] sm:text-[0.82rem]">
                  실제 결제는 토스페이먼츠를 통해 안전하게 처리됩니다.
                  <br />
                  테스트 중에는 개발용 빠른 결제로 흐름을 먼저 점검할 수 있어요.
                </p>
              </div>
            </div>
          </div>

          <div className="card anim-pop overflow-hidden rounded-[18px]">
            <div
              style={{
                padding: '1.2rem 1.25rem',
                borderBottom: '1px solid var(--gray-200)',
                background: '#fff',
              }}
              className="sm:px-6 sm:py-6"
            >
              <p
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.4rem',
                }}
              >
                Payment Method
              </p>
              <h2 className="text-[1.05rem] font-extrabold text-[var(--text-main)] sm:text-[1.2rem]">
                결제 수단 선택
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <div className="mb-4 grid gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('toss')}
                  className="w-full cursor-pointer rounded-[14px] p-4 text-left transition-all"
                  style={{
                    border:
                      method === 'toss'
                        ? '2px solid var(--primary)'
                        : '1px solid var(--gray-200)',
                    background: method === 'toss' ? 'var(--primary-bg)' : '#fff',
                  }}
                >
                  <p
                    className="mb-1 text-[0.92rem] font-bold sm:text-[0.95rem]"
                    style={{
                      color:
                        method === 'toss' ? 'var(--primary)' : 'var(--text-main)',
                    }}
                  >
                    토스페이먼츠
                  </p>
                  <p className="text-[0.78rem] text-[var(--text-muted)] sm:text-[0.8rem]">
                    카드 결제를 정상 플로우로 진행합니다.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('mock')}
                  className="w-full cursor-pointer rounded-[14px] p-4 text-left transition-all"
                  style={{
                    border:
                      method === 'mock'
                        ? '2px solid var(--primary)'
                        : '1px solid var(--gray-200)',
                    background: method === 'mock' ? 'var(--primary-bg)' : '#fff',
                  }}
                >
                  <p
                    className="mb-1 text-[0.92rem] font-bold sm:text-[0.95rem]"
                    style={{
                      color:
                        method === 'mock' ? 'var(--primary)' : 'var(--text-main)',
                    }}
                  >
                    빠른 결제
                    <span className="ml-2 text-[0.7rem] font-semibold text-[var(--text-muted)] sm:text-[0.72rem]">
                      개발용
                    </span>
                  </p>
                  <p className="text-[0.78rem] text-[var(--text-muted)] sm:text-[0.8rem]">
                    테스트 환경에서 예약 흐름을 빠르게 확인합니다.
                  </p>
                </button>
              </div>

              <button
                type="button"
                onClick={method === 'toss' ? handlePay : handleMockPay}
                disabled={loading}
                className="btn-primary mb-3 w-full justify-center px-4 py-[0.95rem]"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? '처리 중...' : `${formattedAmount} 결제하기`}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full rounded-xl border border-[var(--gray-200)] bg-white px-4 py-[0.9rem] text-[0.88rem] font-semibold text-[var(--text-sub)] sm:text-[0.9rem]"
                style={{ cursor: 'pointer' }}
              >
                이전으로 돌아가기
              </button>

              <p className="mt-4 text-center text-[0.74rem] leading-7 text-[var(--text-muted)] sm:text-[0.76rem]">
                선택한 방식에 따라 결제 또는 테스트 예약이 진행됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>로딩 중...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}