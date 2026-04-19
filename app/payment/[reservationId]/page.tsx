'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/payment-sdk';

function makeOrderId(reservationId: string) {
  return `MOMENTIX-${reservationId}-${Date.now()}`;
}

function PaymentPageContent() {
  const params = useParams<{ reservationId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const reservationId = Number(params.reservationId);
  const amount = Number(searchParams.get('amount') ?? '0');
  const eventId = searchParams.get('eventId') ?? '';
  const scheduleId = searchParams.get('scheduleId') ?? '';
  const seatIds = searchParams.get('seatIds') ?? '';
  const external = searchParams.get('external') ?? '0';
  const isExternalFlow = external === '1';
  const payableAmount = isExternalFlow ? Math.max(100, amount || 0) : amount;

  const [loading, setLoading] = useState(false);
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  useEffect(() => {
    if (!clientKey) {
      alert('토스 클라이언트 키가 설정되지 않았습니다.');
    }
  }, [clientKey]);

  const handlePay = async () => {
    if (!reservationId || !payableAmount) {
      alert('결제 정보가 올바르지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      const successQuery = new URLSearchParams({
        reservationId: String(reservationId),
        amount: String(payableAmount),
      });
      if (eventId) successQuery.set('eventId', eventId);
      if (scheduleId) successQuery.set('scheduleId', scheduleId);
      if (seatIds) successQuery.set('seatIds', seatIds);
      if (external) successQuery.set('external', external);

      if (!clientKey) {
        alert('토스 클라이언트 키가 설정되지 않았습니다.');
        return;
      }

      const tossPayments = await loadTossPayments(clientKey);

      await tossPayments.requestPayment('카드', {
        amount: payableAmount,
        orderId: makeOrderId(String(reservationId)),
        orderName: `Momentix 예매 결제 #${reservationId}`,
        successUrl: `${window.location.origin}/payment/success?${successQuery.toString()}`,
        failUrl: `${window.location.origin}/payment/fail?reservationId=${reservationId}`,
      });
    } catch {
      alert('결제창을 여는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(255,240,243,0.38) 0%, #f7f8fa 36%, #f7f8fa 100%)',
        padding: '2.2rem 1rem 3rem',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.16em' }}>
            PAYMENT
          </p>
          <h1 style={{ marginTop: '0.45rem', fontSize: 'clamp(1.9rem, 5vw, 2.6rem)', fontWeight: 800, color: 'var(--text-main)' }}>
            결제 상세
          </h1>
          <p style={{ marginTop: '0.45rem', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            결제 내역을 확인한 뒤 원하는 결제 수단으로 진행해주세요.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '1rem' }}>
          <section className="card" style={{ padding: '1.2rem', borderRadius: 14 }}>
            <p style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
              주문 정보
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.7rem', marginTop: '0.8rem' }}>
              <div style={{ border: '1px solid var(--gray-200)', borderRadius: 10, padding: '0.85rem' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>예약 ID</p>
                <p style={{ marginTop: '0.2rem', fontWeight: 700, color: 'var(--text-main)' }}>#{reservationId}</p>
              </div>
              <div style={{ border: '1px solid var(--gray-200)', borderRadius: 10, padding: '0.85rem' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>결제 금액</p>
                <p style={{ marginTop: '0.2rem', fontWeight: 800, color: 'var(--primary)' }}>{payableAmount.toLocaleString()}원</p>
              </div>
            </div>

            <div style={{ marginTop: '0.8rem', border: '1px solid var(--gray-200)', borderRadius: 10, padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: 'var(--text-sub)' }}>
                <span>상품 금액</span>
                <strong>{payableAmount.toLocaleString()}원</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: 'var(--text-sub)', marginTop: '0.35rem' }}>
                <span>할인 / 포인트</span>
                <strong>0원</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid var(--gray-200)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>최종 결제 금액</span>
                <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.03rem' }}>{payableAmount.toLocaleString()}원</span>
              </div>
            </div>

            <div style={{ marginTop: '0.8rem', background: '#FFF9F0', border: '1px solid #FFD899', borderRadius: 10, padding: '0.8rem 0.95rem' }}>
              <p style={{ fontSize: '0.82rem', color: '#996600', lineHeight: 1.7 }}>
                결제 취소 시 결제하신 수단으로 영업일 기준 3일 이내 환불 처리됩니다.
              </p>
            </div>
            {isExternalFlow && (
              <div style={{ marginTop: '0.55rem', background: 'var(--primary-bg)', border: '1px solid rgba(255,75,110,0.25)', borderRadius: 10, padding: '0.75rem 0.95rem' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--primary)', lineHeight: 1.65 }}>
                  외부 연동 공연은 데모 결제로 처리되며 실제 금액은 청구되지 않습니다.
                </p>
              </div>
            )}
          </section>

          <section className="card" style={{ padding: '1.2rem', borderRadius: 14 }}>
            

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginTop: '0.9rem' }}>
              <button
                type="button"
                onClick={handlePay}
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.83rem', opacity: loading ? 0.55 : 1 }}
              >
                {loading ? '처리 중...' : `${payableAmount.toLocaleString()}원 결제하기`}
              </button>
              <button type="button" onClick={() => router.back()} className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
                이전으로 돌아가기
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>로딩 중...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
