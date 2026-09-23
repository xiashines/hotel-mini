import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      <aside className="w-full md:w-64 flex-shrink-0">
        <nav className="flex flex-col space-y-1">
          <Link href="/admin" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            داشبورد
          </Link>
          <Link href="/admin/rooms" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            مدیریت اتاق‌ها
          </Link>
          <Link href="/admin/requests" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            درخواست‌های رزرو
          </Link>
          <Link href="/admin/customers" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            مشتریان
          </Link>
          <Link href="/admin/stays" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
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
