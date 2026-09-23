'use client';

import { useState } from 'react';
import { approveRequest, rejectRequest, toggleSettlement } from '@/app/actions/admin';
import { RequestStatus, SettlementStatus } from '@prisma/client';

interface Props {
  requestId: string;
  status: RequestStatus;
  settlementStatus: SettlementStatus;
}

export default function AdminRequestActions({ requestId, status, settlementStatus }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    const res = await approveRequest(requestId);
    setLoading(false);
    if (!res.success) {
      alert(res.message);
    }
  }

  async function handleReject() {
    if (confirm('آیا از رد این درخواست اطمینان دارید؟')) {
      setLoading(true);
      await rejectRequest(requestId);
      setLoading(false);
    }
  }

  async function handleToggleSettlement() {
    setLoading(true);
    await toggleSettlement(requestId, settlementStatus);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
      <div className="flex gap-2">
        {status === 'PENDING' && (
          <>
            <button 
              onClick={handleApprove} 
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-1.5 rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              تأیید رزرو
            </button>
            <button 
              onClick={handleReject} 
              disabled={loading}
              className="flex-1 bg-red-100 text-red-700 py-1.5 rounded text-sm hover:bg-red-200 disabled:opacity-50"
            >
              رد کردن
            </button>
          </>
        )}
      </div>
      <button 
        onClick={handleToggleSettlement} 
        disabled={loading}
        className={`w-full py-1.5 rounded text-sm disabled:opacity-50 ${
          settlementStatus === 'SETTLED' 
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
            : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
        }`}
      >
        {settlementStatus === 'SETTLED' ? 'تغییر به: تسویه‌نشده' : 'تغییر به: تسویه‌شده'}
      </button>
    </div>
  );
}
