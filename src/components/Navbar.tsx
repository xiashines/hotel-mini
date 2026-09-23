import Link from 'next/link';
import { auth } from '@/auth';
import { logOut } from '@/app/actions/auth';

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center font-bold text-xl text-blue-600">
              هتل مینی
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:space-x-reverse">
              <Link href="/rooms" className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                اتاق‌ها
              </Link>
              {user && (
                <Link href="/requests" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                  درخواست‌های من
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                  پنل مدیریت
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">{user.name}</span>
                <form action={logOut}>
                  <button type="submit" className="text-sm text-red-600 hover:text-red-800">
                    خروج
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="text-sm text-gray-700 hover:text-blue-600 px-3 py-2">ورود</Link>
                <Link href="/register" className="text-sm bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700">ثبت‌نام</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
