import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const customerId = resolvedParams.id;

  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    include: {
      requests: {
        include: {
          rooms: { include: { room: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!customer || customer.role !== 'GUEST') {
    notFound();
  }

  const history = await prisma.statusHistory.findMany({
    where: { guestId: customer.id },
    orderBy: { createdAt: 'desc' },
    include: {
      request: true
    }
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', { 
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/customers" className="text-blue-600 hover:underline text-sm mb-2 inline-block">← بازگشت به لیست مشتریان</Link>
        <h1 className="text-3xl font-bold">پروفایل مشتری: {customer.name}</h1>
        <p className="text-gray-500 mt-1">{customer.email}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">درخواست‌های این مشتری</h2>
          <div className="space-y-4">
            {customer.requests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">REQ-{req.id.split('-')[0]}</span>
                  <span className="text-xs text-gray-500">{formatDate(req.createdAt)}</span>
                </div>
                <p className="text-sm">اتاق‌ها: {req.rooms.map(r => r.room.name).join('، ')}</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded">{req.status}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded">{req.settlementStatus}</span>
                </div>
              </div>
            ))}
            {customer.requests.length === 0 && <p className="text-gray-500">درخواستی ندارد.</p>}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">تاریخچه عملیات (تایم‌لاین)</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {history.map((item, index) => (
                <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {item.field === 'REQUEST_STATUS' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900">{item.field === 'REQUEST_STATUS' ? 'تغییر وضعیت رزرو' : 'تغییر وضعیت مالی'}</div>
                      <time className="font-mono text-xs text-slate-500">{formatDate(item.createdAt)}</time>
                    </div>
                    <div className="text-slate-600 text-sm mt-2">
                      تغییر از <strong>{item.fromStatus || 'نامشخص'}</strong> به <strong>{item.toStatus}</strong>
                      <div className="mt-1 text-xs text-gray-500">مربوط به درخواست: REQ-{item.requestId?.split('-')[0]}</div>
                    </div>
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-gray-500 text-center">هیچ تاریخچه‌ای ثبت نشده است.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
