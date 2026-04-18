'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentFailContent() {
  const searchParams = useSearchParams();

  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div>
      <h1>결제 실패</h1>
      <p>code: {code}</p>
      <p>message: {message}</p>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <PaymentFailContent />
    </Suspense>
  );
}