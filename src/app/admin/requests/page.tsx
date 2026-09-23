import { prisma } from '@/lib/prisma';
import { RequestStatus, SettlementStatus } from '@prisma/client';
import AdminRequestActions from '@/components/AdminRequestActions';

export default async function AdminRequestsPage() {
  const requests = await prisma.reservationRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      guest: true,
      rooms: {
        include: {
          room: true
        }
      }
    }
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch(status) {
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">در انتظار</span>;
      case 'APPROVED': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">تأیید شده</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">رد شده</span>;
    }
  };

  const getSettlementBadge = (status: SettlementStatus) => {
    switch(status) {
      case 'SETTLED': return <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-200">تسویه‌شده</span>;
      case 'UNSETTLED': return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">تسویه‌نشده</span>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">مدیریت درخواست‌های رزرو</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {requests.map(req => (
          <div key={req.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{req.guest.name}</h3>
                  <p className="text-sm text-gray-500">{req.guest.email}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {getStatusBadge(req.status)}
                  {getSettlementBadge(req.settlementStatus)}
                </div>
              </div>
              
              <div className="text-sm text-gray-700 space-y-1 mb-3">
                <p><strong>ورود:</strong> {formatDate(req.checkIn)}</p>
                <p><strong>خروج:</strong> {formatDate(req.checkOut)}</p>
                <p><strong>مسافر:</strong> {req.travelParty === 'FAMILY' ? 'خانواده' : 'تنها'} - {req.maritalStatus === 'MARRIED' ? 'متأهل' : 'مجرد'}</p>
                <p><strong>اتاق‌ها:</strong> {req.rooms.map(r => r.room.name).join('، ')}</p>
                {req.notes && (
                  <p className="mt-2 text-gray-500 italic bg-gray-50 p-2 rounded">
                    توضیحات: {req.notes}
                  </p>
                )}
              </div>
            </div>

            <AdminRequestActions 
              requestId={req.id} 
              status={req.status} 
              settlementStatus={req.settlementStatus} 
            />
          </div>
        ))}
        {requests.length === 0 && (
          <p className="text-gray-500">هیچ درخواستی وجود ندارد.</p>
        )}
      </div>
    </div>
  );
}
