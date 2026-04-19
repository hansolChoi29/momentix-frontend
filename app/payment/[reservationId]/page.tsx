'use client';

import { Suspense, useEffect, useState } from 'react';
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
    if (!clientKey) alert('토스 클라이언트 키가 없습니다.');
  }, [clientKey]);

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
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center lg:mb-10">
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-pink-500">
            PAYMENT
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            예매 결제를 진행해주세요
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            예약 정보를 확인한 뒤 원하는 결제 방식으로 진행할 수 있어요.
            <br className="hidden sm:block" />
            개발 중에는 빠른 결제로 테스트 흐름도 확인할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-gray-400">
              예약 정보
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <p className="mb-1 text-xs text-gray-400">예약 ID</p>
                <p className="text-sm font-medium text-gray-900">#{reservationId}</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <p className="mb-1 text-xs text-gray-400">결제 금액</p>
                <p className="text-sm font-medium text-gray-900">
                  {amount.toLocaleString()}원
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between py-1.5 text-sm text-gray-500">
                <span>상품 금액</span>
                <span className="font-medium text-gray-900">
                  {amount.toLocaleString()}원
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 text-sm text-gray-500">
                <span>할인 / 포인트</span>
                <span className="font-medium text-gray-900">0원</span>
              </div>

              <div className="mt-3 flex items-end justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-medium text-gray-900">
                  최종 결제 금액
                </span>
                <span className="text-xl font-semibold text-gray-900">
                  {amount.toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-6 text-amber-700">
                실제 결제는 토스페이먼츠를 통해 안전하게 처리됩니다.
                <br />
                테스트 중에는 개발용 빠른 결제로 흐름을 먼저 점검할 수 있어요.
              </p>
            </div>
          </section>

          <aside className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-gray-400">
              결제 수단
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setMethod('toss')}
                className={`w-full rounded-xl border px-4 py-4 text-left transition-all ${
                  method === 'toss'
                    ? 'border-gray-900 border-2 bg-white text-gray-900'
                    : 'border-gray-200 bg-white text-gray-400'
                }`}
              >
                <p className="text-sm font-medium">토스페이</p>
                <p className="mt-1 text-xs text-gray-400">
                  카드 결제를 정상 플로우로 진행합니다.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMethod('mock')}
                className={`w-full rounded-xl border px-4 py-4 text-left transition-all ${
                  method === 'mock'
                    ? 'border-gray-900 border-2 bg-white text-gray-900'
                    : 'border-gray-200 bg-white text-gray-400'
                }`}
              >
                <p className="text-sm font-medium">
                  빠른 결제 <span className="text-xs text-gray-400">(개발용)</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  테스트 환경에서 예약 흐름을 빠르게 확인합니다.
                </p>
              </button>
            </div>

            <button
              type="button"
              onClick={method === 'toss' ? handlePay : handleMockPay}
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-gray-900 py-4 text-sm font-medium text-white transition-opacity disabled:opacity-40"
            >
              {loading ? '처리 중...' : `${amount.toLocaleString()}원 결제하기`}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="mt-3 w-full rounded-xl border border-gray-200 bg-white py-4 text-sm font-medium text-gray-600"
            >
              이전으로 돌아가기
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              선택한 방식에 따라 결제 또는 테스트 예약이 진행됩니다.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">로딩 중...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}