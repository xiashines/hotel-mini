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
  
  checkIn.setHours(14, 0, 0, 0);
  checkOut.setHours(12, 0, 0, 0);

  const travelParty = formData.get('travelParty') as TravelParty;
  const maritalStatus = formData.get('maritalStatus') as MaritalStatus;
  const notes = formData.get('notes') as string;
  const roomIds = formData.getAll('roomIds') as string[];

  if (roomIds.length === 0) {
    return { success: false, message: 'حداقل یک اتاق باید انتخاب شود.' };
  }

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
    return { success: false, message: 'تاریخ خروج باید بعد از تاریخ ورود باشد (حداقل یک شب اقامت).' };
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

export async function getAvailableRooms(checkInStr: string, checkOutStr: string) {
  // Set times to strictly 14:00 (Check-in) and 12:00 (Check-out)
  const checkIn = new Date(checkInStr);
  checkIn.setHours(14, 0, 0, 0);
  
  const checkOut = new Date(checkOutStr);
  checkOut.setHours(12, 0, 0, 0);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
    return [];
  }

  // Get all active rooms
  const allRooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });

  // Get overlapping requests (both APPROVED and PENDING)
  const overlappingRequests = await prisma.reservationRequest.findMany({
    where: {
      status: { in: ['APPROVED', 'PENDING'] },
      checkIn: { lte: checkOut },
      checkOut: { gte: checkIn }
    },
    include: {
      rooms: true
    }
  });

  const bookedRoomIds = new Set<string>();
  overlappingRequests.forEach(req => {
    req.rooms.forEach(r => bookedRoomIds.add(r.roomId));
  });

  // Return rooms with availability flag
  return allRooms.map(room => ({
    ...room,
    isAvailable: !bookedRoomIds.has(room.id)
  }));
}
