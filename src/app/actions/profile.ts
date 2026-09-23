'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, message: 'لطفاً وارد شوید.' };
  }

  const name = formData.get('name') as string;
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!name || name.trim() === '') {
    return { success: false, message: 'نام نمی‌تواند خالی باشد.' };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return { success: false, message: 'کاربر یافت نشد.' };

  const dataToUpdate: Record<string, string> = { name };

  // If trying to update password
  if (currentPassword && newPassword) {
    if (newPassword.length < 8) {
      return { success: false, message: 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد.' };
    }
    
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return { success: false, message: 'رمز عبور فعلی نادرست است.' };
    }
    
    const newHash = await bcrypt.hash(newPassword, 10);
    dataToUpdate.passwordHash = newHash;
  }

  await prisma.user.update({
    where: { email: user.email },
    data: dataToUpdate
  });

  revalidatePath('/profile');
  return { success: true, message: 'پروفایل با موفقیت بروزرسانی شد.' };
}
