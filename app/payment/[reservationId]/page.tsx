'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { paymentApi } from '@/lib/api';

function makeIdempotencyKey() {
  return `pay-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function makeOrderId(reservationId: string) {
  return `MOMENTIX-${reservationId}-${Date.now()}`;
}

export default function PaymentPage() {
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
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <p className="text-xs text-gray-400 mb-1">예약 #{reservationId}</p>
        <h1 className="text-xl font-medium text-gray-900 mb-6">결제하기</h1>

        {/* 예약 정보 카드 */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">예약 정보</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">예약 ID</p>
              <p className="text-sm font-medium text-gray-900">#{reservationId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">결제 금액</p>
              <p className="text-sm font-medium text-gray-900">{amount.toLocaleString()}원</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
            <span className="text-sm font-medium text-gray-900">최종 결제 금액</span>
            <span className="text-lg font-medium text-gray-900">{amount.toLocaleString()}원</span>
          </div>
        </div>

        {/* 결제 수단 선택 */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">결제 수단</p>
          <div className="flex gap-2">
            <button
              onClick={() => setMethod('toss')}
              className={`flex-1 py-3 rounded-lg text-sm border transition-all ${
                method === 'toss'
                  ? 'border-gray-900 font-medium text-gray-900 border-2'
                  : 'border-gray-200 text-gray-400'
              }`}
            >
              토스페이
            </button>
            <button
              onClick={() => setMethod('mock')}
              className={`flex-1 py-3 rounded-lg text-sm border transition-all ${
                method === 'mock'
                  ? 'border-gray-900 font-medium text-gray-900 border-2'
                  : 'border-gray-200 text-gray-400'
              }`}
            >
              빠른 결제 <span className="text-xs text-gray-400">(개발용)</span>
            </button>
          </div>
        </div>

        {/* 버튼 */}
        <button
          onClick={method === 'toss' ? handlePay : handleMockPay}
          disabled={loading}
          className="w-full py-4 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:opacity-40 transition-opacity"
        >
          {loading ? '처리 중...' : `${amount.toLocaleString()}원 결제하기`}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">
          결제는 토스페이먼츠를 통해 안전하게 처리됩니다
        </p>
      </div>
    </main>
  );
}