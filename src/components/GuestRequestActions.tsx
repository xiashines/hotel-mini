'use client';

import { useState } from 'react';
import { deleteReservationRequest } from '@/app/actions/requests';
import { Trash2 } from 'lucide-react';
import { RequestStatus } from '@prisma/client';

export function GuestRequestActions({ requestId, status }: { requestId: string, status: RequestStatus }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (confirm('آیا از لغو این درخواست اطمینان دارید؟')) {
      setLoading(true);
      const res = await deleteReservationRequest(requestId);
      setLoading(false);
      if (!res.success) {
        alert(res.message);
      }
    }
  }

  if (status !== 'PENDING') {
    return null;
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition ml-auto"
    >
      <Trash2 size={16} />
      لغو درخواست
    </button>
  );
}
