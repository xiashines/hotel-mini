import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ActiveStaysPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Active stays: checkIn is less than or equal to today, and checkOut is strictly greater than today
  const activeStays = await prisma.reservation.findMany({
    where: {
      checkIn: { lte: today },
      checkOut: { gt: today }
    },
    include: {
      guest: true,
      request: {
        include: {
          rooms: { include: { room: true } }
        }
      }
    },
    orderBy: { checkOut: 'asc' }
  });

  const getDaysRemaining = (checkOutDate: Date) => {
    const diffTime = Math.abs(checkOutDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">اقامت‌های فعال</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeStays.map(stay => (
          <div key={stay.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
              فعال
            </div>
            
            <div className="mt-2">
              <h3 className="font-bold text-xl text-gray-900 mb-1">{stay.guest.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{stay.guest.email}</p>
              
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p><strong>اتاق‌ها:</strong> {stay.request.rooms.map(r => r.room.name).join('، ')}</p>
                <p><strong>خروج:</strong> {formatDate(stay.checkOut)}</p>
              </div>

              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-center font-bold">
                {getDaysRemaining(stay.checkOut)} روز مانده تا خروج
              </div>
              
              <div className="mt-4 text-center">
                <Link href={`/admin/customers/${stay.guestId}`} className="text-blue-600 text-sm hover:underline">
                  مشاهده پروفایل مشتری
                </Link>
              </div>
            </div>
          </div>
        ))}

        {activeStays.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500 text-lg">در حال حاضر هیچ اقامت فعالی ثبت نشده است.</p>
          </div>
        )}
      </div>
    </div>
  );
}
