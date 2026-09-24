import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { RequestStatus, SettlementStatus } from '@prisma/client';
import { GuestRequestActions } from '@/components/GuestRequestActions';
import { formatHotelDate } from '@/lib/dateUtils';

export default async function RequestsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const requests = await prisma.reservationRequest.findMany({
    where: { guestId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      rooms: {
        include: {
          room: true
        }
      }
    }
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch(status) {
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">در انتظار بررسی</span>;
      case 'APPROVED': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">تأیید شده</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">رد شده</span>;
    }
  };

  const getSettlementBadge = (status: SettlementStatus) => {
    switch(status) {
      case 'SETTLED': return <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-200">تسویه‌شده</span>;
      case 'UNSETTLED': return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">تسویه‌نشده</span>;
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">درخواست‌های رزرو من</h1>
        <Link 
          href="/requests/new" 
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm w-full sm:w-auto text-center"
        >
          ثبت درخواست جدید
        </Link>
      </div>
      
      <div className="space-y-4">
        {requests.map(req => (
          <div key={req.id} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 dark:text-gray-400 text-sm">شماره درخواست:</span>
                <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-800 dark:text-gray-200">REQ-{req.id.split('-')[0]}</span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                <div className="flex gap-2">
                  {getStatusBadge(req.status)}
                  {getSettlementBadge(req.settlementStatus)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">تاریخ‌ها</p>
                <p className="font-medium text-gray-900 dark:text-white">از {formatHotelDate(req.checkIn, true)}</p>
                <p className="font-medium text-gray-900 dark:text-white">تا {formatHotelDate(req.checkOut, true)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">مشخصات مسافر</p>
                <p className="font-medium text-gray-900 dark:text-white">{req.travelParty === 'FAMILY' ? 'با خانواده' : 'تنها'}</p>
                <p className="font-medium text-gray-900 dark:text-white">{req.maritalStatus === 'MARRIED' ? 'متأهل' : 'مجرد'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">اتاق‌های انتخابی ({req.roomCount} اتاق)</p>
                <ul className="list-disc list-inside text-gray-900 dark:text-white text-sm space-y-1">
                  {req.rooms.map(r => (
                    <li key={r.roomId}>{r.room.name}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* بخش دکمه لغو */}
            <div className="mt-4 pt-4 border-t dark:border-gray-800 flex justify-end">
              <GuestRequestActions requestId={req.id} status={req.status} />
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">شما هنوز هیچ درخواستی ثبت نکرده‌اید.</p>
            <Link href="/requests/new" className="text-blue-600 dark:text-blue-400 hover:underline">
              اولین درخواست خود را ثبت کنید
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
