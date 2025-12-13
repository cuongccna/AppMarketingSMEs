import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding rewards...')

  // 1. Find the first location
  const location = await prisma.location.findFirst()

  if (!location) {
    console.log('No location found. Please create a location first.')
    return
  }

  console.log(`Found location: ${location.name} (${location.id})`)

  // 2. Create Rewards
  const rewards = [
    {
      name: 'Voucher giảm giá 50k',
      description: 'Áp dụng cho hóa đơn từ 200k',
      pointsRequired: 50,
      image: 'https://img.icons8.com/fluency/96/coupon.png',
      locationId: location.id,
    },
    {
      name: 'Cà phê miễn phí',
      description: 'Một ly cà phê đá hoặc sữa đá',
      pointsRequired: 100,
      image: 'https://img.icons8.com/fluency/96/coffee.png',
      locationId: location.id,
    },
    {
      name: 'Túi Tote Canvas',
      description: 'Túi vải thời trang thân thiện môi trường',
      pointsRequired: 200,
      image: 'https://img.icons8.com/fluency/96/shopping-bag.png',
      locationId: location.id,
    },
    {
      name: 'Combo Bánh + Nước',
      description: 'Một phần bánh ngọt và một ly nước bất kỳ',
      pointsRequired: 300,
      image: 'https://img.icons8.com/fluency/96/cake.png',
      locationId: location.id,
    }
  ]

  for (const r of rewards) {
    const reward = await prisma.reward.create({
      data: r
    })
    console.log(`Created reward: ${reward.name}`)
  }

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
