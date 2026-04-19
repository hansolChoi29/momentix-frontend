'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ticketApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type PaymentRow = {
  paymentHistoryId?: number;
  paymentId?: number;
  status?: string;
  paymentPrice?: number;
  amount?: number;
  method?: string;
  paymentMethod?: string;
};

const STATUS_LABEL: Record<string, string> = {
  SUCCESS: '결제 완료',
  CANCEL: '결제 취소',
  PENDING: '결제 대기',
};

export default function MyPaymentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<PaymentRow[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchRows = async () => {
      setLoading(true);
      try {
        const { data } = await ticketApi.myList();
        const tickets = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
        if (!Array.isArray(tickets)) {
          setRows([]);
          return;
        }

        const mapped = tickets
          .map((ticketRaw: unknown) => {
            const ticket = ticketRaw as {
              paymentHistoryId?: number;
              paymentId?: number;
              paymentStatus?: string;
              status?: string;
              price?: number;
              seat?: { price?: number };
              paymentMethod?: string;
            };
            return {
              paymentHistoryId: ticket.paymentHistoryId ?? ticket.paymentId,
              status: ticket.paymentStatus ?? ticket.status,
              paymentPrice: ticket.price ?? ticket.seat?.price ?? 0,
              paymentMethod: ticket.paymentMethod ?? 'CARD',
            };
          })
          .filter((item: PaymentRow) => item.paymentHistoryId);

        setRows(mapped);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchRows();
  }, [isAuthenticated, router]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(255,240,243,0.42) 0%, #f7f8fa 34%, #f7f8fa 100%)',
        paddingTop: '4rem',
      }}
    >
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '1.8rem 1.3rem 0.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.14em' }}>MY PAGE</p>
        <h1 style={{ marginTop: '0.35rem', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>내 결제 내역</h1>
        <p style={{ marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          결제 상세와 환불 상태를 확인할 수 있습니다.
        </p>
      </section>

      <section style={{ maxWidth: 980, margin: '0 auto', padding: '1rem 1.3rem 2.4rem' }}>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 88 }} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="card" style={{ padding: '2.6rem 1.2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-sub)', fontSize: '1rem', fontWeight: 700 }}>확인 가능한 결제 내역이 없습니다.</p>
            <Link href="/my/tickets" className="btn-outline" style={{ marginTop: '0.9rem' }}>
              내 티켓 보기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row, idx) => {
              const pid = row.paymentHistoryId ?? row.paymentId ?? idx + 1;
              const status = String(row.status ?? 'UNKNOWN').toUpperCase();
              const amount = Number(row.paymentPrice ?? row.amount ?? 0);
              const method = String(row.paymentMethod ?? row.method ?? 'CARD');

              return (
                <article key={pid} className="card" style={{ padding: '0.95rem 1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.7rem', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>결제번호 #{pid}</p>
                      <p style={{ marginTop: '0.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {STATUS_LABEL[status] ?? status} · {method} · {amount.toLocaleString()}원
                      </p>
                    </div>
                    <Link href={`/my/payments/${pid}`} className="btn-outline" style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem' }}>
                      상세 보기
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
