import Link from 'next/link';
import { auth } from '@/auth';
import { logOut } from '@/app/actions/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center font-bold text-xl text-blue-600 dark:text-blue-400">
              هتل مینی
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:space-x-reverse">
              <Link href="/rooms" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                اتاق‌ها
              </Link>
              {user && (
                <Link href="/requests" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                  درخواست‌های من
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                  پنل مدیریت
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{user.name}</span>
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
