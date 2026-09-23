'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { SettlementStatus } from '@prisma/client';

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

  if (!request) return { success: false, message: 'درخواست پیدا نشد.' };
  if (request.status === 'APPROVED') return { success: false, message: 'این درخواست از قبل تایید شده است.' };

  // Check for overlaps with APPROVED or PENDING requests for the same rooms
  const overlappingRequests = await prisma.reservationRequest.findMany({
    where: {
      id: { not: requestId },
      status: { in: ['APPROVED', 'PENDING'] },
      checkIn: { lt: request.checkOut },
      checkOut: { gt: request.checkIn },
      rooms: {
        some: {
          roomId: { in: request.rooms.map(r => r.roomId) }
        }
      }
    }
  });

  if (overlappingRequests.length > 0) {
    return { success: false, message: 'خطا: این اتاق‌ها در این تاریخ‌ها توسط فرد دیگری رزرو یا درحال بررسی هستند.' };
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
  return { success: true, message: 'درخواست با موفقیت تایید شد.' };
}

export async function rejectRequest(requestId: string) {
  const admin = await getAdminUser();

  const request = await prisma.reservationRequest.findUnique({ where: { id: requestId } });
  if (!request) return { success: false, message: 'درخواست یافت نشد.' };
  if (request.status !== 'PENDING') return { success: false, message: 'فقط درخواست‌های معلق قابل رد شدن هستند.' };

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
  return { success: true, message: 'درخواست با موفقیت رد شد.' };
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
  if (request.status !== 'APPROVED') return { success: false, message: 'این درخواست هنوز تایید نشده است.' };

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
        note: 'لغو توسط مدیر',
        actorId: admin.id,
      }
    });
  });

  revalidatePath('/admin/requests');
  revalidatePath('/admin/stays');
  return { success: true, message: 'اقامت با موفقیت لغو شد.' };
}
