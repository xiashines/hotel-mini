import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 10)

  // Seed Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hotel.local' },
    update: {},
    create: {
      email: 'admin@hotel.local',
      name: 'مدیر هتل',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  })
  console.log(`Created admin user: ${admin.email}`)

  // Seed Rooms
  const rooms = [
    {
      name: 'اتاق یک تخته',
      capacity: 1,
      pricePerNight: 500000,
      description: 'اتاق دنج برای یک نفر',
    },
    {
      name: 'اتاق دو تخته توئین',
      capacity: 2,
      pricePerNight: 800000,
      description: 'اتاق با دو تخت یک نفره مجزا',
    },
    {
      name: 'اتاق دو تخته دبل',
      capacity: 2,
      pricePerNight: 850000,
      description: 'اتاق با یک تخت دو نفره',
    },
    {
      name: 'سوئیت خانوادگی',
      capacity: 4,
      pricePerNight: 1500000,
      description: 'فضای بزرگ برای خانواده با امکانات کامل',
    },
  ]

  for (const room of rooms) {
    await prisma.room.create({
      data: room,
    })
  }
  console.log(`Created ${rooms.length} sample rooms`)

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
