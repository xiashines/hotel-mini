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
      <h1 className="text-3xl font-bold mb-6">داشبورد مدیریت</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-blue-600 mb-2">{freeRoomsCount}</span>
          <span className="text-gray-600">اتاق‌های آزاد (امروز)</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-yellow-600 mb-2">{pendingRequestsCount}</span>
          <span className="text-gray-600">درخواست‌های در انتظار</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-green-600 mb-2">{activeStaysCount}</span>
          <span className="text-gray-600">اقامت‌های فعال</span>
        </div>
      </div>
    </div>
  );
}
