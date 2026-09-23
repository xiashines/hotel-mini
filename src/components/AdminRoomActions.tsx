'use client';

import { useState } from 'react';
import { toggleRoomStatus, deleteRoom } from '@/app/actions/rooms';
import { Trash2, Power, PowerOff, Edit } from 'lucide-react';
import Link from 'next/link';

export function AdminRoomActions({ roomId, isActive }: { roomId: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleRoomStatus(roomId, !isActive);
    setLoading(false);
  }

  async function handleDelete() {
    if (confirm('آیا از حذف این اتاق مطمئن هستید؟ اتاق‌هایی که تاریخچه رزرو دارند حذف نمی‌شوند.')) {
      setLoading(true);
      const res = await deleteRoom(roomId);
      setLoading(false);
      if (!res.success) {
        alert(res.message);
      }
    }
  }

  return (
    <div className="flex gap-2">
      <Link 
        href={`/admin/rooms/${roomId}/edit`}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition"
      >
        <Edit size={16} />
        ویرایش
      </Link>
      <button 
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
          isActive 
            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400' 
            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
        }`}
      >
        {isActive ? <PowerOff size={16} /> : <Power size={16} />}
        {isActive ? 'غیرفعال' : 'فعال'}
      </button>
      
      <button 
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition"
      >
        <Trash2 size={16} />
        حذف
      </button>
    </div>
  );
}
