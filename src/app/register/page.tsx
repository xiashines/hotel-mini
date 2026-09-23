'use client';

import { useState } from 'react';
import { register } from '@/app/actions/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await register(null, formData);

    if (res.success) {
      window.location.href = '/login?registered=true';
    } else {
      setError(res.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">ثبت نام در هتل مینی</h1>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نام و نام خانوادگی</label>
            <input 
              name="name" 
              type="text" 
              required 
              className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ایمیل</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left transition" dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">رمز عبور</label>
            <input 
              name="password" 
              type="password" 
              required 
              minLength={8}
              className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left transition" dir="ltr"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">حداقل ۸ کاراکتر</p>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-sm font-medium"
          >
            {loading ? 'در حال ثبت...' : 'ثبت نام'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600 dark:text-gray-400">
          قبلاً ثبت نام کرده‌اید؟ <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">وارد شوید</Link>
        </p>
      </div>
    </div>
  );
}
