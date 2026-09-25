'use client';

import { useEffect, useState } from 'react';
import { getPendingRequestsCount } from '@/app/actions/notifications';
import Link from 'next/link';

export function AdminNotifier() {
  const [, setLastCount] = useState<number | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    getPendingRequestsCount().then(count => setLastCount(count));

    // Poll every 15 seconds
    const interval = setInterval(async () => {
      const count = await getPendingRequestsCount();
      
      setLastCount((prev) => {
        if (prev !== null && count > prev) {
          setNewCount(count - prev);
          setShowNotification(true);
          
          // Auto hide after 10 seconds
          setTimeout(() => {
            setShowNotification(false);
          }, 10000);
        }
        return count;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (!showNotification) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-6 md:right-auto z-50 animate-bounce">
      <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg border border-blue-500 flex items-center justify-between gap-4 max-w-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <div>
            <h4 className="font-bold">درخواست جدید!</h4>
            <p className="text-sm text-blue-100">{newCount} درخواست رزرو جدید ثبت شده است.</p>
          </div>
        </div>
        <Link href="/admin/requests" className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-50 transition" onClick={() => setShowNotification(false)}>
          بررسی
        </Link>
        <button onClick={() => setShowNotification(false)} className="text-blue-200 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
}
