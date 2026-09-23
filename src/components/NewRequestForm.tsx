'use client';

import { useState, useEffect } from 'react';
import { createReservationRequest, getAvailableRooms, getFullyBookedDates } from '@/app/actions/requests';
import { Room } from '@prisma/client';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

export function NewRequestForm({ initialRooms }: { initialRooms: Room[] }) {
  const [checkIn, setCheckIn] = useState<DateObject | null>(null);
  const [checkOut, setCheckOut] = useState<DateObject | null>(null);
  const [rooms, setRooms] = useState<(Room & { isAvailable?: boolean })[]>(initialRooms.map(r => ({ ...r, isAvailable: true })));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  useEffect(() => {
    getFullyBookedDates().then(dates => setBookedDates(dates));
  }, []);

  useEffect(() => {
    async function checkAvailability() {
      if (checkIn && checkOut && checkIn.toDate() < checkOut.toDate()) {
        const checkInIso = checkIn.toDate().toISOString();
        const checkOutIso = checkOut.toDate().toISOString();
        const availableRooms = await getAvailableRooms(checkInIso, checkOutIso);
        setRooms(availableRooms);
      } else {
        setRooms(initialRooms.map(r => ({ ...r, isAvailable: true })));
      }
    }
    checkAvailability();
  }, [checkIn, checkOut, initialRooms]);

  async function handleSubmit(formData: FormData) {
    if (!checkIn || !checkOut) {
      setError('لطفاً تاریخ ورود و خروج را انتخاب کنید.');
      return;
    }
    
    formData.set('checkIn', checkIn.toDate().toISOString());
    formData.set('checkOut', checkOut.toDate().toISOString());

    setLoading(true);
    setError(null);
    try {
      const res = await createReservationRequest(formData);
      if (res && res.success === false) {
        setError(res.message);
        setLoading(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message !== 'NEXT_REDIRECT') {
          setError(err.message || 'خطایی رخ داد.');
        }
      }
      setLoading(false);
    }
  }

  const now = new Date();
  const minDateForCheckIn = new Date();
  if (now.getHours() >= 12) {
    minDateForCheckIn.setDate(minDateForCheckIn.getDate() + 1);
  }

  // Define proper DateObject type instead of any
  const mapDays = ({ date }: { date: DateObject }) => {
    const isoDate = date.toDate().toISOString().split('T')[0];
    if (bookedDates.includes(isoDate)) {
      return {
        disabled: true,
        style: { color: "#ccc", textDecoration: "line-through" },
        title: "ظرفیت هتل تکمیل است"
      };
    }
    return {};
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">تاریخ ورود (ساعت ۱۴:۰۰)</label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={checkIn}
            onChange={setCheckIn}
            minDate={minDateForCheckIn}
            mapDays={mapDays}
            inputClass="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-left transition"
            containerClassName="w-full"
            placeholder="انتخاب تاریخ..."
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">تاریخ خروج (ساعت ۱۲:۰۰)</label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={checkOut}
            onChange={setCheckOut}
            minDate={checkIn ? new Date(checkIn.toDate().getTime() + 24 * 60 * 60 * 1000) : new Date(minDateForCheckIn.getTime() + 24 * 60 * 60 * 1000)}
            mapDays={mapDays}
            disabled={!checkIn}
            inputClass="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-left transition disabled:opacity-50 disabled:cursor-not-allowed"
            containerClassName="w-full"
            placeholder={checkIn ? "انتخاب تاریخ..." : "ابتدا تاریخ ورود را انتخاب کنید"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نوع سفر</label>
          <select name="travelParty" required className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition">
            <option value="ALONE">مجردی</option>
            <option value="FAMILY">با خانواده</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">وضعیت تاهل</label>
          <select name="maritalStatus" required className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition">
            <option value="SINGLE">مجرد</option>
            <option value="MARRIED">متاهل</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">انتخاب اتاق‌ها (یک یا چند)</label>
        <div className="space-y-3 border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 max-h-60 overflow-y-auto">
          {rooms.map(room => (
            <label 
              key={room.id} 
              className={`flex items-center space-x-3 space-x-reverse cursor-pointer p-3 rounded border transition ${
                room.isAvailable 
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700' 
                  : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed'
              }`}
            >
              <input 
                type="checkbox" 
                name="roomIds" 
                value={room.id} 
                disabled={!room.isAvailable}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 disabled:opacity-50" 
              />
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium text-gray-900 dark:text-white">{room.name}</span>
                  {!room.isAvailable && (
                    <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded font-medium">رزرو شده</span>
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">ظرفیت {room.capacity} نفر | {room.pricePerNight.toLocaleString()} تومان</span>
              </div>
            </label>
          ))}
          {rooms.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">هیچ اتاقی فعلاً تعریف نشده است.</p>
          )}
        </div>
        {(!checkIn || !checkOut) && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">جهت بررسی دقیق ظرفیت، لطفاً تاریخ ورود و خروج را مشخص کنید.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">توضیحات بیشتر (اختیاری)</label>
        <textarea name="notes" rows={3} className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="اگر درخواستی دارید اینجا بنویسید..."></textarea>
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold text-lg shadow-sm disabled:opacity-50">
        {loading ? 'در حال ثبت...' : 'ثبت درخواست رزرو'}
      </button>
    </form>
  );
}
