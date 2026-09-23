import { prisma } from '@/lib/prisma';
import { createRoom } from '@/app/actions/rooms';
import { AdminRoomActions } from '@/components/AdminRoomActions';

export default async function AdminRoomsPage() {
  const rooms = await prisma.room.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">مدیریت اتاق‌ها</h1>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* فرم اضافه کردن اتاق */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-fit">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">افزودن اتاق جدید</h2>
          <form action={createRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نام اتاق</label>
              <input name="name" type="text" required className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ظرفیت (نفر)</label>
              <input name="capacity" type="number" min="1" required className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">قیمت هر شب (تومان)</label>
              <input name="pricePerNight" type="number" min="0" required className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">توضیحات (اختیاری)</label>
              <textarea name="description" rows={3} className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">
              ثبت اتاق
            </button>
          </form>
        </div>

        {/* لیست اتاق‌ها */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">لیست اتاق‌ها</h2>
          {rooms.map(room => (
            <div key={room.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{room.name}</h3>
                  {!room.isActive && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">غیرفعال</span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  👤 ظرفیت: {room.capacity} نفر | 💰 قیمت: {room.pricePerNight.toLocaleString()} تومان
                </p>
                {room.description && (
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">{room.description}</p>
                )}
              </div>
              <AdminRoomActions roomId={room.id} isActive={room.isActive} />
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400">هیچ اتاقی ثبت نشده است.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
