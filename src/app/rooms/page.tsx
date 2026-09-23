import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { auth } from '@/auth';

export default async function RoomsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

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
        {rooms.map(room => (
          <div key={room.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">{room.name}</h3>
              <div className="space-y-2 mb-4 text-gray-600 dark:text-gray-300">
                <p>👤 ظرفیت: {room.capacity} نفر</p>
                <p>💰 قیمت هر شب: {room.pricePerNight.toLocaleString()} تومان</p>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm h-12 overflow-hidden">
                {room.description || 'توضیحاتی برای این اتاق ثبت نشده است.'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">● آزاد برای امروز</span>
            </div>
          </div>
        ))}

        {rooms.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-lg">در حال حاضر هیچ اتاقی فعال نیست.</p>
          </div>
        )}
      </div>
    </div>
  );
}
