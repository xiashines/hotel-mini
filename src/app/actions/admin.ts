'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { RequestStatus, SettlementStatus, HistoryField } from '@prisma/client';

async function getAdminUser() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('عدم دسترسی');
  }
  return session.user;
}

export async function approveRequest(requestId: string) {
  const admin = await getAdminUser();

  const request = await prisma.reservationRequest.findUnique({
    where: { id: requestId },
    include: { rooms: true }
  });

  if (!request) return { success: false, message: 'درخواست یافت نشد.' };
  if (request.status === 'APPROVED') return { success: false, message: 'این درخواست قبلاً تأیید شده است.' };

  // Check for overlaps
  const overlappingReservations = await prisma.reservation.findMany({
    where: {
      checkIn: { lte: request.checkOut },
      checkOut: { gte: request.checkIn },
      request: {
        rooms: {
          some: {
            roomId: { in: request.rooms.map(r => r.roomId) }
          }
        }
      }
    }
  });

  if (overlappingReservations.length > 0) {
    return { success: false, message: 'خطا: این اتاق‌ها در تاریخ‌های انتخابی با رزرو دیگری تداخل دارند.' };
  }

  // Transaction for safe approve
  await prisma.$transaction([
    prisma.reservationRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' }
    }),
    prisma.reservation.create({
      data: {
        requestId: request.id,
        guestId: request.guestId,
        checkIn: request.checkIn,
        checkOut: request.checkOut,
      }
    }),
    prisma.statusHistory.create({
      data: {
        guestId: request.guestId,
        requestId: request.id,
        field: 'REQUEST_STATUS',
        fromStatus: request.status,
        toStatus: 'APPROVED',
        actorId: admin.id,
      }
    })
  ]);

  revalidatePath('/admin/requests');
  revalidatePath('/admin/stays');
  return { success: true, message: 'تأیید با موفقیت انجام شد.' };
}

export async function rejectRequest(requestId: string) {
  const admin = await getAdminUser();

  const request = await prisma.reservationRequest.findUnique({ where: { id: requestId } });
  if (!request) return;

  await prisma.$transaction([
    prisma.reservationRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    }),
    prisma.statusHistory.create({
      data: {
        guestId: request.guestId,
        requestId: request.id,
        field: 'REQUEST_STATUS',
        fromStatus: request.status,
        toStatus: 'REJECTED',
        actorId: admin.id,
      }
    })
  ]);

  revalidatePath('/admin/requests');
}

export async function toggleSettlement(requestId: string, currentStatus: SettlementStatus) {
  const admin = await getAdminUser();

  const newStatus = currentStatus === 'SETTLED' ? 'UNSETTLED' : 'SETTLED';
  
  const request = await prisma.reservationRequest.findUnique({ where: { id: requestId } });
  if (!request) return;

  await prisma.$transaction([
    prisma.reservationRequest.update({
      where: { id: requestId },
      data: { settlementStatus: newStatus }
    }),
    prisma.statusHistory.create({
      data: {
        guestId: request.guestId,
        requestId: request.id,
        field: 'SETTLEMENT',
        fromStatus: currentStatus,
        toStatus: newStatus,
        actorId: admin.id,
      }
    })
  ]);

  revalidatePath('/admin/requests');
  revalidatePath('/admin/customers');
}

export async function cancelApprovedRequest(requestId: string) {
  const admin = await getAdminUser();

  const request = await prisma.reservationRequest.findUnique({
    where: { id: requestId },
    include: { reservation: true }
  });

  if (!request) return { success: false, message: 'درخواست یافت نشد.' };
  if (request.status !== 'APPROVED') return { success: false, message: 'فقط درخواست‌های تأیید شده قابل ابطال هستند.' };

  await prisma.$transaction(async (tx) => {
    // Delete the reservation to free up the rooms
    if (request.reservation) {
      await tx.reservation.delete({
        where: { id: request.reservation.id }
      });
    }

    // Update request status
    await tx.reservationRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    });

    // Add to history
    await tx.statusHistory.create({
      data: {
        guestId: request.guestId,
        requestId: request.id,
        field: 'REQUEST_STATUS',
        fromStatus: 'APPROVED',
        toStatus: 'REJECTED',
        note: 'ابطال توسط مدیر',
        actorId: admin.id,
      }
    });
  });

  revalidatePath('/admin/requests');
  revalidatePath('/admin/stays');
  return { success: true, message: 'رزرو با موفقیت باطل شد.' };
}
