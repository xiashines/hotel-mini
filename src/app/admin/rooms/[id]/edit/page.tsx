import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { updateRoom } from '@/app/actions/rooms';
import Link from 'next/link';

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await prisma.room.findUnique({
    where: { id }
  });

  if (!room) notFound();

  // Create a bound server action
  const updateRoomWithId = updateRoom.bind(null, room.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ویرایش اتاق: {room.name}</h1>
        <Link href="/admin/rooms" className="text-blue-600 dark:text-blue-400 hover:underline">
          بازگشت به لیست
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <form action={async (formData) => {
          'use server';
          await updateRoomWithId(formData);
          redirect('/admin/rooms');
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نام اتاق</label>
            <input name="name" type="text" defaultValue={room.name} required className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ظرفیت (نفر)</label>
            <input name="capacity" type="number" min="1" defaultValue={room.capacity} required className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">قیمت هر شب (تومان)</label>
            <input name="pricePerNight" type="number" min="0" defaultValue={room.pricePerNight} required className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">توضیحات (اختیاری)</label>
            <textarea name="description" rows={3} defaultValue={room.description || ''} className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">
            ذخیره تغییرات
          </button>
        </form>
      </div>
    </div>
  );
}
