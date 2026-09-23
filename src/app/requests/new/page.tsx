import { prisma } from '@/lib/prisma';
import { createReservationRequest } from '@/app/actions/requests';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function NewRequestPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">ثبت درخواست رزرو جدید</h1>
      
      <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <form action={createReservationRequest} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">تاریخ ورود</label>
              <input name="checkIn" type="date" min={minDate} required className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-left transition" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">تاریخ خروج</label>
              <input name="checkOut" type="date" min={minDate} required className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-left transition" dir="ltr" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نوع سفر</label>
              <select name="travelParty" required className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition">
                <option value="ALONE">تنها</option>
                <option value="FAMILY">با خانواده</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">وضعیت تأهل</label>
              <select name="maritalStatus" required className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition">
                <option value="SINGLE">مجرد</option>
                <option value="MARRIED">متأهل</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">انتخاب اتاق (حداقل یک مورد)</label>
            <div className="space-y-3 border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 max-h-60 overflow-y-auto">
              {rooms.map(room => (
                <label key={room.id} className="flex items-center space-x-3 space-x-reverse cursor-pointer bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition">
                  <input type="checkbox" name="roomIds" value={room.id} className="w-5 h-5 text-blue-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500" />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-white">{room.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">ظرفیت {room.capacity} نفر | {room.pricePerNight.toLocaleString()} تومان</span>
                  </div>
                </label>
              ))}
              {rooms.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">هیچ اتاق فعالی برای انتخاب وجود ندارد.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">توضیحات تکمیلی (اختیاری)</label>
            <textarea name="notes" rows={3} className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="اگر درخواست خاصی دارید بنویسید..."></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold text-lg shadow-sm">
            ثبت نهایی درخواست
          </button>
        </form>
      </div>
    </div>
  );
}
