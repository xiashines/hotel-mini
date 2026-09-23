import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingRequestsCount = await prisma.reservationRequest.count({
    where: { status: 'PENDING' }
  });

  const activeStaysCount = await prisma.reservation.count({
    where: {
      checkIn: { lte: today },
      checkOut: { gt: today }
    }
  });

  const allRoomsCount = await prisma.room.count({ where: { isActive: true } });
  
  // Free rooms today (active minus currently occupied)
  const occupiedRooms = await prisma.reservationRequestRoom.findMany({
    where: {
      request: {
        status: 'APPROVED',
        reservation: {
          checkIn: { lte: today },
          checkOut: { gt: today }
        }
      }
    },
    distinct: ['roomId']
  });
  
  const freeRoomsCount = allRoomsCount - occupiedRooms.length;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">داشبورد مدیریت</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/rooms" prefetch={false} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 cursor-pointer block">
          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{freeRoomsCount}</span>
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">اتاق‌های خالی (امروز)</span>
        </Link>
        
        <Link href="/admin/requests" prefetch={false} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-yellow-200 dark:hover:border-yellow-900/50 cursor-pointer block">
          <span className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">{pendingRequestsCount}</span>
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">درخواست‌های در انتظار</span>
        </Link>
        
        <Link href="/admin/stays" prefetch={false} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-green-200 dark:hover:border-green-900/50 cursor-pointer block">
          <span className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{activeStaysCount}</span>
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">اقامت‌های فعال</span>
        </Link>
      </div>
    </div>
  );
}
