import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">به هتل مینی خوش آمدید</h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          سامانه ساده مدیریت درخواست‌های رزرو هتل
        </p>
        
        <div className="flex gap-4 justify-center mt-8">
          <Link 
            href="/rooms" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            مشاهده اتاق‌ها
          </Link>
          <Link 
            href="/login" 
            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-gray-50 transition"
          >
            ورود / ثبت‌نام
          </Link>
        </div>
      </div>
    </div>
  );
}
