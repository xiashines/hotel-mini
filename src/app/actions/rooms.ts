'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('عدم دسترسی');
  }
}

export async function createRoom(formData: FormData) {
  await checkAdmin();
  
  const name = formData.get('name') as string;
  const capacity = parseInt(formData.get('capacity') as string);
  const pricePerNight = parseInt(formData.get('pricePerNight') as string);
  const description = formData.get('description') as string;

  await prisma.room.create({
    data: {
      name,
      capacity,
      pricePerNight,
      description,
      isActive: true,
    },
  });

  revalidatePath('/admin/rooms');
  revalidatePath('/rooms');
}

export async function toggleRoomStatus(id: string, isActive: boolean) {
  await checkAdmin();
  
  await prisma.room.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath('/admin/rooms');
  revalidatePath('/rooms');
}

export async function deleteRoom(id: string) {
  await checkAdmin();
  
  const room = await prisma.room.findUnique({
    where: { id },
    include: { requestRooms: { take: 1 } }
  });

  if (!room) return { success: false, message: 'اتاق یافت نشد.' };
  
  if (room.requestRooms.length > 0) {
    return { success: false, message: 'این اتاق سابقه درخواست یا رزرو دارد و قابل حذف کامل نیست. در صورت عدم نیاز، آن را غیرفعال کنید.' };
  }

  await prisma.room.delete({
    where: { id }
  });

  revalidatePath('/admin/rooms');
  revalidatePath('/rooms');
  return { success: true };
}
