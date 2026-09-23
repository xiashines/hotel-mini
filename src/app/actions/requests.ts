'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { TravelParty, MaritalStatus } from '@prisma/client';

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('لطفاً ابتدا وارد شوید');
  }
  return session.user;
}

export async function createReservationRequest(formData: FormData) {
  const user = await getUser();
  
  const checkIn = new Date(formData.get('checkIn') as string);
  const checkOut = new Date(formData.get('checkOut') as string);
  const travelParty = formData.get('travelParty') as TravelParty;
  const maritalStatus = formData.get('maritalStatus') as MaritalStatus;
  const notes = formData.get('notes') as string;
  const roomIds = formData.getAll('roomIds') as string[];

  if (roomIds.length === 0) {
    return { success: false, message: 'حداقل یک اتاق باید انتخاب شود.' };
  }

  if (checkOut <= checkIn) {
    return { success: false, message: 'تاریخ خروج باید بعد از تاریخ ورود باشد.' };
  }

  // Create the request
  await prisma.reservationRequest.create({
    data: {
      guestId: user.id,
      checkIn,
      checkOut,
      travelParty,
      maritalStatus,
      notes,
      roomCount: roomIds.length,
      rooms: {
        create: roomIds.map(roomId => ({
          roomId
        }))
      }
    }
  });

  revalidatePath('/requests');
  redirect('/requests');
}

export async function deleteReservationRequest(requestId: string) {
  const user = await getUser();

  const request = await prisma.reservationRequest.findUnique({
    where: { id: requestId }
  });

  if (!request || request.guestId !== user.id) {
    return { success: false, message: 'درخواست یافت نشد.' };
  }

  if (request.status !== 'PENDING') {
    return { success: false, message: 'فقط درخواست‌های در انتظار بررسی قابل لغو هستند.' };
  }

  await prisma.reservationRequest.delete({
    where: { id: requestId }
  });

  revalidatePath('/requests');
  return { success: true };
}
