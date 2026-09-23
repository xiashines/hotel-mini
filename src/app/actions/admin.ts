'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

async function getAdminUser() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('عدم دسترسی');
  }
  return session.user;
}

export async function approveRequest(requestId: string) {
  const admin = await getAdminUser();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.reservationRequest.findUnique({
        where: { id: requestId },
        include: { rooms: true }
      });

      if (!request) return { success: false, message: 'درخواست پیدا نشد.' };
      
      // Strict rule: Only PENDING can be approved
      if (request.status !== 'PENDING') {
        return { success: false, message: 'فقط درخواست‌های معلق قابل تایید هستند.' };
      }

      // Check for overlaps with APPROVED or PENDING requests for the same rooms
      const overlappingRequests = await tx.reservationRequest.findMany({
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

      // Atomic state transition using updateMany to ensure status is still PENDING
      const updateResult = await tx.reservationRequest.updateMany({
        where: { 
          id: requestId, 
          status: 'PENDING' 
        },
        data: { status: 'APPROVED' }
      });

      if (updateResult.count === 0) {
        return { success: false, message: 'خطا: وضعیت این درخواست به تازگی توسط مدیر دیگری تغییر کرده است.' };
      }

      await tx.reservation.create({
        data: {
          requestId: request.id,
          guestId: request.guestId,
          checkIn: request.checkIn,
          checkOut: request.checkOut,
        }
      });

      await tx.statusHistory.create({
        data: {
          guestId: request.guestId,
          requestId: request.id,
          field: 'REQUEST_STATUS',
          fromStatus: 'PENDING',
          toStatus: 'APPROVED',
          actorId: admin.id,
        }
      });

      return { success: true, message: 'درخواست با موفقیت تایید شد.' };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable // Guarantees no race conditions on reads/writes
    });

    revalidatePath('/admin/requests');
    revalidatePath('/admin/stays');
    return result;

  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2034') {
      // P2034 is Prisma's serialization failure code for concurrent transactions
      return { success: false, message: 'خطا: تداخل در ذخیره‌سازی، لطفاً مجدداً تلاش کنید.' };
    }
    console.error(error);
    return { success: false, message: 'خطای سیستمی رخ داد.' };
  }
}

export async function rejectRequest(requestId: string) {
  const admin = await getAdminUser();

  const request = await prisma.reservationRequest.findUnique({ where: { id: requestId } });
  if (!request) return { success: false, message: 'درخواست یافت نشد.' };
  
  if (request.status !== 'PENDING') {
    return { success: false, message: 'فقط درخواست‌های معلق قابل رد شدن هستند.' };
  }

  const updateResult = await prisma.reservationRequest.updateMany({
    where: { 
      id: requestId, 
      status: 'PENDING' 
    },
    data: { status: 'REJECTED' }
  });

  if (updateResult.count === 0) {
    return { success: false, message: 'خطا: وضعیت این درخواست به تازگی تغییر کرده است.' };
  }

  await prisma.statusHistory.create({
    data: {
      guestId: request.guestId,
      requestId: request.id,
      field: 'REQUEST_STATUS',
      fromStatus: 'PENDING',
      toStatus: 'REJECTED',
      actorId: admin.id,
    }
  });

  revalidatePath('/admin/requests');
  return { success: true, message: 'درخواست با موفقیت رد شد.' };
}

export async function toggleSettlement(requestId: string) {
  const admin = await getAdminUser();

  const result = await prisma.$transaction(async (tx) => {
    // 1. Read real status from DB (ignore client)
    const request = await tx.reservationRequest.findUnique({ 
      where: { id: requestId } 
    });
    
    if (!request) return { success: false, message: 'درخواست یافت نشد.' };

    const currentStatus = request.settlementStatus;
    const newStatus = currentStatus === 'SETTLED' ? 'UNSETTLED' : 'SETTLED';

    // 2. Update based on real DB status
    await tx.reservationRequest.update({
      where: { id: requestId },
      data: { settlementStatus: newStatus }
    });

    // 3. Write accurate history
    await tx.statusHistory.create({
      data: {
        guestId: request.guestId,
        requestId: request.id,
        field: 'SETTLEMENT',
        fromStatus: currentStatus,
        toStatus: newStatus,
        actorId: admin.id,
      }
    });

    return { success: true, message: 'وضعیت تسویه با موفقیت تغییر کرد.' };
  });

  revalidatePath('/admin/requests');
  revalidatePath('/admin/customers');
  return result;
}

export async function cancelApprovedRequest(requestId: string) {
  const admin = await getAdminUser();

  const result = await prisma.$transaction(async (tx) => {
    const request = await tx.reservationRequest.findUnique({
      where: { id: requestId },
      include: { reservation: true }
    });

    if (!request) return { success: false, message: 'درخواست یافت نشد.' };
    
    if (request.status !== 'APPROVED') {
      return { success: false, message: 'فقط درخواست‌های تایید شده قابل لغو هستند.' };
    }

    const updateResult = await tx.reservationRequest.updateMany({
      where: { 
        id: requestId,
        status: 'APPROVED'
      },
      data: { status: 'REJECTED' }
    });

    if (updateResult.count === 0) {
      return { success: false, message: 'خطا: وضعیت این درخواست به تازگی تغییر کرده است.' };
    }

    if (request.reservation) {
      await tx.reservation.delete({
        where: { id: request.reservation.id }
      });
    }

    await tx.statusHistory.create({
      data: {
        guestId: request.guestId,
        requestId: request.id,
        field: 'REQUEST_STATUS',
        fromStatus: 'APPROVED',
        toStatus: 'REJECTED',
        note: 'لغو اقامت توسط مدیر',
        actorId: admin.id,
      }
    });

    return { success: true, message: 'اقامت با موفقیت لغو شد.' };
  });

  revalidatePath('/admin/requests');
  revalidatePath('/admin/stays');
  return result;
}
