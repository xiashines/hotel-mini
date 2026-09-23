import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ActiveStaysPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Active stays: checkIn <= today, checkOut > today
  const activeStays = await prisma.reservation.findMany({
    where: {
      checkIn: { lte: today },
      checkOut: { gt: today }
    },
    include: {
      guest: true,
      request: {
        include: { rooms: { include: { room: true } } }
      }
    },
    orderBy: { checkOut: 'asc' }
  });

  // Upcoming stays: checkIn > today
  const upcomingStays = await prisma.reservation.findMany({
    where: {
      checkIn: { gt: today }
    },
    include: {
      guest: true,
      request: {
        include: { rooms: { include: { room: true } } }
      }
    },
    orderBy: { checkIn: 'asc' }
  });

  const getDaysRemaining = (checkOutDate: Date) => {
    const diffTime = Math.abs(checkOutDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  };

  const StayCard = ({ stay, isActive }: { stay: any, isActive: boolean }) => (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors">
      <div className={`absolute top-0 right-0 text-white px-3 py-1 text-xs font-bold rounded-bl-lg ${isActive ? 'bg-green-500' : 'bg-blue-500'}`}>
        {isActive ? 'فعال' : 'پیش رو'}
      </div>
      
      <div className="mt-2">
        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{stay.guest.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{stay.guest.email}</p>
        
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
          <p><strong>اتاق‌ها:</strong> {stay.request.rooms.map((r: any) => r.room.name).join('، ')}</p>
          <p><strong>ورود:</strong> {formatDate(stay.checkIn)}</p>
          <p><strong>خروج:</strong> {formatDate(stay.checkOut)}</p>
        </div>

        {isActive ? (
          <div className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 p-3 rounded-lg text-center font-bold">
            {getDaysRemaining(stay.checkOut)} روز مانده تا خروج
          </div>
        ) : (
          <div className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 p-3 rounded-lg text-center font-bold">
            شروع از {getDaysRemaining(stay.checkIn)} روز دیگر
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Link href={`/admin/customers/${stay.guestId}`} className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
            مشاهده پروفایل مشتری
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">اقامت‌های فعال</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeStays.map(stay => (
            <StayCard key={stay.id} stay={stay} isActive={true} />
          ))}

          {activeStays.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400 text-lg">در حال حاضر هیچ اقامت فعالی ثبت نشده است.</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">اقامت‌های پیش رو</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingStays.map(stay => (
            <StayCard key={stay.id} stay={stay} isActive={false} />
          ))}

          {upcomingStays.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400 text-lg">هیچ اقامت پیش رویی وجود ندارد.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
