'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { TravelParty, MaritalStatus } from '@prisma/client';
import { createHotelCheckIn, createHotelCheckOut, getHotelTodayStart, HOTEL_TZ } from '@/lib/dateUtils';
import { formatInTimeZone } from 'date-fns-tz';

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('لطفاً ابتدا وارد شوید');
  }
  return session.user;
}

export async function createReservationRequest(formData: FormData) {
  const user = await getUser();
  
  const checkIn = createHotelCheckIn(formData.get('checkIn') as string);
  const checkOut = createHotelCheckOut(formData.get('checkOut') as string);

  const travelParty = formData.get('travelParty') as TravelParty;
  const maritalStatus = formData.get('maritalStatus') as MaritalStatus;
  const notes = formData.get('notes') as string;
  
  // Clean duplicates and validate
  const roomIds = Array.from(new Set(formData.getAll('roomIds') as string[]));

  if (roomIds.length === 0) {
    return { success: false, message: 'حداقل یک اتاق باید انتخاب شود.' };
  }

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
    return { success: false, message: 'تاریخ ورود باید قبل از تاریخ خروج باشد (حداقل یک شب اقامت).' };
  }

  if (travelParty !== 'ALONE' && travelParty !== 'FAMILY') {
    return { success: false, message: 'نوع سفر نامعتبر است.' };
  }

  if (maritalStatus !== 'SINGLE' && maritalStatus !== 'MARRIED') {
    return { success: false, message: 'وضعیت تاهل نامعتبر است.' };
  }

  // Check if rooms exist and are active
  const selectedRooms = await prisma.room.findMany({
    where: { id: { in: roomIds } }
  });

  if (selectedRooms.length !== roomIds.length) {
    return { success: false, message: 'یکی از اتاق‌های انتخابی وجود ندارد.' };
  }

  if (selectedRooms.some(r => !r.isActive)) {
    return { success: false, message: 'یکی از اتاق‌های انتخابی در حال حاضر غیرفعال است.' };
  }

  // Create the request
  await prisma.reservationRequest.create({
    data: {
      guestId: user.id,
      checkIn,
      checkOut,
      travelParty,
      maritalStatus,
      notes: notes?.substring(0, 500), // Limit notes length
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
    return { success: false, message: 'این درخواست دیگر قابل حذف نیست.' };
  }

  await prisma.reservationRequest.delete({
    where: { id: requestId }
  });

  revalidatePath('/requests');
  return { success: true };
}

export async function getAvailableRooms(checkInStr: string, checkOutStr: string) {
  const checkIn = createHotelCheckIn(checkInStr);
  const checkOut = createHotelCheckOut(checkOutStr);

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
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn }
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

export async function getFullyBookedDates() {
  const allRoomsCount = await prisma.room.count({ where: { isActive: true } });
  if (allRoomsCount === 0) return [];

  const todayStart = getHotelTodayStart();

  const futureRequests = await prisma.reservationRequest.findMany({
    where: {
      status: { in: ['APPROVED', 'PENDING'] },
      checkOut: { gt: todayStart }
    },
    include: { rooms: true }
  });

  const bookedCountsPerDay: Record<string, Set<string>> = {};

  // For each request, mark the dates between checkIn and checkOut (exclusive of checkOut day)
  futureRequests.forEach(req => {
    let currentStr = formatInTimeZone(req.checkIn, HOTEL_TZ, 'yyyy-MM-dd');
    const endStr = formatInTimeZone(req.checkOut, HOTEL_TZ, 'yyyy-MM-dd');

    const currentDate = new Date(`${currentStr}T12:00:00Z`);

    while (currentStr < endStr) {
      if (!bookedCountsPerDay[currentStr]) {
        bookedCountsPerDay[currentStr] = new Set();
      }
      req.rooms.forEach(r => bookedCountsPerDay[currentStr].add(r.roomId));
      
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      currentStr = currentDate.toISOString().split('T')[0];
    }
  });

  const fullyBookedDates = Object.keys(bookedCountsPerDay).filter(
    dateStr => bookedCountsPerDay[dateStr].size >= allRoomsCount
  );

  return fullyBookedDates;
}
