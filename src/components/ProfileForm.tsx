'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/actions/profile';

export function ProfileForm({ initialName, email }: { initialName: string, email: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    
    const res = await updateProfile(formData);
    
    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      // Clear password fields by resetting form or we just let it be, 
      // ideally we should clear them, but using uncontrolled inputs in Server Actions 
      // makes it a bit tricky without a form ref. We'll leave it simple for now.
    } else {
      setMessage({ type: 'error', text: res.message });
    }
    
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg text-sm border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ایمیل (غیرقابل تغییر)</label>
        <input 
          type="email" 
          value={email} 
          disabled 
          className="w-full border dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg p-2.5 cursor-not-allowed" dir="ltr" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نام و نام خانوادگی</label>
        <input 
          name="name" 
          type="text" 
          defaultValue={initialName}
          required 
          className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition" 
        />
      </div>

      <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">تغییر رمز عبور (اختیاری)</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">رمز عبور فعلی</label>
            <input 
              name="currentPassword" 
              type="password" 
              className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition text-left" dir="ltr" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">رمز عبور جدید</label>
            <input 
              name="newPassword" 
              type="password" 
              className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition text-left" dir="ltr" 
            />
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold text-lg shadow-sm disabled:opacity-50"
      >
        {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </button>
    </form>
  );
}
