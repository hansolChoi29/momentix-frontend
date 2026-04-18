'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('reservationId');

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-lg font-medium text-gray-900 mb-2">결제가 완료되지 않았습니다</h1>
        <p className="text-sm text-gray-400 mb-6">결제 중 문제가 발생했거나 취소되었습니다.</p>

        {reservationId && (
          <>
            <Link
              href={`/payment/${reservationId}`}
              className="block w-full py-3.5 bg-gray-900 text-white rounded-xl text-sm font-medium text-center mb-3"
            >
              다시 결제하기
            </Link>
            <Link
              href="/"
              className="block w-full py-3.5 border border-gray-200 text-gray-700 rounded-xl text-sm text-center"
            >
              홈으로 돌아가기
            </Link>
          </>
        )}
      </div>
    </main>
  );
}