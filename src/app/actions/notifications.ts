'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getPendingRequestsCount() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return 0;
  }
  
  const count = await prisma.reservationRequest.count({
    where: { status: 'PENDING' }
  });
  
  return count;
}
