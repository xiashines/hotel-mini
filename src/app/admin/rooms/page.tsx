import { prisma } from '@/lib/prisma';
import { createRoom, toggleRoomStatus } from '@/app/actions/rooms';

export default async function AdminRoomsPage() {
  const rooms = await prisma.room.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">مدیریت اتاق‌ها</h1>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* فرم اضافه کردن اتاق */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold mb-4">افزودن اتاق جدید</h2>
          <form action={createRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">نام اتاق</label>
              <input name="name" type="text" required className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ظرفیت (نفر)</label>
              <input name="capacity" type="number" min="1" required className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">قیمت هر شب (تومان)</label>
              <input name="pricePerNight" type="number" min="0" required className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">توضیحات (اختیاری)</label>
              <textarea name="description" rows={3} className="w-full border rounded-lg p-2"></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              ثبت اتاق
            </button>
          </form>
        </div>

        {/* لیست اتاق‌ها */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4">لیست اتاق‌ها</h2>
          {rooms.map(room => (
            <div key={room.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{room.name}</h3>
                <p className="text-gray-600 text-sm">
                  ظرفیت: {room.capacity} نفر | قیمت: {room.pricePerNight.toLocaleString()} تومان
                </p>
                <p className="text-gray-500 text-sm mt-1">{room.description}</p>
              </div>
              <div>
                <form action={toggleRoomStatus.bind(null, room.id, !room.isActive)}>
                  <button 
                    type="submit" 
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${room.isActive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                  >
                    {room.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                  </button>
                </form>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <p className="text-gray-500">هیچ اتاقی ثبت نشده است.</p>
          )}
        </div>
      </div>
    </div>
  );
}
