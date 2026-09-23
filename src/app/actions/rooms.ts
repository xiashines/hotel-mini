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
