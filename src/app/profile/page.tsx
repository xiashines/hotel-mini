import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/ProfileForm';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">حساب کاربری</h1>
      
      <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <ProfileForm 
          initialName={session.user.name || ''} 
          email={session.user.email || ''} 
        />
      </div>
    </div>
  );
}
