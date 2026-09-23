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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">ثبت درخواست رزرو جدید</h1>
      
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
        <form action={createReservationRequest} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">تاریخ ورود</label>
              <input name="checkIn" type="date" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-left" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تاریخ خروج</label>
              <input name="checkOut" type="date" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-left" dir="ltr" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">نوع سفر</label>
              <select name="travelParty" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ALONE">تنها</option>
                <option value="FAMILY">با خانواده</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">وضعیت تأهل</label>
              <select name="maritalStatus" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="SINGLE">مجرد</option>
                <option value="MARRIED">متأهل</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">انتخاب اتاق (حداقل یک مورد)</label>
            <div className="space-y-3 border rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto">
              {rooms.map(room => (
                <label key={room.id} className="flex items-center space-x-3 space-x-reverse cursor-pointer bg-white p-3 rounded border border-gray-200 hover:bg-blue-50 transition">
                  <input type="checkbox" name="roomIds" value={room.id} className="w-5 h-5 text-blue-600 rounded" />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{room.name}</span>
                    <span className="text-sm text-gray-500">ظرفیت {room.capacity} نفر | {room.pricePerNight.toLocaleString()} تومان</span>
                  </div>
                </label>
              ))}
              {rooms.length === 0 && (
                <p className="text-gray-500 text-sm">هیچ اتاق فعالی برای انتخاب وجود ندارد.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">توضیحات تکمیلی (اختیاری)</label>
            <textarea name="notes" rows={3} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" placeholder="اگر درخواست خاصی دارید بنویسید..."></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold text-lg shadow-sm">
            ثبت نهایی درخواست
          </button>
        </form>
      </div>
    </div>
  );
}
