import Link from 'next/link';
import { auth } from '@/auth';
import { logOut } from '@/app/actions/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;

  let pendingCount = 0;
  if (user?.role === 'ADMIN') {
    const { prisma } = await import('@/lib/prisma');
    pendingCount = await prisma.reservationRequest.count({
      where: { status: 'PENDING' }
    });
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center font-bold text-xl text-blue-600 dark:text-blue-400">
              هتل مینی
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4 sm:space-x-reverse">
              <Link href="/rooms" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-2 rounded-md text-sm font-medium transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800">
                اتاق‌ها
              </Link>
              {user?.role === 'GUEST' && (
                <Link href="/requests" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-2 rounded-md text-sm font-medium transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800">
                  درخواست‌های من
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="relative text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm flex items-center gap-2">
                  پنل مدیریت
                  {pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition">
                  {user.name}
                </Link>
                <form action={logOut}>
                  <button type="submit" className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium">
                    خروج
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 transition-colors">ورود</Link>
                <Link href="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium">ثبت‌نام</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
