import Link from "next/link";
import { auth } from "@/auth";
import { Hotel, Key, MapPin, CalendarDays } from "lucide-react";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">
        
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-100 to-transparent dark:from-blue-900/20 dark:to-transparent -z-10" />
        
        <div className="bg-white dark:bg-gray-900 p-4 rounded-full shadow-md mb-8 inline-block animate-bounce border border-gray-100 dark:border-gray-800">
          <Hotel className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
          به <span className="text-blue-600 dark:text-blue-400">هتل مینی</span> خوش آمدید
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          سامانه مدرن و ساده برای مدیریت درخواست‌های رزرو هتل و اقامتگاه‌های شما
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
          <Link 
            href="/rooms" 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg hover:shadow-xl font-medium text-lg w-full sm:w-auto"
          >
            <Key className="w-5 h-5" />
            مشاهده اتاق‌ها
          </Link>
          
          {user ? (
            <Link 
              href={user.role === 'ADMIN' ? '/admin' : '/requests'} 
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition shadow-sm font-medium text-lg w-full sm:w-auto"
            >
              {user.role === 'ADMIN' ? 'ورود به پنل مدیریت' : 'درخواست‌های من'}
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition shadow-sm font-medium text-lg w-full sm:w-auto"
            >
              ورود / ثبت‌نام
            </Link>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-900 py-16 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">موقعیت بی‌نظیر</h3>
              <p className="text-gray-500 dark:text-gray-400">دسترسی آسان به تمامی نقاط مهم شهر و جاذبه‌های توریستی</p>
            </div>
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-4">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">رزرو آنلاین سریع</h3>
              <p className="text-gray-500 dark:text-gray-400">امکان ثبت درخواست در هر زمان و مدیریت آسان برنامه‌های سفر</p>
            </div>
            <div className="p-6">
              <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4">
                <Hotel className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">امکانات رفاهی</h3>
              <p className="text-gray-500 dark:text-gray-400">اتاق‌های متنوع با بهترین استانداردهای کیفی برای خانواده‌ها</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
