import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pendingCount = await prisma.reservationRequest.count({
    where: { status: 'PENDING' }
  });

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      <aside className="w-full md:w-64 flex-shrink-0">
        <nav className="flex flex-col space-y-2">
          <Link href="/admin" prefetch={false} className="block px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition font-medium">
            داشبورد
          </Link>
          <Link href="/admin/rooms" prefetch={false} className="block px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition font-medium">
            مدیریت اتاق‌ها
          </Link>
          <Link href="/admin/requests" prefetch={false} className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition font-medium">
            <span>درخواست‌های رزرو</span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link href="/admin/customers" prefetch={false} className="block px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition font-medium">
            مشتریان
          </Link>
          <Link href="/admin/stays" prefetch={false} className="block px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition font-medium">
            اقامت‌های فعال
          </Link>
        </nav>
      </aside>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
