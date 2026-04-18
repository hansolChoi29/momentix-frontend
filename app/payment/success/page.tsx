'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  return (
    <div>
      <h1>결제 성공</h1>
      <p>paymentKey: {paymentKey}</p>
      <p>orderId: {orderId}</p>
      <p>amount: {amount}</p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}