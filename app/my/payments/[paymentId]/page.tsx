'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { paymentApi } from '@/lib/api';

type PaymentDetail = {
  paymentHistoryId?: number;
  paymentId?: number;
  status?: string;
  paymentPrice?: number;
  amount?: number;
  method?: string;
  paymentMethod?: string;
  paidAt?: string;
};

export default function PaymentDetailPage() {
  const params = useParams<{ paymentId: string }>();
  const router = useRouter();
  const paymentId = Number(params.paymentId);

  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [detail, setDetail] = useState<PaymentDetail | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!paymentId) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await paymentApi.getOne(paymentId);
        setDetail(data?.data ?? data);
      } catch {
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchDetail();
  }, [paymentId]);

  const amount = Number(detail?.paymentPrice ?? detail?.amount ?? 0);
  const status = String(detail?.status ?? 'UNKNOWN').toUpperCase();
  const method = String(detail?.paymentMethod ?? detail?.method ?? 'CARD');

  const statusLabel = useMemo(() => {
    if (status === 'SUCCESS') return '결제 완료';
    if (status === 'CANCEL') return '결제 취소';
    if (status === 'PENDING') return '결제 대기';
    return status;
  }, [status]);

  const handleCancel = async () => {
    if (!paymentId || status === 'CANCEL') return;
    if (!confirm('결제를 취소하시겠습니까?')) return;

    try {
      setCanceling(true);
      await paymentApi.cancel(paymentId);
      setDetail((prev) => ({ ...(prev ?? {}), status: 'CANCEL' }));
    } catch (e: unknown) {
      const apiError = e as { response?: { data?: { message?: string } } };
      alert(apiError.response?.data?.message || '결제 취소에 실패했습니다.');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>결제 정보를 불러오는 중...</div>;
  }

  return (
    <main
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, rgba(255,240,243,0.45) 0%, #f7f8fa 35%, #f7f8fa 100%)',
      }}
    >
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '4.4rem 1.2rem 3rem' }}>
        <section className="card" style={{ padding: '1.6rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.73rem', letterSpacing: '0.14em', color: 'var(--primary)', fontWeight: 700 }}>PAYMENT DETAIL</p>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--text-main)' }}>결제 상세 정보</h1>
          <p style={{ marginTop: '0.45rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            결제 상태와 환불 안내를 아래에서 확인할 수 있습니다.
          </p>
        </section>

        <section className="card" style={{ padding: '1.5rem', boxShadow: '0 8px 26px rgba(26,26,62,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
            <div style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: '0.95rem' }}>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>결제번호</p>
              <p style={{ fontWeight: 700, marginTop: '0.25rem' }}>{detail?.paymentHistoryId ?? paymentId}</p>
            </div>
            <div style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: '0.95rem' }}>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>결제상태</p>
              <p style={{ fontWeight: 700, marginTop: '0.25rem' }}>{statusLabel}</p>
            </div>
            <div style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: '0.95rem' }}>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>결제수단</p>
              <p style={{ fontWeight: 700, marginTop: '0.25rem' }}>{method}</p>
            </div>
            <div style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: '0.95rem' }}>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>결제금액</p>
              <p style={{ fontWeight: 700, marginTop: '0.25rem' }}>{amount.toLocaleString()}원</p>
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              background: '#FFF9F0',
              border: '1px solid #FFD899',
              borderRadius: 12,
              padding: '0.95rem 1.05rem',
            }}
          >
            <p style={{ fontSize: '0.83rem', color: '#996600', lineHeight: 1.7 }}>
              결제 취소 시 결제하신 수단으로 영업일 기준 3일 이내 환불 처리됩니다.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn-outline" onClick={() => router.back()}>
              이전 페이지
            </button>
            <Link href="/my/tickets" className="btn-outline">
              내 티켓
            </Link>
            {status !== 'CANCEL' && (
              <button type="button" className="btn-primary" onClick={handleCancel} disabled={canceling}>
                {canceling ? '취소 처리 중...' : '결제 취소'}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
