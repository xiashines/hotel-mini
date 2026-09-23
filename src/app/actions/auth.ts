'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function login(prevState: unknown, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });
    return { success: true, message: 'ورود موفقیت‌آمیز بود' };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, message: 'ایمیل یا رمز عبور اشتباه است.' };
        default:
          return { success: false, message: 'خطای ناشناخته‌ای رخ داد.' };
      }
    }
    throw error;
  }
}

export async function register(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password || !name) {
    return { success: false, message: 'لطفاً تمامی فیلدها را پر کنید.' };
  }

  if (password.length < 8) {
    return { success: false, message: 'رمز عبور باید حداقل ۸ کاراکتر باشد.' };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { success: false, message: 'این ایمیل قبلاً ثبت نام کرده است.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: 'GUEST',
    },
  });

  return { success: true, message: 'ثبت‌نام با موفقیت انجام شد. لطفاً وارد شوید.' };
}

export async function logOut() {
  await signOut({ redirectTo: '/' });
}
