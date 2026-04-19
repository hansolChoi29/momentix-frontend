'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { paymentApi } from '@/lib/api';
import { isDemoMode, saveDemoBookedSeats } from '@/lib/demo';

function makeIdempotencyKey(seed?: string | null) {
  if (seed && seed.trim()) return `pay-success-${seed}`;
  return `pay-success-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = Number(searchParams.get('amount') ?? '0');
  const reservationId = Number(searchParams.get('reservationId') ?? '0');
  const eventId = Number(searchParams.get('eventId') ?? '0');
  const scheduleId = Number(searchParams.get('scheduleId') ?? '0');
  const isExternalFlow = searchParams.get('external') === '1';
  const seatIds = (searchParams.get('seatIds') ?? '')
    .split(',')
    .map((v) => Number(v))
    .filter((v) => !Number.isNaN(v));

  const [stage, setStage] = useState<'pending' | 'done' | 'failed'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!reservationId || !amount) {
        setStage('failed');
        setErrorMessage('결제 확인에 필요한 정보가 없습니다.');
        return;
      }

      const dedupeKey = `payment-confirmed:${reservationId}:${paymentKey ?? orderId ?? amount}`;
      if (sessionStorage.getItem(dedupeKey) === 'done') {
        setStage('done');
        return;
      }

      try {
        if (isDemoMode || isExternalFlow) {
          if (eventId && scheduleId && seatIds.length > 0) {
            saveDemoBookedSeats({ eventId, scheduleId, seatIds });
          }
          sessionStorage.setItem(dedupeKey, 'done');
          setStage('done');
          return;
        }

        const createRes = await paymentApi.create({
          reservationId,
          payer: 'SELF',
          paymentMethod: 'TOSS',
          paymentPrice: amount,
          idempotencyKey: makeIdempotencyKey(paymentKey ?? orderId),
        });

        const paymentData = createRes.data?.data ?? createRes.data;
        const paymentId = paymentData?.paymentHistoryId ?? paymentData?.paymentId;
        if (!paymentId) throw new Error('결제 생성 응답에 payment id가 없습니다.');

        await paymentApi.confirm(paymentId, {
          reservationId,
          pointToUse: 0,
          pointsToUse: 0,
        });

        sessionStorage.setItem(dedupeKey, 'done');
        setStage('done');
      } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        setErrorMessage(apiError?.response?.data?.message ?? '결제 확정 처리에 실패했습니다.');
        setStage('failed');
      }
    };

    void run();
  }, [amount, eventId, isExternalFlow, orderId, paymentKey, reservationId, scheduleId, seatIds]);

  const formattedAmount = useMemo(() => {
    if (!amount) return '-';
    return `${amount.toLocaleString()}원`;
  }, [amount]);

  const title = stage === 'pending' ? '결제 내용을 확인하고 있습니다' : stage === 'done' ? '결제가 정상 완료되었습니다' : '결제 확인에 실패했습니다';
  const description =
    stage === 'pending'
      ? '결제 완료 내역을 기준으로 예매와 티켓을 최종 반영하는 중입니다.'
      : stage === 'done'
      ? '예매 내역과 좌석 상태가 반영되었습니다.'
      : errorMessage;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(255,240,243,0.82) 0%, #f7f8fa 34%, #f7f8fa 100%)',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '4.2rem 1.4rem 5rem' }}>
        <div className="anim-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
            PAYMENT COMPLETE
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2, marginBottom: '0.7rem' }}>
            {title}
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-sub)', lineHeight: 1.7 }}>{description}</p>
        </div>

        <div className="card anim-pop" style={{ maxWidth: 760, margin: '0 auto', borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 26px rgba(26,26,62,0.08)' }}>
          <div style={{ padding: '1.9rem 2rem 1.4rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,75,110,0.09) 0%, #fff 58%)', borderBottom: '1px solid var(--gray-200)' }}>
            <p style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              {stage === 'pending' ? '결제 확인 진행 중' : stage === 'done' ? '결제 확인 완료' : '결제 확인 실패'}
            </p>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              {stage === 'failed' ? '아래 버튼으로 티켓/결제 내역 페이지에서 다시 확인해주세요.' : '주문번호와 결제금액을 확인하세요.'}
            </p>
          </div>

          <div style={{ padding: '1.5rem 2rem 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1.2rem' }}>
              <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>주문번호</p>
                <p style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-all' }}>{orderId || '-'}</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>결제금액</p>
                <p style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--primary)' }}>{formattedAmount}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/my/tickets" className="btn-primary" style={{ minWidth: 180, justifyContent: 'center', padding: '0.88rem 1.25rem' }}>
                내 티켓 보기
              </Link>
              <Link href="/my/payments" className="btn-outline" style={{ minWidth: 180, justifyContent: 'center', padding: '0.88rem 1.25rem' }}>
                결제 내역 확인
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
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>결제 정보를 불러오는 중...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
