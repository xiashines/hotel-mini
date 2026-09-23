import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { auth } from '@/auth';

export default async function RoomsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: {
      requestRooms: {
        where: {
          request: {
            status: 'APPROVED',
            reservation: {
              checkOut: { gt: today }
            }
          }
        },
        include: {
          request: {
            include: { reservation: true }
          }
        }
      }
    }
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', { month: 'long', day: 'numeric' }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">اتاق‌های هتل</h1>
        {!isAdmin && (
          <Link 
            href="/requests/new" 
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm w-full sm:w-auto text-center"
          >
            ثبت درخواست رزرو
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => {
          const activeBookings = room.requestRooms
            .map(rr => rr.request.reservation)
            .filter((res): res is NonNullable<typeof res> => res !== null)
            .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());

          const isBookedNow = activeBookings.some(b => b.checkIn <= today && b.checkOut > today);

          return (
            <div key={room.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors flex flex-col h-full">
              <div className="p-6 flex-grow">
                <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">{room.name}</h3>
                <div className="space-y-2 mb-4 text-gray-600 dark:text-gray-300">
                  <p>👤 ظرفیت: {room.capacity} نفر</p>
                  <p>💰 قیمت هر شب: {room.pricePerNight.toLocaleString()} تومان</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {room.description || 'توضیحاتی برای این اتاق ثبت نشده است.'}
                </p>
                
                {activeBookings.length > 0 && (
                  <div className="mt-4 border-t dark:border-gray-800 pt-4">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">زمان‌های رزرو شده:</p>
                    <ul className="space-y-1">
                      {activeBookings.map(b => (
                        <li key={b.id} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-1.5 rounded">
                          از {formatDate(b.checkIn)} تا {formatDate(b.checkOut)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className={`p-4 border-t border-gray-100 dark:border-gray-800 ${isBookedNow ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                {isBookedNow ? (
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium">● در حال حاضر پر است</span>
                ) : (
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium">● در حال حاضر آزاد است</span>
                )}
              </div>
            </div>
          );
        })}

        {rooms.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-lg">در حال حاضر هیچ اتاقی فعال نیست.</p>
          </div>
        )}
      </div>
    </div>
  );
}
