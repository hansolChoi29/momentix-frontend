'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const calledRef = useRef(false);

  const reservationId = Number(searchParams.get('reservationId') ?? '0');
  const amount = Number(searchParams.get('amount') ?? '0');
  const isValid = Boolean(reservationId && amount);

  const [message, setMessage] = useState(
    isValid ? '결제가 완료되었습니다. 티켓 페이지로 이동합니다.' : '결제 정보가 올바르지 않습니다.'
  );

  useEffect(() => {
    if (!isValid) return;
    if (calledRef.current) return;
    calledRef.current = true;

    const timer = setTimeout(() => {
      router.push('/my/tickets');
    }, 1200);

    return () => clearTimeout(timer);
  }, [isValid, router]);

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold mb-4">결제 성공</h1>
      <p>{message}</p>
    </main>
  );
}