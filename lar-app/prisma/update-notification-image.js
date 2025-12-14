const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // 1. Cấu hình thông tin cần thay đổi
  const titleToFind = 'Valentine cùng Mini App' // Tiêu đề thông báo cần tìm
  const newImageUrl = 'https://larai.vn/images/banner-lar.png' // URL hình ảnh mới (Logo LAR)

  console.log(`Đang tìm thông báo có tiêu đề: "${titleToFind}"...`)

  // 2. Tìm thông báo trong database
  const notification = await prisma.notification.findFirst({
    where: { 
      title: { 
        contains: titleToFind,
        mode: 'insensitive' // Tìm kiếm không phân biệt hoa thường
      } 
    }
  })

  if (!notification) {
    console.log(`❌ Không tìm thấy thông báo nào có tiêu đề chứa "${titleToFind}".`)
    console.log('Vui lòng kiểm tra lại tiêu đề hoặc database.')
    return
  }

  console.log(`✅ Đã tìm thấy thông báo:`)
  console.log(`   - ID: ${notification.id}`)
  console.log(`   - Tiêu đề: ${notification.title}`)
  console.log(`   - Hình ảnh hiện tại: ${notification.image}`)

  // 3. Cập nhật hình ảnh
  const updated = await prisma.notification.update({
    where: { id: notification.id },
    data: { image: newImageUrl }
  })

  console.log(`\n✅ Đã cập nhật hình ảnh thành công!`)
  console.log(`   - Hình ảnh mới: ${updated.image}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
