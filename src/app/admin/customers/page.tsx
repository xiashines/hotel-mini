import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function CustomersPage({ searchParams }: { searchParams: { settlement?: string } }) {
  const settlementFilter = searchParams.settlement;
  
  // Find all guests who have made at least one request
  const customers = await prisma.user.findMany({
    where: {
      role: 'GUEST',
      requests: settlementFilter ? {
        some: {
          settlementStatus: settlementFilter === 'SETTLED' ? 'SETTLED' : 'UNSETTLED'
        }
      } : {
        some: {} // has at least one request
      }
    },
    include: {
      requests: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">مدیریت مشتریان</h1>
        <div className="flex gap-2">
          <Link href="/admin/customers" className={`px-4 py-2 rounded-lg text-sm ${!settlementFilter ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>همه</Link>
          <Link href="/admin/customers?settlement=UNSETTLED" className={`px-4 py-2 rounded-lg text-sm ${settlementFilter === 'UNSETTLED' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>بدهکار (تسویه‌نشده)</Link>
          <Link href="/admin/customers?settlement=SETTLED" className={`px-4 py-2 rounded-lg text-sm ${settlementFilter === 'SETTLED' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>تسویه‌شده</Link>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">نام مشتری</th>
              <th className="p-4 font-medium text-gray-600">ایمیل</th>
              <th className="p-4 font-medium text-gray-600">تعداد کل درخواست‌ها</th>
              <th className="p-4 font-medium text-gray-600">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-bold text-gray-900">{customer.name}</td>
                <td className="p-4 text-gray-600">{customer.email}</td>
                <td className="p-4 text-gray-600">{customer.requests.length} درخواست</td>
                <td className="p-4">
                  <Link href={`/admin/customers/${customer.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                    مشاهده جزئیات و تاریخچه
                  </Link>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">مشتری با این مشخصات یافت نشد.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
