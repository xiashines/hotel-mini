import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { NewRequestForm } from '@/components/NewRequestForm';

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
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">ثبت درخواست رزرو جدید</h1>
      <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <NewRequestForm initialRooms={rooms} />
      </div>
    </div>
  );
}
